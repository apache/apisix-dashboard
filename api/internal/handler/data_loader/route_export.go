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
	"context"
	"encoding/json"
	"fmt"
	"reflect"
	"regexp"
	"strings"

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/apisix/manager-api/internal/handler"
	"github.com/apisix/manager-api/internal/log"
	"github.com/apisix/manager-api/internal/utils"
	"github.com/getkin/kin-openapi/openapi3"
	"github.com/gin-gonic/gin"
	"github.com/shiningrush/droplet"
	"github.com/shiningrush/droplet/data"
	"github.com/shiningrush/droplet/wrapper"
	wgin "github.com/shiningrush/droplet/wrapper/gin"
)

type Handler struct {
	routeStore    store.Interface
	upstreamStore store.Interface
	serviceStore  store.Interface
}

func NewHandler() (handler.RouteRegister, error) {
	return &Handler{
		routeStore:    store.GetStore(store.HubKeyRoute),
		upstreamStore: store.GetStore(store.HubKeyUpstream),
		serviceStore:  store.GetStore(store.HubKeyService),
	}, nil
}

func (h *Handler) ApplyRoute(r *gin.Engine) {
	r.POST("/apisix/admin/routes/export/:ids", wgin.Wraps(h.ExportRoutes,
		wrapper.InputType(reflect.TypeOf(ExportInput{}))))
}

type ExportInput struct {
	IDs string `auto_read:"ids,path"`
}

func (h *Handler) ExportRoutes(c droplet.Context) (interface{}, error) {
	input := c.Input().(*ExportInput)
	ids := strings.Split(input.IDs, ",")
	routes := []*entity.Route{}

	for _, id := range ids {
		route, err := h.routeStore.Get(context.Background(), id)
		if err != nil {
			return nil, err
		}
		routes = append(routes, route.(*entity.Route))
	}

	swagger, err := h.routeToOpenApi3(routes)
	if err != nil {
		return nil, err
	}
	return swagger, nil
}

type AuthType string

const (
	BasicAuth AuthType = "basic-auth"
	KeyAuth   AuthType = "key-auth"
	JWTAuth   AuthType = "jwt-auth"
)

var (
	openApi = "3.0.0"
	title   = "RoutesExport"
	service interface{}
	err     error
)

