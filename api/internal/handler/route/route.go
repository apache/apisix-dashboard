/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package route

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os/exec"
	"reflect"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/shiningrush/droplet"
	"github.com/shiningrush/droplet/data"
	"github.com/shiningrush/droplet/wrapper"
	wgin "github.com/shiningrush/droplet/wrapper/gin"

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/apisix/manager-api/internal/handler"
	"github.com/apisix/manager-api/internal/utils"
	"github.com/apisix/manager-api/internal/utils/consts"
)

type Handler struct {
	routeStore    store.Interface
	svcStore      store.Interface
	upstreamStore store.Interface
	scriptStore   store.Interface
}

func NewHandler() (handler.RouteRegister, error) {
	return &Handler{
		routeStore:    store.GetStore(store.HubKeyRoute),
		svcStore:      store.GetStore(store.HubKeyService),
		upstreamStore: store.GetStore(store.HubKeyUpstream),
		scriptStore:   store.GetStore(store.HubKeyScript),
	}, nil
}

func (h *Handler) ApplyRoute(r *gin.Engine) {
	r.GET("/apisix/admin/routes/:id", wgin.Wraps(h.Get,
		wrapper.InputType(reflect.TypeOf(GetInput{}))))
	r.GET("/apisix/admin/routes", wgin.Wraps(h.List,
		wrapper.InputType(reflect.TypeOf(ListInput{}))))
	r.POST("/apisix/admin/routes", wgin.Wraps(h.Create,
		wrapper.InputType(reflect.TypeOf(entity.Route{}))))
	r.PUT("/apisix/admin/routes/:id", wgin.Wraps(h.Update,
		wrapper.InputType(reflect.TypeOf(UpdateInput{}))))
	r.DELETE("/apisix/admin/routes/:ids", wgin.Wraps(h.BatchDelete,
		wrapper.InputType(reflect.TypeOf(BatchDelete{}))))

	r.GET("/apisix/admin/notexist/routes", consts.ErrorWrapper(Exist))
}

type GetInput struct {
	ID string `auto_read:"id,path" validate:"required"`
}

func (h *Handler) Get(c droplet.Context) (interface{}, error) {
	input := c.Input().(*GetInput)

	r, err := h.routeStore.Get(input.ID)
	if err != nil {
		return nil, err
	}

	//format respond
	route := r.(*entity.Route)
	script, _ := h.scriptStore.Get(input.ID)
	if script != nil {
		route.Script = script.(*entity.Script).Script
	}

	return route, nil
}

type ListInput struct {
	Name string `auto_read:"name,query"`
	data.Pager
}

func (h *Handler) List(c droplet.Context) (interface{}, error) {
	input := c.Input().(*ListInput)

	ret, err := h.routeStore.List(store.ListInput{
		Predicate: func(obj interface{}) bool {
			if input.Name != "" {
				return strings.Index(obj.(*entity.Route).Name, input.Name) > 0
			}
			return true
		},
		PageSize:   input.PageSize,
		PageNumber: input.PageNumber,
	})
	if err != nil {
		return nil, err
	}

	//format respond
	var route *entity.Route
	for i, item := range ret.Rows {
		route = item.(*entity.Route)
		script, _ := h.scriptStore.Get(route.ID)
		if script != nil {
			route.Script = script.(*entity.Script).Script
		}
		ret.Rows[i] = route
	}

	return ret, nil
}

func generateLuaCode(script map[string]interface{}) (string, error) {
	scriptString, err := json.Marshal(script)
	if err != nil {
		return "", err
	}

	cmd := exec.Command("sh", "-c",
		"cd /go/manager-api/dag-to-lua/ && lua cli.lua "+
			"'"+string(scriptString)+"'")

	stdout, _ := cmd.StdoutPipe()
	defer stdout.Close()
	if err := cmd.Start(); err != nil {
		return "", err
	}

	result, _ := ioutil.ReadAll(stdout)
	resData := string(result)

	return resData, nil
}

