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
package upstream

import (
	"net/http"
	"reflect"
	"strings"

	"github.com/api7/go-jsonpatch"
	"github.com/gin-gonic/gin"
	"github.com/shiningrush/droplet"
	"github.com/shiningrush/droplet/data"
	"github.com/shiningrush/droplet/wrapper"
	wgin "github.com/shiningrush/droplet/wrapper/gin"

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/apisix/manager-api/internal/handler"
	"github.com/apisix/manager-api/internal/utils/consts"
)

type Handler struct {
	upstreamStore store.Interface
}

func NewHandler() (handler.RouteRegister, error) {
	return &Handler{
		upstreamStore: store.GetStore(store.HubKeyUpstream),
	}, nil
}

func (h *Handler) ApplyRoute(r *gin.Engine) {
	r.GET("/apisix/admin/upstreams/:id", wgin.Wraps(h.Get,
		wrapper.InputType(reflect.TypeOf(GetInput{}))))
	r.GET("/apisix/admin/upstreams", wgin.Wraps(h.List,
		wrapper.InputType(reflect.TypeOf(ListInput{}))))
	r.POST("/apisix/admin/upstreams", wgin.Wraps(h.Create,
		wrapper.InputType(reflect.TypeOf(entity.Upstream{}))))
	r.PUT("/apisix/admin/upstreams", wgin.Wraps(h.Update,
		wrapper.InputType(reflect.TypeOf(UpdateInput{}))))
	r.PUT("/apisix/admin/upstreams/:id", wgin.Wraps(h.Update,
		wrapper.InputType(reflect.TypeOf(UpdateInput{}))))
	r.PATCH("/apisix/admin/upstreams/:id", wgin.Wraps(h.Patch,
		wrapper.InputType(reflect.TypeOf(UpdateInput{}))))
	r.DELETE("/apisix/admin/upstreams/:ids", wgin.Wraps(h.BatchDelete,
		wrapper.InputType(reflect.TypeOf(BatchDelete{}))))

	r.GET("/apisix/admin/notexist/upstreams", consts.ErrorWrapper(Exist))
	r.GET("/apisix/admin/names/upstreams", consts.ErrorWrapper(listUpstreamNames))
}

type GetInput struct {
	ID string `auto_read:"id,path" validate:"required"`
}

func (h *Handler) Get(c droplet.Context) (interface{}, error) {
	input := c.Input().(*GetInput)

	r, err := h.upstreamStore.Get(input.ID)
	if err != nil {
		return handler.SpecCodeResponse(err), err
	}

	upstream := r.(*entity.Upstream)
	upstream.Nodes = entity.NodesFormat(upstream.Nodes)

	return r, nil
}

type ListInput struct {
	Name string `auto_read:"name,query"`
	store.Pagination
}

// swagger:operation GET /apisix/admin/upstreams getUpstreamList
//
// Return the upstream list according to the specified page number and page size, and can search upstreams by name.
//
// ---
// produces:
// - application/json
// parameters:
// - name: page
//   in: query
//   description: page number
//   required: false
//   type: integer
// - name: page_size
//   in: query
//   description: page size
//   required: false
//   type: integer
// - name: name
//   in: query
//   description: name of upstream
//   required: false
//   type: string
// responses:
//   '0':
//     description: list response
//     schema:
//       type: array
//       items:
//         "$ref": "#/definitions/upstream"
//   default:
//     description: unexpected error
//     schema:
//       "$ref": "#/definitions/ApiError"
func (h *Handler) List(c droplet.Context) (interface{}, error) {
	input := c.Input().(*ListInput)

	ret, err := h.upstreamStore.List(store.ListInput{
		Predicate: func(obj interface{}) bool {
			if input.Name != "" {
				return strings.Contains(obj.(*entity.Upstream).Name, input.Name)
			}
			return true
		},
		Format: func(obj interface{}) interface{} {
			upstream := obj.(*entity.Upstream)
			upstream.Nodes = entity.NodesFormat(upstream.Nodes)
			return upstream
		},
		PageSize:   input.PageSize,
		PageNumber: input.PageNumber,
	})
	if err != nil {
		return nil, err
	}

	return ret, nil
}