func (h *Handler) routeToOpenApi3(routes []*entity.Route) (*openapi3.Swagger, error) {
	paths := openapi3.Paths{}
	paramsRefs := []*openapi3.ParameterRef{}
	requestBody := &openapi3.RequestBody{}
	components := &openapi3.Components{}
	secSchemas := openapi3.SecuritySchemes{}
	servicePlugins := make(map[string]interface{})
	plugins := make(map[string]interface{})
	serviceLabels := make(map[string]string)
	labels := make(map[string]string)
	extensions := make(map[string]interface{})

	for _, route := range routes {
		pathItem := &openapi3.PathItem{}
		path := openapi3.Operation{}
		path.Summary = route.Desc
		path.OperationID = route.Name

		if route.ServiceID != nil {
			serviceID := utils.InterfaceToString(route.ServiceID)
			service, err = h.serviceStore.Get(context.Background(), serviceID)
			if err != nil {
				if err == data.ErrNotFound {
					return nil, fmt.Errorf("service id: %s not found", route.ServiceID)
				}
				return nil, err
			}
			extensions["x-apisix-serviceID"] = route.ServiceID

			_service := service.(*entity.Service)
			servicePlugins = _service.Plugins
			serviceLabels = _service.Labels
		}

		if route.Upstream != nil {
			extensions["x-apisix-upstream"] = route.Upstream
		} else if route.UpstreamID != nil && route.Upstream == nil {
			upstreamID := utils.InterfaceToString(route.UpstreamID)
			upstream, err := h.upstreamStore.Get(context.Background(), upstreamID)
			if err != nil {
				if err == data.ErrNotFound {
					return nil, fmt.Errorf("upstream id: %s not found", route.UpstreamID)
				}
				return nil, err
			}
			extensions["x-apisix-upstream"] = upstream
		} else if route.UpstreamID == nil && route.Upstream == nil && route.ServiceID != nil {
			_service := service.(*entity.Service)
			extensions["x-apisix-upstream"] = _service.Upstream
		}

		if route.Host != "" {
			extensions["x-apisix-host"] = route.Host
		}

		if route.Hosts != nil {
			extensions["x-apisix-hosts"] = route.Hosts
		}

		//Parse Labels
		labels, err = parseLabels(route, serviceLabels, labels)
		if err != nil {
			log.Errorf("parseLabels err: ", err)
			return nil, err
		}
		if labels != nil {
			extensions["x-apisix-labels"] = labels
		}

		if route.RemoteAddr != "" {
			extensions["x-apisix-remoteAddr"] = route.RemoteAddr
		}

		if route.RemoteAddrs != nil {
			extensions["x-apisix-remoteAddrs"] = route.RemoteAddrs
		}

		if route.FilterFunc != "" {
			extensions["x-apisix-filterFunc"] = route.FilterFunc
		}

		if route.Script != nil {
			extensions["x-apisix-script"] = route.Script
		}

		if route.ServiceProtocol != "" {
			extensions["x-apisix-serviceProtocol"] = route.ServiceProtocol
		}
		if route.Vars != nil {
			extensions["x-apisix-vars"] = route.Vars
		}

		// analysis route.URIs
		routeURIs := []string{}
		if route.URI != "" {
			routeURIs = append(routeURIs, route.URI)
		}

		if route.Uris != nil {
			routeURIs = route.Uris
		}

		for _, uri := range routeURIs {
			if strings.Contains(uri, "*") {
				paths[strings.Split(uri, "*")[0]+"{params}"] = pathItem
				// add params introduce
				paramsRefs = append(paramsRefs, &openapi3.ParameterRef{
					Value: &openapi3.Parameter{
						In:          "path",
						Name:        "params",
						Required:    true,
						Description: "params in path",
						Schema:      &openapi3.SchemaRef{Value: &openapi3.Schema{Type: "string"}}}})
			} else {
				paths[uri] = pathItem
			}
		}

		//Parse Route Plugins
		path, secSchemas, paramsRefs, plugins, err = parseRoutePlugins(route, paramsRefs, plugins, path, servicePlugins, secSchemas, requestBody)
		if err != nil {
			log.Errorf("parseRoutePlugins err: ", err)
			return nil, err
		}
		if plugins != nil {
			extensions["x-apisix-plugins"] = plugins
		}

		extensions["x-apisix-priority"] = route.Priority
		extensions["x-apisix-status"] = route.Status
		extensions["x-apisix-enableWebsocket"] = route.EnableWebsocket
		path.Extensions = extensions
		path.Parameters = paramsRefs
		path.RequestBody = &openapi3.RequestBodyRef{Value: requestBody}
		path.Responses = openapi3.NewResponses()

		for i := range route.Methods {
			switch strings.ToUpper(route.Methods[i]) {
			case "GET":
				//pathItem.Get = path
				pathItem.Get = parsePathItem(path, "Get")
			case "POST":
				//pathItem.Post = path
				pathItem.Post = parsePathItem(path, "Post")
			case "PUT":
				//pathItem.Put = path
				pathItem.Put = parsePathItem(path, "Put")
			case "DELETE":
				//pathItem.Delete = path
				pathItem.Delete = parsePathItem(path, "Delete")
			case "PATCH":
				//pathItem.Patch = path
				pathItem.Patch = parsePathItem(path, "Patch")
			case "HEAD":
				//pathItem.Head = path
				pathItem.Head = parsePathItem(path, "HEAD")
			}
		}
	}

	components.SecuritySchemes = secSchemas
	swagger := openapi3.Swagger{
		OpenAPI:    openApi,
		Info:       &openapi3.Info{Title: title, Version: openApi},
		Paths:      paths,
		Components: *components,
	}
	return &swagger, nil
}

func parseLabels(route *entity.Route, serviceLabels map[string]string, labels map[string]string) (map[string]string, error) {
	if route.Labels != nil {
		if route.ServiceID != nil {
			_serviceLabels, err := json.Marshal(serviceLabels)
			if err != nil {
				log.Errorf("MapToJson err: ", err)
				return nil, err
			}
			_labels, err := json.Marshal(route.Labels)
			if err != nil {
				log.Errorf("MapToJson err: ", err)
				return nil, err
			}
			byteLabels, err := utils.MergeJson(_serviceLabels, _labels)
			if err != nil {
				log.Errorf("Labels MergeJson err: ", err)
				return nil, err
			}
			err = json.Unmarshal([]byte(byteLabels), &labels)
			if err != nil {
				log.Errorf("JsonToMap err: ", err)
				return nil, err
			}
			if labels != nil {
				return labels, nil
			}
		}
		return route.Labels, nil
	} else if route.Labels == nil && route.ServiceID != nil {
		if serviceLabels != nil {
			return serviceLabels, nil
		}
	}
	return nil, nil
}

func parsePathItem(path openapi3.Operation, routeMethod string) *openapi3.Operation {
	_path := &openapi3.Operation{
		ExtensionProps: path.ExtensionProps,
		Tags:           path.Tags,
		Summary:        path.Summary,
		Description:    path.Description,
		OperationID:    path.OperationID + routeMethod,
		Parameters:     path.Parameters,
		RequestBody:    path.RequestBody,
		Responses:      path.Responses,
		Callbacks:      path.Callbacks,
		Deprecated:     path.Deprecated,
		Security:       path.Security,
		Servers:        path.Servers,
		ExternalDocs:   path.ExternalDocs,
	}
	return _path
}

