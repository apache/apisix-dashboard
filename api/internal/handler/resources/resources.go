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

package resources

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-resty/resty/v2"
	"github.com/pkg/errors"
	"github.com/tidwall/gjson"

	"github.com/apache/apisix-dashboard/api/internal/config"
	"github.com/apache/apisix-dashboard/api/internal/handler"
)

type AdminAPIVersion = int

const (
	AdminAPIVersion2 = 2
	AdminAPIVersion3 = 3
)

var (
	resources = []string{
		"routes",
		"upstreams",
		"services",
		"consumers",
		"global_rules",
		"plugin_configs",
		"plugin_metadata",
		"protos",
		"ssls",
		"stream_routes",
	}
)

type proxyType string

var (
	proxyTypeResource proxyType = "resource"
	proxyTypeMisc     proxyType = "misc"
)

type Handler struct {
	client *resty.Client
}

func NewHandler() (handler.RouteRegister, error) {
	return &Handler{
		client: resty.New(),
	}, nil
}

func (h *Handler) ApplyRoute(r *gin.Engine, cfg config.Config) {
	h.setupClient(cfg)

	// add resource routes
	for _, resource := range resources {
		r.GET("/apisix/admin/"+resource, handler.Wrap(h.Proxy(proxyTypeResource), nil))
		r.GET("/apisix/admin/"+resource+"/*param", handler.Wrap(h.Proxy(proxyTypeResource), nil))
		r.POST("/apisix/admin/"+resource, handler.Wrap(h.Proxy(proxyTypeResource), nil))
		r.PUT("/apisix/admin/"+resource, handler.Wrap(h.Proxy(proxyTypeResource), nil))
		r.PUT("/apisix/admin/"+resource+"/*param", handler.Wrap(h.Proxy(proxyTypeResource), nil))
		r.PATCH("/apisix/admin/"+resource+"/*param", handler.Wrap(h.Proxy(proxyTypeResource), nil))
		r.DELETE("/apisix/admin/"+resource+"/*param", handler.Wrap(h.Proxy(proxyTypeResource), nil))
	}

	// add misc routes
	r.GET("/apisix/admin/plugins/list", handler.Wrap(h.Proxy(proxyTypeMisc), nil))
	r.GET("/apisix/admin/schema/*param", handler.Wrap(h.Proxy(proxyTypeMisc), nil))
}

func (h *Handler) setupClient(cfg config.Config) {
	h.client.
		SetBaseURL(cfg.DataSource[0].APISIX.Address).
		SetHeader("X-API-KEY", cfg.DataSource[0].APISIX.Key)
}

// Proxy forwards requests to Admin API
// When the proxy type is resource, post-processing is performed on the response data to unify the different response bodies of Admin API v2 and v3 into one format for frontend invocation
// When the proxy type is misc, the wrapped data is returned as is.
func (h *Handler) Proxy(pt proxyType) handler.Func {
	return func(c *gin.Context, _ interface{}) handler.Response {
		resp, err := h.proxy(c)
		if err != nil {
			return handler.Response{
				StatusCode: http.StatusInternalServerError,
				Message:    err.Error(),
			}
		}

		data := gjson.ParseBytes(resp.Body())
		if err := h.extractError(data); err != nil {
			return handler.Response{
				StatusCode: resp.StatusCode(),
				Message:    err.Error(),
			}
		}

		var resultData interface{}

		switch pt {
		case proxyTypeResource:
			version := AdminAPIVersion2
			if resp.Header().Get("X-API-VERSION") == "v3" {
				version = AdminAPIVersion3
			}

			resultData = h.processResponse(version, data)
		case proxyTypeMisc:
			fallthrough
		default:
			resultData = data.Value()
		}

		return handler.Response{
			Success: true,
			Data:    resultData,
		}
	}
}

// proxy forwards user requests for these interfaces to the Admin API as-is.
func (h *Handler) proxy(c *gin.Context) (*resty.Response, error) {
	req := h.client.NewRequest()
	req.SetHeaderMultiValues(c.Request.Header)
	req.SetQueryParamsFromValues(c.Request.URL.Query())
	req.SetBody(c.Request.Body)

	resourceURI := strings.Replace(c.Request.URL.Path, "/apisix/admin", "", 1)
	resp, err := req.Execute(c.Request.Method, resourceURI)
	if err != nil {
		// TODO record error logs
		// We need to record logs in conjunction with the request id so that users can check for problems.
		return nil, errors.New("Admin API request failed")
	}

	return resp, nil
}

func (h *Handler) extractError(data gjson.Result) error {
	if data.Get("error_msg").Exists() {
		return errors.New(data.Get("error_msg").String())
	}
	if data.Get("message").Exists() {
		return errors.New(data.Get("message").String())
	}
	return nil
}

// processResponse processes the response body of the Admin API, converting it to a format that meets the needs of Dashboard
func (h *Handler) processResponse(ver AdminAPIVersion, data gjson.Result) map[string]interface{} {
	var respData map[string]interface{}
	if ver == AdminAPIVersion3 {
		respData = h.processResponseV3(data)
	} else {
		respData = h.processResponseV2(data)
	}
	return respData
}

// processResponseV3 handle the response body style of Admin API v3, converting it to a format that meets the needs of Dashboard
func (h *Handler) processResponseV3(data gjson.Result) map[string]interface{} {
	if deleted := data.Get("deleted"); deleted.Exists() && deleted.Int() == 1 {
		return nil
	}

	if list := data.Get("list"); list.Exists() {
		if len(data.Get("list").Array()) == 0 {
			return map[string]interface{}{
				"list":  []interface{}{},
				"total": 0,
			}
		}

		var processedList []interface{}
		list.ForEach(func(_, value gjson.Result) bool {
			processedList = append(processedList, h.processResourceData(value))
			return true
		})
		return map[string]interface{}{
			"list":  processedList,
			"total": data.Get("total").Uint(),
		}
	}

	return h.processResourceData(data)
}

// processResponseV2 handle the response body style of Admin API v2, converting it to a format that meets the needs of Dashboard
func (h *Handler) processResponseV2(data gjson.Result) map[string]interface{} {
	action := data.Get("action").String()
	switch action {
	case "delete":
		if deleted := data.Get("deleted"); deleted.Exists() && deleted.Int() == 1 {
			return nil
		}
	case "set":
		fallthrough
	case "get":
		fallthrough
	default:
		// single query / create / update
		if data.Get("node.value").Exists() {
			return h.processResourceData(data.Get("node"))
		}

		// list query
		if list := data.Get("node.nodes"); list.Exists() {
			total := len(list.Array())

			if total <= 0 {
				return map[string]interface{}{
					"list":  []interface{}{},
					"total": 0,
				}
			}

			var processedList []interface{}
			list.ForEach(func(_, value gjson.Result) bool {
				processedList = append(processedList, h.processResourceData(value))
				return true
			})
			return map[string]interface{}{
				"list":  processedList,
				"total": total,
			}
		}
	}
	return map[string]interface{}{}
}

// processResourceData processes a single data unit, which is used to process a single query, create,
// and update response body, and it is also used to process each child of a list query separately
func (h *Handler) processResourceData(data gjson.Result) map[string]interface{} {
	return gjson.Parse(fmt.Sprintf(`{"key":"%s","value":%s}`, data.Get("key").String(), data.Get("value").Raw)).Value().(map[string]interface{})
}
