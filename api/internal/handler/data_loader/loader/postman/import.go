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
	_ = postman
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
	var routes []*postman.Item
	routes = getItems(s.Items)

	return data, nil
}

func getItems(i *postman.Items) (i *postman.Items) {
	var item *postman.Item
	_ = item
	for _,v := range s.Items {

		for getItems(v) != nil {
			getItems(v)
		}
	}
	return i.Items
}

