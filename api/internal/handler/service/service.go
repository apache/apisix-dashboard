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
	"fmt"
	"net/http"
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
	"github.com/apisix/manager-api/internal/utils"
)

type Handler struct {
	serviceStore  store.Interface
	upstreamStore store.Interface
}

func NewHandler() (handler.RouteRegister, error) {
	return &Handler{
		serviceStore:  store.GetStore(store.HubKeyService),
		upstreamStore: store.GetStore(store.HubKeyUpstream),
	}, nil
}

func (h *Handler) ApplyRoute(r *gin.Engine) {
	r.GET("/apisix/admin/services/:id", wgin.Wraps(h.Get,
		wrapper.InputType(reflect.TypeOf(GetInput{}))))
	r.GET("/apisix/admin/services", wgin.Wraps(h.List,
		wrapper.InputType(reflect.TypeOf(ListInput{}))))
	r.POST("/apisix/admin/services", wgin.Wraps(h.Create,
		wrapper.InputType(reflect.TypeOf(entity.Service{}))))
	r.PUT("/apisix/admin/services", wgin.Wraps(h.Update,
		wrapper.InputType(reflect.TypeOf(UpdateInput{}))))
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
		return handler.SpecCodeResponse(err), err
	}

	service := r.(*entity.Service)
	if service.Upstream != nil && service.Upstream.Nodes != nil {
		service.Upstream.Nodes = entity.NodesFormat(service.Upstream.Nodes)
	}

	return r, nil
}

type ListInput struct {
	Name string `auto_read:"name,query"`
	store.Pagination
}

// swagger:operation GET /apisix/admin/services getServiceList
//
// Return the service list according to the specified page number and page size, and can search services by name.
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
// - name: name
//   in: query
//   description: name of service
//   required: false
//   type: string
// responses:
//   '0':
//     description: list response
//     schema:
//       type: array
//       items:
//         "$ref": "#/definitions/service"
//   default:
//     description: unexpected error
//     schema:
//       "$ref": "#/definitions/ApiError"
func (h *Handler) List(c droplet.Context) (interface{}, error) {
	input := c.Input().(*ListInput)

	ret, err := h.serviceStore.List(store.ListInput{
		Predicate: func(obj interface{}) bool {
			if input.Name != "" {
				return strings.Contains(obj.(*entity.Service).Name, input.Name)
			}
			return true
		},
		Format: func(obj interface{}) interface{} {
			service := obj.(*entity.Service)
			if service.Upstream != nil && service.Upstream.Nodes != nil {
				service.Upstream.Nodes = entity.NodesFormat(service.Upstream.Nodes)
			}
			return service
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

	if input.UpstreamID != nil {
		upstreamID := utils.InterfaceToString(input.UpstreamID)
		_, err := h.upstreamStore.Get(upstreamID)
		if err != nil {
			if err == data.ErrNotFound {
				return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
					fmt.Errorf("upstream id: %s not found", input.UpstreamID)
			}
			return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest}, err
		}
	}

	ret, err := h.serviceStore.Create(c.Context(), input)
	if err != nil {
		return handler.SpecCodeResponse(err), err
	}

	return ret, nil
}

type UpdateInput struct {
	ID string `auto_read:"id,path"`
	entity.Service
}

func (h *Handler) Update(c droplet.Context) (interface{}, error) {
	input := c.Input().(*UpdateInput)

	// check if ID in body is equal ID in path
	if err := handler.IDCompare(input.ID, input.Service.ID); err != nil {
		return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest}, err
	}

	if input.ID != "" {
		input.Service.ID = input.ID
	}

	if input.UpstreamID != nil {
		upstreamID := utils.InterfaceToString(input.UpstreamID)
		_, err := h.upstreamStore.Get(upstreamID)
		if err != nil {
			if err == data.ErrNotFound {
				return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
					fmt.Errorf("upstream id: %s not found", input.UpstreamID)
			}
			return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest}, err
		}
	}

	if err := h.serviceStore.Update(c.Context(), &input.Service, true); err != nil {
		return handler.SpecCodeResponse(err), err
	}

	return nil, nil
}

type BatchDelete struct {
	IDs string `auto_read:"ids,path"`
}

func (h *Handler) BatchDelete(c droplet.Context) (interface{}, error) {
	input := c.Input().(*BatchDelete)

	if err := h.serviceStore.BatchDelete(c.Context(), strings.Split(input.IDs, ",")); err != nil {
		return handler.SpecCodeResponse(err), err
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
		return handler.SpecCodeResponse(err), err
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
			return handler.SpecCodeResponse(err), err
		}
	}

	if err := patch.Apply(&stored); err != nil {
		return handler.SpecCodeResponse(err), err
	}

	if err := h.serviceStore.Update(c.Context(), &stored, false); err != nil {
		return handler.SpecCodeResponse(err), err
	}

	return nil, nil
}
