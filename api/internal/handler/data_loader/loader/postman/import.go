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
package postman

import (
	"github.com/apisix/manager-api/internal/core/entity"
	"fmt"
	"bytes"
	"reflect"
	"time"
	"strings"
	"github.com/apisix/manager-api/internal/handler/data_loader/loader"

	postman "github.com/rbretecher/go-postman-collection"

)

func (o Loader) Import(input interface{}) (*loader.DataSets, error) {
	if input == nil {
		panic("handler/data_loader: input is nil")
	}

	d, ok := input.([]byte)
	_ = d
	if !ok {
                panic(fmt.Sprintf("handler/data_loader: input format error: expected []byte but it is %s", reflect.TypeOf(input).Kind().String()))
        }


	if !ok {
                panic(fmt.Sprintf("input format error: expected []byte but it is %s", reflect.TypeOf(input).Kind().String()))
        }

	// Load postman document
	r := bytes.NewReader(d)
	postman, err := postman.ParseCollection(r)
	if err != nil {
                return nil, err
        }

	if o.TaskName == "" {
		o.TaskName = "postman_" + time.Now().Format("20060102150405")
	}

	data, err := o.convertToEntities(postman)
	if err != nil {
		return nil, err
	}


	return data, nil
}

func (o Loader) convertToEntities(s *postman.Collection) (*loader.DataSets, error) {
	var (
		// temporarily save the parsed data
		data = &loader.DataSets{}

		// global upstream ID
		globalUpstreamID = o.TaskName

		// global uri prefix
		globalPath = ""
		_ = globalPath

	)

	// Create upstream when servers field not empty
	if len(s.Items) > 0 {
		var upstream entity.Upstream
		upstream = entity.Upstream{
			BaseInfo: entity.BaseInfo{ID: globalUpstreamID},
			UpstreamDef: entity.UpstreamDef{
				Name: globalUpstreamID,
				Type: "roundrobin",
				Nodes: map[string]float64{
					"0.0.0.0": 1,
				},
			},
		}
		data.Upstreams = append(data.Upstreams, upstream)
	}

	// Get all route items
	var result []*postman.Items
	getItems(s.Items, &result)

	for _,v := range result {
		// global uri prefix
                globalPath = ""

		path := "/"
		name := ""
		if len(v.Request.URL.Path) > 0 {
			for i,_ := range v.Request.URL.Path {
				if strings.HasPrefix(v.Request.URL.Path[i], ":") {
					name = name + "/{" + v.Request.URL.Path[i][1:] + "}"
					//fmt.Print(v.Request.URL.Path[i])
					v.Request.URL.Path[i] = "*"
				} else {
					name = name + v.Request.URL.Path[i]
				}
			}
			path = "/"+strings.Join(v.Request.URL.Path, "/")
		}

		// generate route Name
                routeName := o.TaskName + "_" + strings.TrimPrefix(name, "/")
		// equivalent to description in openapi3
		description := v.Name
		//_ = routeName
		//_ = name
		// fmt.Printf("%#v", string(v.Request.Method))
		method := string(v.Request.Method)
		subRouteID := routeName + "_" + method
		route := generateBaseRoute(subRouteID, description)
		route.Uris =  []string{globalPath + path}
		route.Methods = []string{strings.ToUpper(method)}
		route.UpstreamID = globalUpstreamID
		data.Routes = append(data.Routes, route)
	}

	return data, nil
}

func getItems(i []*postman.Items, result *[]*postman.Items) {
	for _,v := range i {
		if v.Items != nil {
			getItems(v.Items, result)
		} else {
			*result = append(*result, v)

		}
	}
}

// Generate a base route for customize
func generateBaseRoute(name string, desc string) entity.Route {
        return entity.Route{
                Name:    name,
                Desc:    desc,
                Plugins: make(map[string]interface{}),
        }
}

