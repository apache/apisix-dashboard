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
package consumer

import (
	"reflect"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/shiningrush/droplet"
	"github.com/shiningrush/droplet/wrapper"
	wgin "github.com/shiningrush/droplet/wrapper/gin"

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/apisix/manager-api/internal/handler"
)

type Handler struct {
	consumerStore store.Interface
}

func NewHandler() (handler.RouteRegister, error) {
	return &Handler{
		consumerStore: store.GetStore(store.HubKeyConsumer),
	}, nil
}

func (h *Handler) ApplyRoute(r *gin.Engine) {
	r.GET("/apisix/admin/consumers/:username", wgin.Wraps(h.Get,
		wrapper.InputType(reflect.TypeOf(GetInput{}))))
	r.GET("/apisix/admin/consumers", wgin.Wraps(h.List,
		wrapper.InputType(reflect.TypeOf(ListInput{}))))
	r.POST("/apisix/admin/consumers", wgin.Wraps(h.Create,
		wrapper.InputType(reflect.TypeOf(entity.Consumer{}))))
	r.PUT("/apisix/admin/consumers/:username", wgin.Wraps(h.Update,
		wrapper.InputType(reflect.TypeOf(UpdateInput{}))))
	r.PUT("/apisix/admin/consumers", wgin.Wraps(h.Update,
		wrapper.InputType(reflect.TypeOf(UpdateInput{}))))
	r.DELETE("/apisix/admin/consumers/:usernames", wgin.Wraps(h.BatchDelete,
		wrapper.InputType(reflect.TypeOf(BatchDeleteInput{}))))
}

type GetInput struct {
	Username string `auto_read:"username,path" validate:"required"`
}

func (h *Handler) Get(c droplet.Context) (interface{}, error) {
	input := c.Input().(*GetInput)

	r, err := h.consumerStore.Get(input.Username)
	if err != nil {
		return handler.SpecCodeResponse(err), err
	}
	return r, nil
}

type ListInput struct {
	Username string `auto_read:"username,query"`
	store.Pagination
}

// swagger:operation GET /apisix/admin/consumers getConsumerList
//
// Return the consumer list according to the specified page number and page size, and can search consumers by username.
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
// - name: username
//   in: query
//   description: username of consumer
//   required: false
//   type: string
// responses:
//   '0':
//     description: list response
//     schema:
//       type: array
//       items:
//         "$ref": "#/definitions/consumer"
//   default:
//     description: unexpected error
//     schema:
//       "$ref": "#/definitions/ApiError"
func (h *Handler) List(c droplet.Context) (interface{}, error) {
	input := c.Input().(*ListInput)

	ret, err := h.consumerStore.List(store.ListInput{
		Predicate: func(obj interface{}) bool {
			if input.Username != "" {
				return strings.Contains(obj.(*entity.Consumer).Username, input.Username)
			}
			return true
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
	input := c.Input().(*entity.Consumer)
	input.ID = input.Username

	ensurePluginsDefValue(input.Plugins)
	if err := h.consumerStore.Create(c.Context(), input); err != nil {
		return handler.SpecCodeResponse(err), err
	}

	return nil, nil
}

type UpdateInput struct {
	Username string `auto_read:"username,path"`
	entity.Consumer
}

func (h *Handler) Update(c droplet.Context) (interface{}, error) {
	input := c.Input().(*UpdateInput)
	if input.Username != "" {
		input.Consumer.Username = input.Username
	}
	input.Consumer.ID = input.Consumer.Username
	ensurePluginsDefValue(input.Plugins)

	if err := h.consumerStore.Update(c.Context(), &input.Consumer, true); err != nil {
		return handler.SpecCodeResponse(err), err
	}

	return nil, nil
}

func ensurePluginsDefValue(plugins map[string]interface{}) {
	if plugins["jwt-auth"] != nil {
		jwtAuth, ok := plugins["jwt-auth"].(map[string]interface{})
		if ok && jwtAuth["exp"] == nil {
			jwtAuth["exp"] = 86400
		}
	}
}

type BatchDeleteInput struct {
	UserNames string `auto_read:"usernames,path"`
}

func (h *Handler) BatchDelete(c droplet.Context) (interface{}, error) {
	input := c.Input().(*BatchDeleteInput)

	if err := h.consumerStore.BatchDelete(c.Context(), strings.Split(input.UserNames, ",")); err != nil {
		return handler.SpecCodeResponse(err), err
	}

	return nil, nil
}
