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
	"context"
	"encoding/json"
	"errors"
	"fmt"
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
	"github.com/apisix/manager-api/internal/utils/consts"
)

type Handler struct {
	routeStore      store.Interface
	serviceStore    store.Interface
	consumerStore   store.Interface
	globalRuleStore store.Interface
	protoStore      store.Interface
}

func NewHandler() (handler.RouteRegister, error) {
	return &Handler{
		routeStore:      store.GetStore(store.HubKeyRoute),
		serviceStore:    store.GetStore(store.HubKeyService),
		consumerStore:   store.GetStore(store.HubKeyConsumer),
		globalRuleStore: store.GetStore(store.HubKeyGlobalRule),
		protoStore:      store.GetStore(store.HubKeyProto),
	}, nil
}

func (h *Handler) ApplyRoute(r *gin.Engine) {
	r.GET("/apisix/admin/proto/:id", wgin.Wraps(h.Get,
		wrapper.InputType(reflect.TypeOf(GetInput{}))))
	r.GET("/apisix/admin/proto", wgin.Wraps(h.List,
		wrapper.InputType(reflect.TypeOf(ListInput{}))))
	r.POST("/apisix/admin/proto", wgin.Wraps(h.Create,
		wrapper.InputType(reflect.TypeOf(entity.Proto{}))))
	r.PUT("/apisix/admin/proto", wgin.Wraps(h.Update,
		wrapper.InputType(reflect.TypeOf(UpdateInput{}))))
	r.PUT("/apisix/admin/proto/:id", wgin.Wraps(h.Update,
		wrapper.InputType(reflect.TypeOf(UpdateInput{}))))
	r.PATCH("/apisix/admin/proto/:id", wgin.Wraps(h.Patch,
		wrapper.InputType(reflect.TypeOf(PatchInput{}))))
	r.PATCH("/apisix/admin/proto/:id/*path", wgin.Wraps(h.Patch,
		wrapper.InputType(reflect.TypeOf(PatchInput{}))))
	r.DELETE("/apisix/admin/proto/:id", wgin.Wraps(h.Delete,
		wrapper.InputType(reflect.TypeOf(DeleteInput{}))))
}

var plugins = []string{"grpc-transcode"}

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
	ret, err := h.protoStore.Get(c.Context(), input.ID.(string))
	if err != nil {
		return handler.SpecCodeResponse(err), err
	}
	if ret != nil {
		return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest}, errors.New("proto id exists")
	}

	// create
	ret, err = h.protoStore.Create(c.Context(), input)
	if err != nil {
		return handler.SpecCodeResponse(err), err
	}

	return ret, nil
}

type UpdateInput struct {
	ID string `auto_read:"id,path"`
	entity.Proto
}

func (h *Handler) Update(c droplet.Context) (interface{}, error) {
	input := c.Input().(*UpdateInput)

	// check if ID in body is equal ID in path
	if err := handler.IDCompare(input.ID, input.Proto.ID); err != nil {
		return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest}, err
	}

	if input.ID != "" {
		input.Proto.ID = input.ID
	}

	// check proto id exist
	ret, err := h.protoStore.Get(c.Context(), input.Proto.ID.(string))
	fmt.Println(input.Proto.ID, ret, err)
	if ret == nil {
		return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest}, errors.New("proto id not exists")
	}

	res, err := h.protoStore.Update(c.Context(), &input.Proto, true)
	if err != nil {
		return handler.SpecCodeResponse(err), err
	}

	return res, nil
}

type PatchInput struct {
	ID      string `auto_read:"id,path"`
	SubPath string `auto_read:"path,path"`
	Body    []byte `auto_read:"@body"`
}

func (h *Handler) Patch(c droplet.Context) (interface{}, error) {
	input := c.Input().(*PatchInput)
	reqBody := input.Body
	id := input.ID
	subPath := input.SubPath

	stored, err := h.protoStore.Get(c.Context(), id)
	if err != nil {
		return handler.SpecCodeResponse(err), err
	}

	res, err := utils.MergePatch(stored, subPath, reqBody)

	if err != nil {
		return handler.SpecCodeResponse(err), err
	}

	var proto entity.Proto
	if err := json.Unmarshal(res, &proto); err != nil {
		return handler.SpecCodeResponse(err), err
	}

	ret, err := h.protoStore.Update(c.Context(), &proto, false)
	if err != nil {
		return handler.SpecCodeResponse(err), err
	}

	return ret, nil
}

type DeleteInput struct {
	ID string `auto_read:"id,path"`
}

func (h *Handler) Delete(c droplet.Context) (interface{}, error) {
	input := c.Input().(*DeleteInput)

	fmt.Println(reflect.TypeOf(entity.Route{}))

	// check route plugin dependencies

	if err := checkProtoUsed(c.Context(), store.HubKeyRoute, input.ID); err != nil {
		return handler.SpecCodeResponse(err), err
	}

	// check consumer plugin dependencies
	if err := checkProtoUsed(c.Context(), store.HubKeyConsumer, input.ID); err != nil {
		return handler.SpecCodeResponse(err), err
	}

	// check service plugin dependencies
	if err := checkProtoUsed(c.Context(), store.HubKeyService, input.ID); err != nil {
		return handler.SpecCodeResponse(err), err
	}

	// check plugin template dependencies
	if err := checkProtoUsed(c.Context(), store.HubKeyPluginConfig, input.ID); err != nil {
		return handler.SpecCodeResponse(err), err
	}

	// check global plugin dependencies
	if err := checkProtoUsed(c.Context(), store.HubKeyGlobalRule, input.ID); err != nil {
		return handler.SpecCodeResponse(err), err
	}

	if err := h.protoStore.BatchDelete(c.Context(), []string{input.ID}); err != nil {
		return handler.SpecCodeResponse(err), err
	}

	return nil, nil
}

type ExistCheckInput struct {
	ID      string `auto_read:"id,query"`
	Exclude string `auto_read:"exclude,query"`
}

func (h *Handler) Exist(c droplet.Context) (interface{}, error) {
	input := c.Input().(*ExistCheckInput)
	id := input.ID
	exclude := input.Exclude

	ret, err := h.protoStore.List(c.Context(), store.ListInput{
		Predicate: func(obj interface{}) bool {
			r := obj.(*entity.Proto)
			if r.ID == id && r.ID != exclude {
				return true
			}
			return false
		},
		PageSize:   0,
		PageNumber: 0,
	})

	if err != nil {
		return nil, err
	}

	if ret.TotalSize > 0 {
		return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest}, consts.InvalidParam("Proto ID is reduplicate")
	}
	return nil, nil
}

func checkProtoUsed(ctx context.Context, resource store.HubKey, key string) error {
	ret, err := store.GetStore(resource).List(ctx, store.ListInput{
		Predicate: func(obj interface{}) bool {
			record := obj.(entity.GetPlugins)
			for _, plugin := range plugins {
				if _, ok := record.GetPlugins()[plugin]; ok {
					configs := record.GetPlugins()[plugin].(map[string]interface{})
					if !configs["disable"].(bool) && configs["proto_id"].(string) == key {
						return true
					}
				}
			}
			return false
		},
		Format: func(obj interface{}) interface{} {
			return obj.(entity.GetPlugins)
		},
		PageSize:   0,
		PageNumber: 0,
	})
	if err != nil {
		return err
	}
	if ret.TotalSize > 0 {
		return fmt.Errorf("proto used check invalid: %s: %s is using this proto", resource, ret.Rows[0].(entity.GetBaseInfo).GetBaseInfo().ID)
	}
	return nil

}
