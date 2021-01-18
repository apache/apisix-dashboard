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
package data_loader

import (
	"bufio"
	"encoding/json"
	"fmt"
	"net/http"
	"path"
	"regexp"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/gin-gonic/gin"
	"github.com/shiningrush/droplet/data"

	"github.com/apisix/manager-api/internal/conf"
	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/apisix/manager-api/internal/handler"
	routeHandler "github.com/apisix/manager-api/internal/handler/route"
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
	r.POST("/apisix/admin/import", consts.ErrorWrapper(Import))
}

func Import(c *gin.Context) (interface{}, error) {
	file, err := c.FormFile("file")
	if err != nil {
		return nil, err
	}

	// file check
	suffix := path.Ext(file.Filename)
	if suffix != ".json" && suffix != ".yaml" && suffix != ".yml" {
		return nil, fmt.Errorf("the file type error: %s", suffix)
	}
	if file.Size > int64(conf.ImportSizeLimit) {
		return nil, fmt.Errorf("the file size exceeds the limit; limit %d", conf.ImportSizeLimit)
	}

	// read file and parse
	handle, err := file.Open()
	defer func() {
		err = handle.Close()
	}()
	if err != nil {
		return nil, err
	}

	reader := bufio.NewReader(handle)
	bytes := make([]byte, file.Size)
	_, err = reader.Read(bytes)
	if err != nil {
		return nil, err
	}

	swagger, err := openapi3.NewSwaggerLoader().LoadSwaggerFromData(bytes)
	if err != nil {
		return nil, err
	}

	routes, err := OpenAPI3ToRoute(swagger)
	if err != nil {
		return nil, err
	}

	routeStore := store.GetStore(store.HubKeyRoute)
	upstreamStore := store.GetStore(store.HubKeyUpstream)
	scriptStore := store.GetStore(store.HubKeyScript)

	// check route
	for _, route := range routes {
		_, err := checkRouteName(route.Name)
		if err != nil {
			continue
		}
		if route.ServiceID != nil {
			_, err := routeStore.Get(utils.InterfaceToString(route.ServiceID))
			if err != nil {
				if err == data.ErrNotFound {
					return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
						fmt.Errorf("service id: %s not found", route.ServiceID)
				}
				return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest}, err
			}
		}
		if route.UpstreamID != nil {
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
			// to lua
			var err error
			route.Script, err = routeHandler.GenerateLuaCode(route.Script.(map[string]interface{}))
			if err != nil {
				return nil, err
			}
			// save original conf
			if _, err = scriptStore.Create(c, script); err != nil {
				return nil, err
			}
		}

		if _, err := routeStore.CreateCheck(route); err != nil {
			return handler.SpecCodeResponse(err), err
		}
	}

	// create route
	for _, route := range routes {
		if _, err := routeStore.Create(c, route); err != nil {
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
	rows := store.NewFilterSelector(routeHandler.ToRows(ret), query)
	if len(rows) > 0 {
		return false, consts.InvalidParam("route name is duplicate")
	}

	return true, nil
}


func parseExtension(val *openapi3.Operation) (*entity.Route, error) {
	routeMap := map[string]interface{}{}
	for key, val := range val.Extensions {
		if strings.HasPrefix(key, "x-apisix-") {
			routeMap[strings.TrimPrefix(key, "x-apisix-")] = val
		}
	}

	route := new(entity.Route)
	routeJson, err := json.Marshal(routeMap)
	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(routeJson, &route)
	if err != nil {
		return nil, err
	}

	return route, nil
}

func OpenAPI3ToRoute(swagger *openapi3.Swagger) ([]*entity.Route, error) {
	var routes []*entity.Route
	paths := swagger.Paths
	var upstream *entity.UpstreamDef
	var err error
	for k, v := range paths {
		upstream = &entity.UpstreamDef{}
		if up, ok := v.Extensions["x-apisix-upstream"]; ok {
			err = json.Unmarshal(up.(json.RawMessage), upstream)
			if err != nil {
				return nil, err
			}
		}
		if v.Get != nil {
			route, err := getRouteFromPaths("GET", k, v.Get, swagger)
			if err != nil {
				return nil, err
			}
			routes = append(routes, route)
		}
		if v.Post != nil {
			route, err := getRouteFromPaths("POST", k, v.Post, swagger)
			if err != nil {
				return nil, err
			}
			routes = append(routes, route)
		}
		if v.Head != nil {
			route, err := getRouteFromPaths("HEAD", k, v.Head, swagger)
			if err != nil {
				return nil, err
			}
			routes = append(routes, route)
		}
		if v.Put != nil {
			route, err := getRouteFromPaths("PUT", k, v.Put, swagger)
			if err != nil {
				return nil, err
			}
			routes = append(routes, route)
		}
		if v.Patch != nil {
			route, err := getRouteFromPaths("PATCH", k, v.Patch, swagger)
			if err != nil {
				return nil, err
			}
			routes = append(routes, route)
		}

		if v.Delete != nil {
			route, err := getRouteFromPaths("DELETE", k, v.Delete, swagger)
			if err != nil {
				return nil, err
			}
			routes = append(routes, route)
		}
	}

	return routes, nil
}

func parseParameters(parameters openapi3.Parameters, plugins map[string]interface{}) {
	props := make(map[string]interface{})
	var required []string
	for _, v := range parameters {
		if v.Value.Schema != nil {
			v.Value.Schema.Value.Format = ""
			v.Value.Schema.Value.XML = nil
		}

		switch v.Value.In {
		case "header":
			if v.Value.Schema != nil && v.Value.Schema.Value != nil {
				props[v.Value.Name] = v.Value.Schema.Value
			}
			if v.Value.Required {
				required = append(required, v.Value.Name)
			}
		}
	}
	requestValidation := make(map[string]interface{})

	requestValidation["header_schema"] = &entity.RequestValidation{
		Type:       "object",
		Required:   required,
		Properties: props,
	}
	plugins["request-validation"] = requestValidation
}

func parseRequestBody(requestBody *openapi3.RequestBodyRef, swagger *openapi3.Swagger, plugins map[string]interface{}) {
	schema := requestBody.Value.Content
	requestValidation := make(map[string]interface{})
	for _, v := range schema {
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
}

func parseSecurity(security openapi3.SecurityRequirements, securitySchemes openapi3.SecuritySchemes, plugins map[string]interface{}) {
	// todo: import consumers
	for _, securities := range security {
		for name := range securities {
			if schema, ok := securitySchemes[name]; ok {
				value := schema.Value
				if value == nil {
					continue
				}

				// basic auth
				if value.Type == "http" && value.Scheme == "basic" {
					plugins["basic-auth"] = map[string]interface{}{}
					//username, ok := value.Extensions["username"]
					//if !ok {
					//	continue
					//}
					//password, ok := value.Extensions["password"]
					//if !ok {
					//	continue
					//}
					//plugins["basic-auth"] = map[string]interface{}{
					//	"username": username,
					//	"password": password,
					//}
					// jwt auth
				} else if value.Type == "http" && value.Scheme == "bearer" && value.BearerFormat == "JWT" {
					plugins["jwt-auth"] = map[string]interface{}{}
					//key, ok := value.Extensions["key"]
					//if !ok {
					//	continue
					//}
					//secret, ok := value.Extensions["secret"]
					//if !ok {
					//	continue
					//}
					//plugins["jwt-auth"] = map[string]interface{}{
					//	"key":    key,
					//	"secret": secret,
					//}
					// key auth
				} else if value.Type == "apiKey" {
					plugins["key-auth"] = map[string]interface{}{}
					//key, ok := value.Extensions["key"]
					//if !ok {
					//	continue
					//}
					//plugins["key-auth"] = map[string]interface{}{
					//	"key": key,
					//}
				}
			}
		}
	}
}

func getRouteFromPaths(method, key string, value *openapi3.Operation, swagger *openapi3.Swagger) (*entity.Route, error) {
	// transform /path/{var} to  /path/*
	reg := regexp.MustCompile(`{[\w.]*}`)
	foundStr := reg.FindString(key)
	if foundStr != "" {
		key = strings.Split(key, foundStr)[0] + "*"
	}

	route, err := parseExtension(value)
	if err != nil {
		return nil, err
	}

	route.URI = key
	route.Name = value.OperationID
	route.Desc = value.Summary
	route.Methods = []string{method}

	if route.Plugins == nil {
		route.Plugins = make(map[string]interface{})
	}

	if value.Parameters != nil {
		parseParameters(value.Parameters, route.Plugins)
	}

	if value.RequestBody != nil {
		parseRequestBody(value.RequestBody, swagger, route.Plugins)
	}

	if value.Security != nil && swagger.Components.SecuritySchemes != nil {
		parseSecurity(*value.Security, swagger.Components.SecuritySchemes, route.Plugins)
	}

	return route, nil
}

func getParameters(ref string, components *openapi3.Components) *openapi3.SchemaRef {
	schemaRef := &openapi3.SchemaRef{}
	arr := strings.Split(ref, "/")
	if arr[0] == "#" && arr[1] == "components" && arr[2] == "schemas" {
		schemaRef = components.Schemas[arr[3]]
		schemaRef.Value.XML = nil
		// traverse properties to find another ref
		for k, v := range schemaRef.Value.Properties {
			if v.Value != nil {
				v.Value.XML = nil
				v.Value.Format = ""
			}
			if v.Ref != "" {
				schemaRef.Value.Properties[k] = getParameters(v.Ref, components)
			} else if v.Value.Items != nil && v.Value.Items.Ref != "" {
				v.Value.Items = getParameters(v.Value.Items.Ref, components)
			} else if v.Value.Items != nil && v.Value.Items.Value != nil {
				v.Value.Items.Value.XML = nil
				v.Value.Items.Value.Format = ""
			}
		}
	}
	return schemaRef
}
