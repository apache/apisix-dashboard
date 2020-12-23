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
	"bufio"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os/exec"
	"reflect"
	"regexp"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"

	"github.com/gin-gonic/gin"
	"github.com/shiningrush/droplet"
	"github.com/shiningrush/droplet/data"
	"github.com/shiningrush/droplet/wrapper"
	wgin "github.com/shiningrush/droplet/wrapper/gin"

	"github.com/apisix/manager-api/conf"
	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/apisix/manager-api/internal/handler"
	"github.com/apisix/manager-api/internal/utils"
	"github.com/apisix/manager-api/internal/utils/consts"
	"github.com/apisix/manager-api/log"
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
	r.PUT("/apisix/admin/routes", wgin.Wraps(h.Update,
		wrapper.InputType(reflect.TypeOf(UpdateInput{}))))
	r.PUT("/apisix/admin/routes/:id", wgin.Wraps(h.Update,
		wrapper.InputType(reflect.TypeOf(UpdateInput{}))))

	r.DELETE("/apisix/admin/routes/:ids", wgin.Wraps(h.BatchDelete,
		wrapper.InputType(reflect.TypeOf(BatchDelete{}))))

	r.GET("/apisix/admin/notexist/routes", consts.ErrorWrapper(Exist))

	r.POST("/apisix/admin/routes/import", consts.ErrorWrapper(ImportRoutes))
}

type GetInput struct {
	ID string `auto_read:"id,path" validate:"required"`
}

func (h *Handler) Get(c droplet.Context) (interface{}, error) {
	input := c.Input().(*GetInput)

	r, err := h.routeStore.Get(input.ID)
	if err != nil {
		return &data.SpecCodeResponse{StatusCode: http.StatusNotFound}, err
	}

	//format respond
	route := r.(*entity.Route)
	script, _ := h.scriptStore.Get(input.ID)
	if script != nil {
		route.Script = script.(*entity.Script).Script
	}

	//format
	if route.Upstream != nil && route.Upstream.Nodes != nil {
		route.Upstream.Nodes = entity.NodesFormat(route.Upstream.Nodes)
	}

	return route, nil
}

type ListInput struct {
	Name string `auto_read:"name,query"`
	URI  string `auto_read:"uri,query"`
	store.Pagination
}

func uriContains(obj *entity.Route, uri string) bool {
	if strings.Contains(obj.URI, uri) {
		return true
	}
	for _, str := range obj.Uris {
		result := strings.Contains(str, uri)
		if result {
			return true
		}
	}
	return false
}

