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
	"net/url"
	"strings"
	"time"

	"github.com/getkin/kin-openapi/openapi3"

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/handler/data_loader/loader"
	"github.com/apisix/manager-api/internal/utils/consts"
)

func (o Loader) Import(input interface{}) (*loader.DataSets, error) {
	swagger, err := openapi3.NewSwaggerLoader().LoadSwaggerFromData(input.([]byte))
	if err != nil {
		return nil, err
	}

	if len(swagger.Paths) < 1 {
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
		globalUpstreamID = o.TaskName + "_global"
		// global uri prefix
		globalPath = ""
	)

	// create upstream when global Servers exist
	if len(s.Servers) > 0 {
		var upstream entity.Upstream
		upstream, globalPath = generateUpstreamByServers(s.Servers, globalUpstreamID)
		data.Upstreams = append(data.Upstreams, upstream)
	}

	// each one will correspond to a route
	for uri, v := range s.Paths {
		realUri := regURIVar.ReplaceAllString(uri, "*")
		routeID := o.TaskName + "_" + strings.NewReplacer("/", "-", "{", "", "}", "").Replace(strings.TrimPrefix(uri, "/"))

		// decide whether to merge multi method routes based on configuration
		if o.MergeRoute {
			// create a single route for each path
			route := generateBaseRoute(routeID, v.Summary)
			route.Uris = []string{realUri}

			// merge methods
			for method := range v.Operations() {
				route.Methods = append(route.Methods, strings.ToUpper(method))
			}

			// add upstream
			if len(v.Servers) > 0 {
				// create a new upstream when current path has separate Servers
				upstreamID := routeID
				upstream, path := generateUpstreamByServers(s.Servers, upstreamID)
				data.Upstreams = append(data.Upstreams, upstream)
				route.UpstreamID = upstreamID
				route.Uris = []string{path + realUri}
			} else {
				route.UpstreamID = globalUpstreamID
				route.Uris = []string{globalPath + realUri}
			}

			data.Routes = append(data.Routes, route)
		} else {
			// create routes for each method of each path
			for method, operation := range v.Operations() {
				subRouteID := routeID + "_" + method
				route := generateBaseRoute(subRouteID, operation.Summary)
				route.Uris = []string{realUri}
				route.Methods = []string{strings.ToUpper(method)}

				if operation.Servers != nil && len(*operation.Servers) > 0 {
					// create a new upstream when current path has separate Servers
					upstreamID := subRouteID
					upstream, path := generateUpstreamByServers(*operation.Servers, upstreamID)
					data.Upstreams = append(data.Upstreams, upstream)
					route.UpstreamID = upstreamID
					route.Uris = []string{path + realUri}
				} else {
					route.UpstreamID = globalUpstreamID
					route.Uris = []string{globalPath + realUri}
				}

				data.Routes = append(data.Routes, route)
			}
		}
	}

	return data, nil
}

// generate upstream from OpenAPI servers field
func generateUpstreamByServers(servers openapi3.Servers, upstreamID string) (entity.Upstream, string) {
	upstream := entity.Upstream{
		BaseInfo: entity.BaseInfo{ID: upstreamID},
		UpstreamDef: entity.UpstreamDef{
			Name: upstreamID,
			Type: "roundrobin",
		},
	}

	var (
		nodes  = make(map[string]float64)
		scheme string
		path   string
	)
	for _, server := range servers {
		u, err := url.Parse(server.URL)
		if err != nil {
			continue
		}

		// save the scheme and path of the first valid server
		// path may be empty
		if scheme == "" {
			scheme = u.Scheme
			path = u.Path
		}

		nodes[u.Host] = 1
	}

	upstream.Scheme = scheme
	upstream.Nodes = entity.NodesFormat(nodes)

	return upstream, path
}

// generate base sample route for customize
func generateBaseRoute(id string, desc string) entity.Route {
	return entity.Route{
		BaseInfo: entity.BaseInfo{ID: id},
		Name:     id,
		Desc:     desc,
		Plugins:  make(map[string]interface{}),
	}
}