func (h *Handler) Create(c droplet.Context) (interface{}, error) {
	input := c.Input().(*entity.Route)
	//check depend
	if input.ServiceID != "" {
		_, err := h.upstreamStore.Get(input.ServiceID)
		if err != nil {
			if err == data.ErrNotFound {
				return nil, fmt.Errorf("service id: %s not found", input.ServiceID)
			}
			return nil, err
		}
	}
	if input.UpstreamID != "" {
		_, err := h.upstreamStore.Get(input.ServiceID)
		if err != nil {
			if err == data.ErrNotFound {
				return nil, fmt.Errorf("upstream id: %s not found", input.UpstreamID)
			}
			return nil, err
		}
	}

	if input.Script != nil {
		if input.ID == "" {
			input.ID = utils.GetFlakeUidStr()
		}
		script := &entity.Script{}
		script.ID = input.ID
		script.Script = input.Script
		//to lua
		var err error
		input.Script, err = generateLuaCode(input.Script.(map[string]interface{}))
		if err != nil {
			return nil, err
		}
		//save original conf
		if err = h.scriptStore.Create(c.Context(), script); err != nil {
			return nil, err
		}
	}

	if err := h.routeStore.Create(c.Context(), input); err != nil {
		return nil, err
	}

	return nil, nil
}

type UpdateInput struct {
	ID string `auto_read:"id,path"`
	entity.Route
}

func (h *Handler) Update(c droplet.Context) (interface{}, error) {
	input := c.Input().(*UpdateInput)
	input.Route.ID = input.ID

	//check depend
	if input.ServiceID != "" {
		_, err := h.upstreamStore.Get(input.ServiceID)
		if err != nil {
			if err == data.ErrNotFound {
				return nil, fmt.Errorf("service id: %s not found", input.ServiceID)
			}
			return nil, err
		}
	}
	if input.UpstreamID != "" {
		_, err := h.upstreamStore.Get(input.ServiceID)
		if err != nil {
			if err == data.ErrNotFound {
				return nil, fmt.Errorf("upstream id: %s not found", input.UpstreamID)
			}
			return nil, err
		}
	}

	if input.Script != nil {
		script := entity.Script{}
		script.ID = input.ID
		script.Script = input.Script
		//to lua
		var err error
		input.Route.Script, err = generateLuaCode(input.Script.(map[string]interface{}))
		if err != nil {
			return nil, err
		}
		//save original conf
		if err = h.scriptStore.Create(c.Context(), script); err != nil {
			return nil, err
		}
	}

	if err := h.routeStore.Update(c.Context(), &input.Route); err != nil {
		return nil, err
	}

	return nil, nil
}

type BatchDelete struct {
	IDs string `auto_read:"ids,path"`
}

func (h *Handler) BatchDelete(c droplet.Context) (interface{}, error) {
	input := c.Input().(*BatchDelete)

	if err := h.routeStore.BatchDelete(c.Context(), strings.Split(input.IDs, ",")); err != nil {
		return nil, err
	}

	return nil, nil
}

type ExistInput struct {
	Name string `auto_read:"name,query"`
}

func toRows(list *store.ListOutput) []store.Row {
	rows := make([]store.Row, list.TotalSize)
	for i := range list.Rows {
		rows[i] = list.Rows[i].(*entity.Route)
	}
	return rows
}

func Exist(c *gin.Context) (interface{}, error) {
	//input := c.Input().(*ExistInput)

	//temporary
	name := c.Query("name")
	exclude := c.Query("exclude")
	routeStore := store.GetStore(store.HubKeyRoute)

	ret, err := routeStore.List(store.ListInput{
		Predicate:  nil,
		PageSize:   0,
		PageNumber: 0,
	})

	if err != nil {
		return nil, err
	}

	sort := store.NewSort(nil)
	filter := store.NewFilter([]string{"name", name})
	pagination := store.NewPagination(0, 0)
	query := store.NewQuery(sort, filter, pagination)
	rows := store.NewFilterSelector(toRows(ret), query)

	if len(rows) > 0 {
		r := rows[0].(*entity.Route)
		if r.ID != exclude {
			return nil, consts.InvalidParam("Route name is reduplicate")
		}
	}

	return nil, nil
}