func (h *Handler) List(c droplet.Context) (interface{}, error) {
	input := c.Input().(*ListInput)

	ret, err := h.routeStore.List(store.ListInput{
		Predicate: func(obj interface{}) bool {
			if input.Name != "" && input.URI != "" {
				if strings.Contains(obj.(*entity.Route).Name, input.Name) {
					return uriContains(obj.(*entity.Route), input.URI)
				}
				return false
			}
			if input.Name != "" {
				return strings.Contains(obj.(*entity.Route).Name, input.Name)
			}
			if input.URI != "" {
				return uriContains(obj.(*entity.Route), input.URI)
			}
			return true
		},
		Format: func(obj interface{}) interface{} {
			route := obj.(*entity.Route)
			if route.Upstream != nil && route.Upstream.Nodes != nil {
				route.Upstream.Nodes = entity.NodesFormat(route.Upstream.Nodes)
			}
			return route
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
		id := utils.InterfaceToString(route.ID)
		script, _ := h.scriptStore.Get(id)
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
		"cd "+conf.WorkDir+"/dag-to-lua && lua cli.lua "+
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
	if input.ServiceID != nil {
		serviceID := utils.InterfaceToString(input.ServiceID)
		_, err := h.svcStore.Get(serviceID)
		if err != nil {
			if err == data.ErrNotFound {
				return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
					fmt.Errorf("service id: %s not found", input.ServiceID)
			}
			return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest}, err
		}
	}
	if input.UpstreamID != nil {
		upstreamID := utils.InterfaceToString(input.UpstreamID)
		_, err := h.upstreamStore.Get(upstreamID)
		if err != nil {
			if err == data.ErrNotFound {
				return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
					fmt.Errorf("upstream id: %s not found", input.UpstreamID)
			}
			return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest}, err
		}
	}

	if input.Script != nil {
		if input.ID == "" {
			input.ID = utils.GetFlakeUidStr()
		}
		script := &entity.Script{}
		script.ID = utils.InterfaceToString(input.ID)
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
		return handler.SpecCodeResponse(err), err
	}

	return nil, nil
}

type UpdateInput struct {
	ID string `auto_read:"id,path"`
	entity.Route
}

func (h *Handler) Update(c droplet.Context) (interface{}, error) {
	input := c.Input().(*UpdateInput)
	if input.ID != "" {
		input.Route.ID = input.ID
	}

	if input.Route.Host != "" && len(input.Route.Hosts) > 0 {
		return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			fmt.Errorf("only one of host or hosts is allowed")
	}

	//check depend
	if input.ServiceID != nil {
		serviceID := utils.InterfaceToString(input.ServiceID)
		_, err := h.svcStore.Get(serviceID)
		if err != nil {
			if err == data.ErrNotFound {
				return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
					fmt.Errorf("service id: %s not found", input.ServiceID)
			}
			return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest}, err
		}
	}
	if input.UpstreamID != nil {
		upstreamID := utils.InterfaceToString(input.UpstreamID)
		_, err := h.upstreamStore.Get(upstreamID)
		if err != nil {
			if err == data.ErrNotFound {
				return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
					fmt.Errorf("upstream id: %s not found", input.UpstreamID)
			}
			return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest}, err
		}
	}

	if input.Script != nil {
		script := &entity.Script{}
		script.ID = input.ID
		script.Script = input.Script
		//to lua
		var err error
		scriptConf, ok := input.Script.(map[string]interface{})
		if !ok {
			return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
				fmt.Errorf("invalid `script`")
		}
		input.Route.Script, err = generateLuaCode(scriptConf)
		if err != nil {
			return &data.SpecCodeResponse{StatusCode: http.StatusInternalServerError}, err
		}
		//save original conf
		if err = h.scriptStore.Update(c.Context(), script, true); err != nil {
			//if not exists, create
			if err.Error() == fmt.Sprintf("key: %s is not found", script.ID) {
				if err := h.scriptStore.Create(c.Context(), script); err != nil {
					return handler.SpecCodeResponse(err), err
				}
			} else {
				return handler.SpecCodeResponse(err), err
			}
		}
	} else {
		//remove exists script
		id := utils.InterfaceToString(input.Route.ID)
		script, _ := h.scriptStore.Get(id)
		if script != nil {
			if err := h.scriptStore.BatchDelete(c.Context(), strings.Split(id, ",")); err != nil {
				log.Warnf("delete script %s failed", input.Route.ID)
			}
		}
	}

	if err := h.routeStore.Update(c.Context(), &input.Route, true); err != nil {
		return handler.SpecCodeResponse(err), err
	}

	return nil, nil
}

type BatchDelete struct {
	IDs string `auto_read:"ids,path"`
}

func (h *Handler) BatchDelete(c droplet.Context) (interface{}, error) {
	input := c.Input().(*BatchDelete)

	//delete route
	if err := h.routeStore.BatchDelete(c.Context(), strings.Split(input.IDs, ",")); err != nil {
		return handler.SpecCodeResponse(err), err
	}

	//delete stored script
	if err := h.scriptStore.BatchDelete(c.Context(), strings.Split(input.IDs, ",")); err != nil {
		//try again
		log.Warn("try to delete script %s again", input.IDs)
		if err := h.scriptStore.BatchDelete(c.Context(), strings.Split(input.IDs, ",")); err != nil {
			return nil, nil
		}
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
			return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
				consts.InvalidParam("Route name is reduplicate")
		}
	}

	return nil, nil
}

