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
	"github.com/apache/apisix-dashboard/api/internal/config"
	"github.com/apache/apisix-dashboard/api/internal/handler"
	"github.com/gin-gonic/gin"
	"github.com/go-resty/resty/v2"
	"github.com/pkg/errors"
	"github.com/tidwall/gjson"
	"net/http"
)

type AdminAPIVersion = int

const (
	AdminAPIVersion2 = 2
	AdminAPIVersion3 = 3
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
	r.Any("/apisix/admin/*resource", h.Proxy)
}

func (h *Handler) setupClient(cfg config.Config) {
	h.client.
		SetBaseURL(cfg.DataSource[0].APISIX.Address).
		SetHeader("X-API-KEY", cfg.DataSource[0].APISIX.Key)
}

func (h *Handler) Proxy(c *gin.Context) {
	req := h.client.NewRequest()
	req.SetHeaderMultiValues(c.Request.Header)
	req.SetQueryParamsFromValues(c.Request.URL.Query())
	req.SetBody(c.Request.Body)

	resp, err := req.Execute(c.Request.Method, c.Param("resource"))
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, errors.New("Admin API request failed"))
	}

	fmt.Println(req.URL, resp.String())

	data := gjson.ParseBytes(resp.Body())

	// process Admin API errors
	if data.Get("error_msg").Exists() {
		c.AbortWithStatusJSON(400, gin.H{
			"success": false,
			"message": data.Get("error_msg").String(),
			"data":    gin.H{},
		})
	}
	if data.Get("message").Exists() {
		c.AbortWithStatusJSON(400, gin.H{
			"success": false,
			"message": data.Get("message").String(),
			"data":    gin.H{},
		})
	}

	// process response data
	version := AdminAPIVersion2
	if resp.Header().Get("X-API-VERSION") == "v3" {
		version = AdminAPIVersion3
	}

	c.JSON(200, h.processResponse(version, data))
}

// processResponse processes the response body of the Admin API, converting it to a format that meets the needs of Dashboard
func (h *Handler) processResponse(ver AdminAPIVersion, data gjson.Result) gin.H {
	var dataField gin.H
	if ver == AdminAPIVersion3 {
		dataField = h.processResponseV3(data)
	} else {

	}
	return gin.H{
		"success": true,
		"message": "",
		"data":    dataField,
	}
}

// processResponseV3 handle the response body style of Admin API v3, converting it to a format that meets the needs of Dashboard
func (h *Handler) processResponseV3(data gjson.Result) gin.H {
	if deleted := data.Get("deleted"); deleted.Exists() && deleted.Int() == 1 {
		return gin.H{}
	}

	if list := data.Get("list"); list.Exists() {
		total := data.Get("total").Uint()
		if total == 0 {
			return gin.H{
				"list":  []interface{}{},
				"total": 0,
			}
		}

		var processList []interface{}
		list.ForEach(func(_, value gjson.Result) bool {
			processList = append(processList, h.processResourceData(value))
			return true
		})
		return gin.H{
			"list":  processList,
			"total": total,
		}
	}

	return h.processResourceData(data)
}

// processResourceData processes a single data unit, which is used to process a single query, create,
// and update response body, and it is also used to process each child of a list query separately
func (h *Handler) processResourceData(data gjson.Result) map[string]interface{} {
	return gjson.Parse(fmt.Sprintf(`{"key":"%s","value":%s}`, data.Get("key").String(), data.Get("value").Raw)).Value().(map[string]interface{})
}
