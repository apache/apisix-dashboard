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
package route_export

import (
	"encoding/json"
	"reflect"
	"regexp"
	"strings"

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/apisix/manager-api/internal/handler"
	"github.com/apisix/manager-api/internal/log"
	"github.com/getkin/kin-openapi/openapi3"
	"github.com/gin-gonic/gin"
	"github.com/shiningrush/droplet"
	"github.com/shiningrush/droplet/wrapper"
	wgin "github.com/shiningrush/droplet/wrapper/gin"
)

type Handler struct {
	routeStore store.Interface
}

func NewHandler() (handler.RouteRegister, error) {
	return &Handler{
		routeStore: store.GetStore(store.HubKeyRoute),
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
		route, err := h.routeStore.Get(id)
		if err != nil {
			return nil, err
		}
		routes = append(routes, route.(*entity.Route))

	}
	return routeToOpenApi3(routes), nil
}

type AuthType string

const (
	BasicAuth AuthType = "basic-auth"
	KeyAuth   AuthType = "key-auth"
	JWTAuth   AuthType = "jwt-auth"
)

var (
	openApi = "3.0.0"
	title   = "Routes Export"
)

func routeToOpenApi3(routes []*entity.Route) *openapi3.Swagger {
	paths := openapi3.Paths{}
	pathItem := &openapi3.PathItem{}
	path := &openapi3.Operation{}
	paramsRefs := []*openapi3.ParameterRef{}
	requestBody := &openapi3.RequestBody{}
	components := &openapi3.Components{}
	secSchemas := openapi3.SecuritySchemes{}
	for _, route := range routes {

		extensions := make(map[string]interface{})
		path.Summary = route.Desc
		path.OperationID = route.Name
		if route.Upstream != nil {
			extensions["x-apisix-upstream"] = route.Upstream
		}
		if route.Host != "" {
			extensions["x-apisix-host"] = route.Host
		}
		if route.Hosts != nil {
			extensions["x-apisix-hosts"] = route.Hosts
		}
		if route.Labels != nil {
			extensions["x-apisix-labels"] = route.Labels
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
		if route.ServiceID != nil {
			extensions["x-apisix-serviceID"] = route.ServiceID
		}
		if route.UpstreamID != nil {
			extensions["x-apisix-upstreamID"] = route.UpstreamID
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

		if route.Plugins != nil {
			param := &openapi3.Parameter{}
			secReq := &openapi3.SecurityRequirements{}
			plugins := make(map[string]interface{})
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
				pathItem.Get = &openapi3.Operation{
					ExtensionProps: path.ExtensionProps,
					Tags:           path.Tags,
					Summary:        path.Summary,
					Description:    path.Description,
					OperationID:    path.OperationID + "Get",
					Parameters:     path.Parameters,
					RequestBody:    path.RequestBody,
					Responses:      path.Responses,
					Callbacks:      path.Callbacks,
					Deprecated:     path.Deprecated,
					Security:       path.Security,
					Servers:        path.Servers,
					ExternalDocs:   path.ExternalDocs,
				}

			case "POST":
				//pathItem.Post = path
				pathItem.Post = &openapi3.Operation{
					ExtensionProps: path.ExtensionProps,
					Tags:           path.Tags,
					Summary:        path.Summary,
					Description:    path.Description,
					OperationID:    path.OperationID + "Post",
					Parameters:     path.Parameters,
					RequestBody:    path.RequestBody,
					Responses:      path.Responses,
					Callbacks:      path.Callbacks,
					Deprecated:     path.Deprecated,
					Security:       path.Security,
					Servers:        path.Servers,
					ExternalDocs:   path.ExternalDocs,
				}
			case "PUT":
				//pathItem.Put = path
				pathItem.Put = &openapi3.Operation{
					ExtensionProps: path.ExtensionProps,
					Tags:           path.Tags,
					Summary:        path.Summary,
					Description:    path.Description,
					OperationID:    path.OperationID + "Put",
					Parameters:     path.Parameters,
					RequestBody:    path.RequestBody,
					Responses:      path.Responses,
					Callbacks:      path.Callbacks,
					Deprecated:     path.Deprecated,
					Security:       path.Security,
					Servers:        path.Servers,
					ExternalDocs:   path.ExternalDocs,
				}
			case "DELETE":
				//pathItem.Delete = path
				pathItem.Delete = &openapi3.Operation{
					ExtensionProps: path.ExtensionProps,
					Tags:           path.Tags,
					Summary:        path.Summary,
					Description:    path.Description,
					OperationID:    path.OperationID + "Delete",
					Parameters:     path.Parameters,
					Responses:      path.Responses,
					Callbacks:      path.Callbacks,
					Deprecated:     path.Deprecated,
					Security:       path.Security,
					Servers:        path.Servers,
					ExternalDocs:   path.ExternalDocs,
				}
			case "PATCH":
				//pathItem.Patch = path
				pathItem.Patch = &openapi3.Operation{
					ExtensionProps: path.ExtensionProps,
					Tags:           path.Tags,
					Summary:        path.Summary,
					Description:    path.Description,
					OperationID:    path.OperationID + "Patch",
					Parameters:     path.Parameters,
					RequestBody:    path.RequestBody,
					Responses:      path.Responses,
					Callbacks:      path.Callbacks,
					Deprecated:     path.Deprecated,
					Security:       path.Security,
					Servers:        path.Servers,
					ExternalDocs:   path.ExternalDocs,
				}
			case "HEAD":
				//pathItem.Head = path
				pathItem.Head = &openapi3.Operation{
					ExtensionProps: path.ExtensionProps,
					Tags:           path.Tags,
					Summary:        path.Summary,
					Description:    path.Description,
					OperationID:    path.OperationID + "Head",
					Parameters:     path.Parameters,
					RequestBody:    path.RequestBody,
					Responses:      path.Responses,
					Callbacks:      path.Callbacks,
					Deprecated:     path.Deprecated,
					Security:       path.Security,
					Servers:        path.Servers,
					ExternalDocs:   path.ExternalDocs,
				}
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
	return &swagger
}