func ImportRoutes(c *gin.Context) (interface{}, error) {
	limit := 8 << 20
	file, err := c.FormFile("file")
	if err != nil {
		return nil, err
	}
	fileType := file.Filename[strings.LastIndex(file.Filename, ".")+1:]
	if fileType != "json" {
		return nil, fmt.Errorf("the file type error: need json,given %s", fileType)
	}
	if file.Size > int64(limit) {
		return nil, fmt.Errorf("the file size exceeds the limit; limit 8M")
	}
	open, err := file.Open()
	if err != nil {
		return nil, err
	}
	defer open.Close()
	reader := bufio.NewReader(open)
	// set []byte volume is 8 M
	bytes := make([]byte, file.Size)
	_, _ = reader.Read(bytes)
	swagger := &openapi3.Swagger{}
	_ = json.Unmarshal(bytes, swagger)
	routes := TransformOpenToRoute(swagger)
	routeStore := store.GetStore(store.HubKeyRoute)
	upstreamStore := store.GetStore(store.HubKeyUpstream)
	scriptStore := store.GetStore(store.HubKeyScript)
	//upstreamStr := `{"type":"roundrobin","timeout":{"connect":6000,"send":6000,"read":6000},"nodes":[{"host":"127.0.0.1","port":80,"weight":1}]}`
	for _, route := range routes {
		//upstream := &entity.Upstream{}
		//_ = json.Unmarshal([]byte(upstreamStr), upstream)
		//route.Upstream = &upstream.UpstreamDef
		// check route name
		_, err := checkRouteName(route.Name)
		if err != nil {
			continue
		}
		if route.ServiceID != "" {
			_, err := routeStore.Get(utils.InterfaceToString(route.ServiceID))
			if err != nil {
				if err == data.ErrNotFound {
					return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
						fmt.Errorf("service id: %s not found", route.ServiceID)
				}
				return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest}, err
			}
		}
		if route.UpstreamID != "" {
			_, err := upstreamStore.Get(utils.InterfaceToString(route.UpstreamID))
			if err != nil {
				if err == data.ErrNotFound {
					return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
						fmt.Errorf("upstream id: %s not found", route.UpstreamID)
				}
				return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest}, err
			}
		}
		if route.Script != nil {
			if route.ID == "" {
				route.ID = utils.GetFlakeUidStr()
			}
			script := &entity.Script{}
			script.ID = utils.InterfaceToString(route.ID)
			script.Script = route.Script
			//to lua
			var err error
			route.Script, err = generateLuaCode(route.Script.(map[string]interface{}))
			if err != nil {
				return nil, err
			}
			//save original conf
			if err = scriptStore.Create(c, script); err != nil {
				return nil, err
			}
		}
		if err := routeStore.Create(c, route); err != nil {
			println(err.Error())
			return handler.SpecCodeResponse(err), err
		}
	}
	return nil, nil
}

func checkRouteName(name string) (bool, error) {
	routeStore := store.GetStore(store.HubKeyRoute)
	ret, err := routeStore.List(store.ListInput{
		Predicate:  nil,
		PageSize:   0,
		PageNumber: 0,
	})
	if err != nil {
		return false, err
	}
	sort := store.NewSort(nil)
	filter := store.NewFilter([]string{"name", name})
	pagination := store.NewPagination(0, 0)
	query := store.NewQuery(sort, filter, pagination)
	rows := store.NewFilterSelector(toRows(ret), query)
	if len(rows) > 0 {
		return false, consts.InvalidParam("Route name is reduplicate")
	}
	return true, nil
}

func TransformOpenToRoute(swagger *openapi3.Swagger) []*entity.Route {
	var routes []*entity.Route
	swagger.Extensions = nil
	paths := swagger.Paths
	for k, v := range paths {
		if v.Get != nil {
			routes = append(routes, getRouteFromPaths("GET", k, v.Get, swagger))
		}
		if v.Post != nil {
			routes = append(routes, getRouteFromPaths("POST", k, v.Post, swagger))
		}
		if v.Head != nil {
			routes = append(routes, getRouteFromPaths("HEAD", k, v.Head, swagger))
		}
		if v.Put != nil {
			routes = append(routes, getRouteFromPaths("PUT", k, v.Put, swagger))
		}
		if v.Patch != nil {
			routes = append(routes, getRouteFromPaths("PATCH", k, v.Patch, swagger))
		}
		if v.Delete != nil {
			routes = append(routes, getRouteFromPaths("DELETE", k, v.Delete, swagger))
		}
	}
	return routes
}

