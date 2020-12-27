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
package plugin

import (
	"reflect"

	"github.com/gin-gonic/gin"
	"github.com/shiningrush/droplet"
	"github.com/shiningrush/droplet/wrapper"
	wgin "github.com/shiningrush/droplet/wrapper/gin"

	"github.com/apisix/manager-api/internal/conf"
	"github.com/apisix/manager-api/internal/handler"
)

type Handler struct {
}

func NewHandler() (handler.RouteRegister, error) {
	return &Handler{}, nil
}

func (h *Handler) ApplyRoute(r *gin.Engine) {
	r.GET("/apisix/admin/plugins", wgin.Wraps(h.Plugins,
		wrapper.InputType(reflect.TypeOf(ListInput{}))))
	r.GET("/apisix/admin/schema/plugins/:name", wgin.Wraps(h.Schema,
		wrapper.InputType(reflect.TypeOf(GetInput{}))))
}

type GetInput struct {
	Name       string `auto_read:"name,path" validate:"required"`
	SchemaType string `auto_read:"schema_type,query"`
}

func (h *Handler) Schema(c droplet.Context) (interface{}, error) {
	input := c.Input().(*GetInput)

	var ret interface{}
	if input.SchemaType == "consumer" {
		ret = conf.Schema.Get("plugins." + input.Name + ".consumer_schema").Value()
		if ret == nil {
			ret = conf.Schema.Get("plugins." + input.Name + ".schema").Value()
		}
	} else {
		ret = conf.Schema.Get("plugins." + input.Name + ".schema").Value()
	}
	return ret, nil
}

type ListInput struct {
	All bool `auto_read:"all,query"`
}

func (h *Handler) Plugins(c droplet.Context) (interface{}, error) {
	input := c.Input().(*ListInput)

	plugins := conf.Schema.Get("plugins")
	if input.All {
		var res []map[string]interface{}
		list := plugins.Value().(map[string]interface{})
		for name, conf := range list {
			plugin := conf.(map[string]interface{})
			plugin["name"] = name
			if _, ok := plugin["type"]; !ok {
				plugin["type"] = "other"
			}
			res = append(res, plugin)
		}
		return res, nil
	}

	var ret []string
	list := plugins.Map()
	for pluginName := range list {
		if pluginName != "serverless-post-function" && pluginName != "serverless-pre-function" {
			ret = append(ret, pluginName)
		}
	}

	return ret, nil
}