func parseRoutePlugins(route *entity.Route, paramsRefs []*openapi3.ParameterRef, plugins map[string]interface{}, path openapi3.Operation, servicePlugins map[string]interface{}, secSchemas openapi3.SecuritySchemes, requestBody *openapi3.RequestBody) (openapi3.Operation, openapi3.SecuritySchemes, []*openapi3.ParameterRef, map[string]interface{}, error) {
	if route.Plugins != nil {
		param := &openapi3.Parameter{}
		secReq := &openapi3.SecurityRequirements{}

		// analysis plugins
		for key, value := range route.Plugins {
			// analysis proxy-rewrite plugin
			//if key == "proxy-rewrite" {
			//	continue
			//}

			// analysis request-validation plugin
			if key == "request-validation" {
				if valueMap, ok := value.(map[string]interface{}); ok {
					if hsVal, ok := valueMap["header_schema"]; ok {
						param.In = "header"
						requestValidation := &entity.RequestValidation{}
						reqBytes, _ := json.Marshal(&hsVal)
						err := json.Unmarshal(reqBytes, requestValidation)
						if err != nil {
							log.Errorf("json marshal failed: %s", err)
						}
						for key1, value1 := range requestValidation.Properties.(map[string]interface{}) {
							for _, arr := range requestValidation.Required {
								if arr == key1 {
									param.Required = true
								}
							}
							param.Name = key1
							typeStr := value1.(map[string]interface{})
							schema := &openapi3.Schema{Type: typeStr["type"].(string)}
							param.Schema = &openapi3.SchemaRef{Value: schema}
							paramsRefs = append(paramsRefs, &openapi3.ParameterRef{Value: param})
						}
					}

					if bsVal, ok := valueMap["body_schema"]; ok {
						m := map[string]*openapi3.MediaType{}
						reqBytes, _ := json.Marshal(&bsVal)
						schema := &openapi3.Schema{}
						err := json.Unmarshal(reqBytes, schema)
						if err != nil {
							log.Errorf("json marshal failed: %s", err)
						}
						for _, va := range route.Vars.([]interface{}) {
							compile := regexp.MustCompile("^http_.*")
							match := compile.Match([]byte(va.([]interface{})[0].(string)))
							if match {
								m[va.([]interface{})[2].(string)] = &openapi3.MediaType{Schema: &openapi3.SchemaRef{Value: schema}}
								requestBody.Content = m
							}
						}
					}
				}
				continue
			}
			// analysis security plugins
			securityEnv := &openapi3.SecurityRequirement{}
			switch key {
			case string(KeyAuth):
				secSchemas["api_key"] = &openapi3.SecuritySchemeRef{Value: openapi3.NewCSRFSecurityScheme()}
				securityEnv.Authenticate("api_key", " ")
				secReq.With(*securityEnv)
				continue
			case string(BasicAuth):
				secSchemas["basicAuth"] = &openapi3.SecuritySchemeRef{Value: &openapi3.SecurityScheme{
					Type: "basicAuth",
					Name: "basicAuth",
					In:   "header",
				}}
				securityEnv.Authenticate("basicAuth", " ")
				secReq.With(*securityEnv)
				continue
			case string(JWTAuth):
				secSchemas["bearerAuth"] = &openapi3.SecuritySchemeRef{Value: openapi3.NewJWTSecurityScheme()}
				securityEnv.Authenticate("bearerAuth", " ")
				secReq.With(*securityEnv)
				continue
			}
			plugins[key] = value
		}
		path.Security = secReq

		if route.ServiceID != nil {
			_servicePlugins, err := json.Marshal(servicePlugins)
			if err != nil {
				log.Errorf("MapToJson err: ", err)
				return path, nil, nil, nil, err
			}
			_plugins, err := json.Marshal(plugins)
			if err != nil {
				log.Errorf("MapToJson err: ", err)
				return path, nil, nil, nil, err
			}
			bytePlugins, err := utils.MergeJson(_servicePlugins, _plugins)
			if err != nil {
				log.Errorf("Plugins MergeJson err: ", err)
				return path, nil, nil, nil, err
			}
			err = json.Unmarshal([]byte(bytePlugins), &plugins)
			if err != nil {
				log.Errorf("JsonToMapDemo err: ", err)
				return path, nil, nil, nil, err
			}
		}
	} else if route.Plugins == nil && route.ServiceID != nil {
		plugins = servicePlugins
	}
	return path, secSchemas, paramsRefs, plugins, nil
}