func getRouteFromPaths(method, key string, value *openapi3.Operation, swagger *openapi3.Swagger) *entity.Route {
	reg := regexp.MustCompile(`{[\w.]*\}`)
	findString := reg.FindString(key)
	if findString != "" {
		key = strings.Split(key, findString)[0] + "*"
	}
	r := &entity.Route{
		URI:     key,
		Name:    value.OperationID,
		Desc:    value.Summary,
		Methods: []string{method},
	}
	var parameters *openapi3.Parameters
	plugins := make(map[string]interface{})
	requestValidation := make(map[string]*entity.RequestValidation)
	if value.Parameters != nil {
		parameters = &value.Parameters
	}
	if parameters != nil {
		for _, v := range *parameters {
			if v.Value.Schema != nil {
				v.Value.Schema.Value.Extensions = nil
				v.Value.Schema.Value.Format = ""
				v.Value.Schema.Value.XML = nil
			}
			props := make(map[string]interface{})
			switch v.Value.In {
			case "header":
				props[v.Value.Name] = v.Value.Schema.Value
				var required []string
				if v.Value.Required {
					required = append(required, v.Value.Name)
				}
				requestValidation["header_schema"] = &entity.RequestValidation{
					Type:       "object",
					Required:   required,
					Properties: props,
				}
				plugins["request-validation"] = requestValidation
			}
		}
	}

	if value.RequestBody != nil {
		vars := make([]interface{}, 0)
		schema := value.RequestBody.Value.Content
		for k, v := range schema {
			item := []string{"http_Content-type", "==", ""}
			item[2] = k
			vars = append(vars, item)
			if v.Schema.Ref != "" {
				s := getParameters(v.Schema.Ref, &swagger.Components).Value
				requestValidation["body_schema"] = &entity.RequestValidation{
					Type:       s.Type,
					Required:   s.Required,
					Properties: s.Properties,
				}
				plugins["request-validation"] = requestValidation
			} else if v.Schema.Value != nil {
				if v.Schema.Value.Properties != nil {
					for k1, v1 := range v.Schema.Value.Properties {
						if v1.Ref != "" {
							s := getParameters(v1.Ref, &swagger.Components)
							v.Schema.Value.Properties[k1] = s
						}
						v1.Value.Extensions = nil
						v1.Value.Format = ""
					}
					requestValidation["body_schema"] = &entity.RequestValidation{
						Type:       v.Schema.Value.Type,
						Required:   v.Schema.Value.Required,
						Properties: v.Schema.Value.Properties,
					}
					plugins["request-validation"] = requestValidation
				} else if v.Schema.Value.Items != nil {
					if v.Schema.Value.Items.Ref != "" {
						s := getParameters(v.Schema.Value.Items.Ref, &swagger.Components).Value
						requestValidation["body_schema"] = &entity.RequestValidation{
							Type:       s.Type,
							Required:   s.Required,
							Properties: s.Properties,
						}
						plugins["request-validation"] = requestValidation
					}
				} else {
					requestValidation["body_schema"] = &entity.RequestValidation{
						Type:       "object",
						Required:   []string{},
						Properties: v.Schema.Value.Properties,
					}
				}
			}
			plugins["request-validation"] = requestValidation
		}
		r.Vars = vars
	}

	if value.Security != nil {
		p := &entity.SecurityPlugin{}
		for _, v := range *value.Security {
			for v1 := range v {
				switch v1 {
				case "api_key":
					plugins["key-auth"] = p
				case "basicAuth":
					plugins["basic-auth"] = p
				case "bearerAuth":
					plugins["jwt-auth"] = p
				}
			}
		}
	}
	r.Plugins = plugins
	return r
}

func getParameters(ref string, components *openapi3.Components) *openapi3.SchemaRef {
	schemaRef := &openapi3.SchemaRef{}
	arr := strings.Split(ref, "/")
	if arr[0] == "#" && arr[1] == "components" && arr[2] == "schemas" {
		schemaRef = components.Schemas[arr[3]]
		schemaRef.Value.XML = nil
		schemaRef.Value.Extensions = nil
		// traverse properties to find another ref
		for k, v := range schemaRef.Value.Properties {
			if v.Value != nil {
				v.Value.XML = nil
				v.Value.Format = ""
				v.Value.Extensions = nil
			}
			if v.Ref != "" {
				schemaRef.Value.Properties[k] = getParameters(v.Ref, components)
			} else if v.Value.Items != nil && v.Value.Items.Ref != "" {
				v.Value.Items = getParameters(v.Value.Items.Ref, components)
			} else if v.Value.Items != nil && v.Value.Items.Value != nil {
				v.Value.Items.Value.XML = nil
				v.Value.Items.Value.Extensions = nil
				v.Value.Items.Value.Format = ""
			}
		}
	}
	return schemaRef
}