func (h *Handler) Create(c droplet.Context) (interface{}, error) {
	input := c.Input().(*entity.Upstream)

	if err := h.upstreamStore.Create(c.Context(), input); err != nil {
		return handler.SpecCodeResponse(err), err
	}

	return nil, nil
}

type UpdateInput struct {
	ID string `auto_read:"id,path"`
	entity.Upstream
}

func (h *Handler) Update(c droplet.Context) (interface{}, error) {
	input := c.Input().(*UpdateInput)

	// check if ID in body is equal ID in path
	if err := handler.IDCompare(input.ID, input.Upstream.ID); err != nil {
		return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest}, err
	}

	if input.ID != "" {
		input.Upstream.ID = input.ID
	}

	if err := h.upstreamStore.Update(c.Context(), &input.Upstream, true); err != nil {
		return handler.SpecCodeResponse(err), err
	}

	return nil, nil
}

type BatchDelete struct {
	IDs string `auto_read:"ids,path"`
}

func (h *Handler) BatchDelete(c droplet.Context) (interface{}, error) {
	input := c.Input().(*BatchDelete)

	if err := h.upstreamStore.BatchDelete(c.Context(), strings.Split(input.IDs, ",")); err != nil {
		return handler.SpecCodeResponse(err), err
	}

	return nil, nil
}

func (h *Handler) Patch(c droplet.Context) (interface{}, error) {
	input := c.Input().(*UpdateInput)
	arr := strings.Split(input.ID, "/")
	var subPath string
	if len(arr) > 1 {
		input.ID = arr[0]
		subPath = arr[1]
	}

	stored, err := h.upstreamStore.Get(input.ID)
	if err != nil {
		return handler.SpecCodeResponse(err), err
	}

	var patch jsonpatch.Patch
	if subPath != "" {
		patch = jsonpatch.Patch{
			Operations: []jsonpatch.PatchOperation{
				{Op: jsonpatch.Replace, Path: subPath, Value: c.Input()},
			},
		}
	} else {
		patch, err = jsonpatch.MakePatch(stored, input.Upstream)
		if err != nil {
			return handler.SpecCodeResponse(err), err
		}
	}

	if err := patch.Apply(&stored); err != nil {
		return handler.SpecCodeResponse(err), err
	}

	if err := h.upstreamStore.Update(c.Context(), &stored, false); err != nil {
		return handler.SpecCodeResponse(err), err
	}

	return nil, nil
}

type ExistInput struct {
	Name string `auto_read:"name,query"`
}

func toRows(list *store.ListOutput) []store.Row {
	rows := make([]store.Row, list.TotalSize)
	for i := range list.Rows {
		rows[i] = list.Rows[i].(*entity.Upstream)
	}
	return rows
}

func Exist(c *gin.Context) (interface{}, error) {
	//input := c.Input().(*ExistInput)

	//temporary
	name := c.Query("name")
	exclude := c.Query("exclude")
	routeStore := store.GetStore(store.HubKeyUpstream)

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
		r := rows[0].(*entity.Upstream)
		if r.ID != exclude {
			return nil, consts.InvalidParam("Upstream name is reduplicate")
		}
	}

	return nil, nil
}

func listUpstreamNames(c *gin.Context) (interface{}, error) {
	routeStore := store.GetStore(store.HubKeyUpstream)

	ret, err := routeStore.List(store.ListInput{
		Predicate:  nil,
		PageSize:   0,
		PageNumber: 0,
	})

	if err != nil {
		return nil, err
	}

	rows := make([]interface{}, ret.TotalSize)
	for i := range ret.Rows {
		row := ret.Rows[i].(*entity.Upstream)
		rows[i], _ = row.Parse2NameResponse()
	}

	output := &store.ListOutput{
		Rows:      rows,
		TotalSize: ret.TotalSize,
	}

	return output, nil
}
