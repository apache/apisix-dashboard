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
package service

import (
	"reflect"
	"strings"

	"github.com/api7/go-jsonpatch"
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
	serviceStore store.Interface
}

func NewHandler() (handler.RouteRegister, error) {
	return &Handler{
		serviceStore: store.GetStore(store.HubKeyService),
	}, nil
}

func (h *Handler) ApplyRoute(r *gin.Engine) {
	r.GET("/apisix/admin/services/:id", wgin.Wraps(h.Get,
		wrapper.InputType(reflect.TypeOf(GetInput{}))))
	r.GET("/apisix/admin/services", wgin.Wraps(h.List,
		wrapper.InputType(reflect.TypeOf(ListInput{}))))
	r.POST("/apisix/admin/services", wgin.Wraps(h.Create,
		wrapper.InputType(reflect.TypeOf(entity.Service{}))))
	r.PUT("/apisix/admin/services/:id", wgin.Wraps(h.Update,
		wrapper.InputType(reflect.TypeOf(UpdateInput{}))))
	r.PATCH("/apisix/admin/services/:id", wgin.Wraps(h.Patch,
		wrapper.InputType(reflect.TypeOf(UpdateInput{}))))
	r.DELETE("/apisix/admin/services/:ids", wgin.Wraps(h.BatchDelete,
		wrapper.InputType(reflect.TypeOf(BatchDelete{}))))
}

type GetInput struct {
	ID string `auto_read:"id,path" validate:"required"`
}

func (h *Handler) Get(c droplet.Context) (interface{}, error) {
	input := c.Input().(*GetInput)

	r, err := h.serviceStore.Get(input.ID)
	if err != nil {
		return nil, err
	}
	return r, nil
}

type ListInput struct {
	ID string `auto_read:"id,query"`
	data.Pager
}

func (h *Handler) List(c droplet.Context) (interface{}, error) {
	input := c.Input().(*ListInput)

	ret, err := h.serviceStore.List(store.ListInput{
		Predicate: func(obj interface{}) bool {
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
	input := c.Input().(*entity.Service)

	if err := h.serviceStore.Create(c.Context(), input); err != nil {
		return nil, err
	}

	return nil, nil
}

type UpdateInput struct {
	ID string `auto_read:"id,path"`
	entity.Service
}

func (h *Handler) Update(c droplet.Context) (interface{}, error) {
	input := c.Input().(*UpdateInput)
	input.Service.ID = input.ID

	if err := h.serviceStore.Update(c.Context(), &input.Service); err != nil {
		return nil, err
	}

	return nil, nil
}

type BatchDelete struct {
	IDs string `auto_read:"ids,path"`
}

func (h *Handler) BatchDelete(c droplet.Context) (interface{}, error) {
	input := c.Input().(*BatchDelete)

	if err := h.serviceStore.BatchDelete(c.Context(), strings.Split(input.IDs, ",")); err != nil {
		return nil, err
	}

	return nil, nil
}

func (h *Handler) Patch(c droplet.Context) (interface{}, error) {
	input := c.Input().(*UpdateInput)
	arr := strings.Split(input.ID, "/")
	var subPath string
	if len(arr) > 1 {
		input.ID = arr[0]
		subPath = arr[1]
	}

	stored, err := h.serviceStore.Get(input.ID)
	if err != nil {
		return nil, err
	}

	var patch jsonpatch.Patch
	if subPath != "" {
		patch = jsonpatch.Patch{
			Operations: []jsonpatch.PatchOperation{
				{Op: jsonpatch.Replace, Path: subPath, Value: c.Input()},
			},
		}
	} else {
		patch, err = jsonpatch.MakePatch(stored, input.Service)
		if err != nil {
			return nil, err
		}
	}

	err = patch.Apply(&stored)
	if err != nil {
		return nil, err
	}

	if err := h.serviceStore.Update(c.Context(), &stored); err != nil {
		return nil, err
	}

	return nil, nil
}
