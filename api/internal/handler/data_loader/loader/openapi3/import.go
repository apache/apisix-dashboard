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
package openapi3

import (
	"errors"
	"net/url"
	"strings"
	"time"

	"github.com/getkin/kin-openapi/openapi3"

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/handler/data_loader/loader"
	"github.com/apisix/manager-api/internal/utils/consts"
)

func (o Loader) Import(input interface{}) (*loader.DataSets, error) {
	if input == nil {
		return nil, errors.New("input is nil")
	}

	// load OAS3 document
	swagger, err := openapi3.NewSwaggerLoader().LoadSwaggerFromData(input.([]byte))
	if err != nil {
		return nil, err
	}

	// no paths in OAS3 document
	if len(swagger.Paths) <= 0 {
		return nil, consts.ErrImportFile
	}

	if o.TaskName == "" {
		o.TaskName = "openapi_" + time.Now().Format("20060102150405")
	}

	data, err := o.convertToEntities(swagger)
	if err != nil {
		return nil, err
	}

	return data, nil
}

func (o Loader) convertToEntities(s *openapi3.Swagger) (*loader.DataSets, error) {
	var (
		// temporarily save the parsed data
		data = &loader.DataSets{}
		// global upstream ID
		globalUpstreamID = o.TaskName
		// global uri prefix
		globalPath = ""

		// authentication plugins supported by APISIX
		interestedAuthentication     = false
		interestedAuthenticationList = make(map[string]*openapi3.SecuritySchemeRef)
	)

	// check securitySchemes settings
	if len(s.Components.SecuritySchemes) > 0 {
		for name, security := range s.Components.SecuritySchemes {
			if strings.ToLower(security.Value.Type) == "http" &&
				strings.ToLower(security.Value.Scheme) == "apikey" {
				interestedAuthentication = true
				interestedAuthenticationList[name] = security
			}
		}
	}

	// create upstream when servers field not empty
	if len(s.Servers) > 0 {
		var upstream entity.Upstream
		upstream, globalPath = generateUpstreamByServers(s.Servers, globalUpstreamID)
		data.Upstreams = append(data.Upstreams, upstream)
	}

	// each one will correspond to a route
	for uri, v := range s.Paths {
		// replace parameter in uri to wildcard
		realUri := regURIVar.ReplaceAllString(uri, "*")
		// generate route name
		routeID := o.TaskName + "_" + strings.NewReplacer("/", "-", "{", "", "}", "").Replace(strings.TrimPrefix(uri, "/"))

		// decide whether to merge multi-method routes based on configuration
		if o.MergeMethod {
			// create a single route for each path, merge all methods
			route := generateBaseRoute(routeID, v.Summary)
			route.Uris = []string{globalPath + realUri}
			route.UpstreamID = globalUpstreamID
			for method := range v.Operations() {
				route.Methods = append(route.Methods, strings.ToUpper(method))
			}
			data.Routes = append(data.Routes, route)
		} else {
			// create routes for each method of each path
			for method, operation := range v.Operations() {
				subRouteID := routeID + "_" + method
				route := generateBaseRoute(subRouteID, operation.Summary)
				route.Uris = []string{globalPath + realUri}
				route.Methods = []string{strings.ToUpper(method)}
				route.UpstreamID = globalUpstreamID

				// Processing plugins in non-method merge mode
				// In method merge mode, different methods may have different authentication
				// methods, so no plugins are attached to them.
				if interestedAuthentication &&
					operation.Security != nil &&
					len(*operation.Security) > 0 {
					attachAuthenticationPlugin(route, interestedAuthenticationList, operation.Security)
				}
				data.Routes = append(data.Routes, route)
			}
		}
	}
	return data, nil
}

// Adding authentication plugins to route based on the security scheme
// Currently supported: apikey
func attachAuthenticationPlugin(route entity.Route, refs map[string]*openapi3.SecuritySchemeRef, requirements *openapi3.SecurityRequirements) {
	for _, requirement := range *requirements {
		for name := range requirement {
			// Only add plugins that we can currently handle
			if _, ok := refs[name]; ok {
				route.Plugins[authenticationMappings[name]] = map[string]interface{}{}
			}
		}
	}
}

// Generate APISIX upstream from OpenAPI servers field
// return upstream and uri prefix
// Tips: It will use only the first server in servers array
func generateUpstreamByServers(servers openapi3.Servers, upstreamID string) (entity.Upstream, string) {
	upstream := entity.Upstream{
		BaseInfo: entity.BaseInfo{ID: upstreamID},
		UpstreamDef: entity.UpstreamDef{
			Name: upstreamID,
			Type: "roundrobin",
		},
	}

	u, err := url.Parse(servers[0].URL)
	if err != nil {
		// return an empty upstream when parsing url failed
		return upstream, ""
	}

	upstream.Scheme = u.Scheme
	upstream.Nodes = map[string]float64{
		u.Host: 1,
	}

	return upstream, u.Path
}

// Generate a base route for customize
func generateBaseRoute(id string, desc string) entity.Route {
	return entity.Route{
		BaseInfo: entity.BaseInfo{ID: id},
		Name:     id,
		Desc:     desc,
		Plugins:  make(map[string]interface{}),
	}
}
