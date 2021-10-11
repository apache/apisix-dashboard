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
package proto

import (
	"errors"
	"net/http"
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
	"github.com/apisix/manager-api/internal/utils"
)

type Handler struct {
	protoStore store.Interface
}

func NewHandler() (handler.RouteRegister, error) {
	return &Handler{
		protoStore: store.GetStore(store.HubKeyProto),
	}, nil
}

func (h *Handler) ApplyRoute(r *gin.Engine) {
	r.GET("/apisix/admin/proto/:id", wgin.Wraps(h.Get,
		wrapper.InputType(reflect.TypeOf(GetInput{}))))
	r.GET("/apisix/admin/proto", wgin.Wraps(h.List,
		wrapper.InputType(reflect.TypeOf(ListInput{}))))
	r.POST("/apisix/admin/proto", wgin.Wraps(h.Create,
		wrapper.InputType(reflect.TypeOf(entity.Proto{}))))
}

type GetInput struct {
	ID string `auto_read:"id,path" validate:"required"`
}

func (h *Handler) Get(c droplet.Context) (interface{}, error) {
	input := c.Input().(*GetInput)

	r, err := h.protoStore.Get(c.Context(), input.ID)
	if err != nil {
		return handler.SpecCodeResponse(err), err
	}

	proto := r.(*entity.Proto)

	return proto, nil
}

type ListInput struct {
	Desc string `auto_read:"desc,query"`
	store.Pagination
}

func (h *Handler) List(c droplet.Context) (interface{}, error) {
	input := c.Input().(*ListInput)

	ret, err := h.protoStore.List(c.Context(), store.ListInput{
		Predicate: func(obj interface{}) bool {
			if input.Desc != "" {
				return strings.Contains(obj.(*entity.Proto).Desc, input.Desc)
			}
			return true
		},
		Format: func(obj interface{}) interface{} {
			upstream := obj.(*entity.Proto)
			return upstream
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
	input := c.Input().(*entity.Proto)

	// check proto id exist
	if input.ID != nil {
		protoID := utils.InterfaceToString(input.ID)
		ret, err := h.protoStore.Get(c.Context(), protoID)
		if err != nil && err != data.ErrNotFound {
			return handler.SpecCodeResponse(err), err
		}
		if ret != nil {
			return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest}, errors.New("proto id exists")
		}
	}

	// create
	ret, err := h.protoStore.Create(c.Context(), input)
	if err != nil {
		return handler.SpecCodeResponse(err), err
	}

	return ret, nil
}
