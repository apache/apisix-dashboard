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
	"fmt"
	"reflect"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/shiningrush/droplet"
	"github.com/shiningrush/droplet/data"
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
	r.DELETE("/apisix/admin/consumers/:usernames", wgin.Wraps(h.BatchDelete,
		wrapper.InputType(reflect.TypeOf(BatchDelete{}))))
}

type GetInput struct {
	Username string `auto_read:"username,path" validate:"required"`
}

func (h *Handler) Get(c droplet.Context) (interface{}, error) {
	input := c.Input().(*GetInput)

	r, err := h.consumerStore.Get(input.Username)
	if err != nil {
		return nil, err
	}
	return r, nil
}

type ListInput struct {
	Username string `auto_read:"username,query"`
	data.Pager
}

func (h *Handler) List(c droplet.Context) (interface{}, error) {
	input := c.Input().(*ListInput)

	ret, err := h.consumerStore.List(store.ListInput{
		Predicate: func(obj interface{}) bool {
			if input.Username != "" {
				return strings.Index(obj.(*entity.Consumer).Username, input.Username) > 0
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
	if input.ID != "" && input.ID != input.Username {
		return nil, fmt.Errorf("consumer's id and username must be a same value")
	}
	input.ID = input.Username

	if err := h.consumerStore.Create(c.Context(), input); err != nil {
		return nil, err
	}

	return nil, nil
}

type UpdateInput struct {
	Username string `auto_read:"username,path"`
	entity.Consumer
}

func (h *Handler) Update(c droplet.Context) (interface{}, error) {
	input := c.Input().(*UpdateInput)
	if input.ID != "" && input.ID != input.Username {
		return nil, fmt.Errorf("consumer's id and username must be a same value")
	}
	input.Consumer.Username = input.Username
	input.Consumer.ID = input.Username

	if err := h.consumerStore.Update(c.Context(), &input.Consumer); err != nil {
		//if not exists, create
		if err.Error() == fmt.Sprintf("key: %s is not found", input.Username) {
			if err := h.consumerStore.Create(c.Context(), &input.Consumer); err != nil {
				return nil, err
			}
		} else {
			return nil, err
		}
	}

	return nil, nil
}

type BatchDelete struct {
	UserNames string `auto_read:"usernames,path"`
}

func (h *Handler) BatchDelete(c droplet.Context) (interface{}, error) {
	input := c.Input().(*BatchDelete)

	if err := h.consumerStore.BatchDelete(c.Context(), strings.Split(input.UserNames, ",")); err != nil {
		return nil, err
	}

	return nil, nil
}
