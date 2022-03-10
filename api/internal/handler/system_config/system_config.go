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
package system_config

import (
	"errors"
	"reflect"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/shiningrush/droplet"
	"github.com/shiningrush/droplet/wrapper"
	wgin "github.com/shiningrush/droplet/wrapper/gin"

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/apisix/manager-api/internal/handler"
)

type Handler struct {
	systemConfig store.Interface
}

func NewHandler() (handler.RouteRegister, error) {
	return &Handler{
		systemConfig: store.GetStore(store.HubKeySystemConfig),
	}, nil
}

func (h *Handler) ApplyRoute(r *gin.Engine) {
	r.GET("/apisix/admin/system_config/:config_name", wgin.Wraps(h.Get,
		wrapper.InputType(reflect.TypeOf(GetInput{}))))
	r.POST("/apisix/admin/system_config", wgin.Wraps(h.Post,
		wrapper.InputType(reflect.TypeOf(entity.SystemConfig{}))))
	r.PUT("/apisix/admin/system_config", wgin.Wraps(h.Put,
		wrapper.InputType(reflect.TypeOf(entity.SystemConfig{}))))
	r.DELETE("/apisix/admin/system_config/:config_name", wgin.Wraps(h.Delete,
		wrapper.InputType(reflect.TypeOf(DeleteInput{}))))
}

type GetInput struct {
	ConfigName string `auto_read:"config_name,path" validate:"required"`
}

func (h *Handler) Get(c droplet.Context) (interface{}, error) {
	input := c.Input().(*GetInput)
	r, err := h.systemConfig.Get(c.Context(), input.ConfigName)

	if err != nil {
		return handler.SpecCodeResponse(err), err
	}

	return r, nil
}

func (h *Handler) Post(c droplet.Context) (interface{}, error) {
	input := c.Input().(*entity.SystemConfig)
	input.CreateTime = time.Now().Unix()
	input.UpdateTime = time.Now().Unix()

	// TODO use json schema to do it
	if err := h.checkSystemConfig(input); err != nil {
		return handler.SpecCodeResponse(err), err
	}

	// create
	res, err := h.systemConfig.Create(c.Context(), input)
	if err != nil {
		return handler.SpecCodeResponse(err), err
	}

	return res, nil
}

func (h *Handler) Put(c droplet.Context) (interface{}, error) {
	input := c.Input().(*entity.SystemConfig)
	input.UpdateTime = time.Now().Unix()

	// TODO use json schema to do it
	if err := h.checkSystemConfig(input); err != nil {
		return handler.SpecCodeResponse(err), err
	}

	// update
	res, err := h.systemConfig.Update(c.Context(), input, false)
	if err != nil {
		return handler.SpecCodeResponse(err), err
	}

	return res, nil
}

type DeleteInput struct {
	ConfigName string `auto_read:"config_name,path" validate:"required"`
}

func (h *Handler) Delete(c droplet.Context) (interface{}, error) {
	input := c.Input().(*DeleteInput)
	err := h.systemConfig.BatchDelete(c.Context(), []string{input.ConfigName})

	if err != nil {
		return handler.SpecCodeResponse(err), err
	}

	return nil, nil
}

func (h *Handler) checkSystemConfig(input *entity.SystemConfig) error {
	if len(input.ConfigName) < 1 || len(input.ConfigName) > 100 {
		return errors.New("invalid params: config_name length must be between 1 and 100")
	}

	if len(input.Payload) < 1 {
		return errors.New("invalid params: payload is required")
	}

	return nil
}
