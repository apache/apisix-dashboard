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
package route_online_debug

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"reflect"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/shiningrush/droplet"
	"github.com/shiningrush/droplet/data"
	"github.com/shiningrush/droplet/wrapper"
	wgin "github.com/shiningrush/droplet/wrapper/gin"

	"github.com/apisix/manager-api/internal/handler"
)

type Handler struct {
}

func NewHandler() (handler.RouteRegister, error) {
	return &Handler{}, nil
}

type ProtocolSupport interface {
	RequestForwarding(c droplet.Context) (interface{}, error)
}

func (h *Handler) ApplyRoute(r *gin.Engine) {
	r.POST("/apisix/admin/debug-request-forwarding", wgin.Wraps(h.DebugRequestForwarding,
		wrapper.InputType(reflect.TypeOf(DebugOnlineInput{}))))
}

type DebugOnlineInput struct {
	URL             string `auto_read:"online_debug_url,header"`
	RequestProtocol string `auto_read:"online_debug_request_protocol,header"`
	Method          string `auto_read:"online_debug_method,header"`
	HeaderParams    string `auto_read:"online_debug_header_params,header"`
	ContentType     string `auto_read:"Content-Type,header"`
	Body            []byte `auto_read:"@body"`
}

type Result struct {
	Code    int         `json:"code,omitempty"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}

func (h *Handler) DebugRequestForwarding(c droplet.Context) (interface{}, error) {
	//TODO: other Protocols, e.g: grpc, websocket
	input := c.Input().(*DebugOnlineInput)
	protocol := input.RequestProtocol
	if protocol == "" {
		protocol = "http"
	}

	protocolMap := make(map[string]ProtocolSupport)
	protocolMap["http"] = &HTTPProtocolSupport{}
	protocolMap["https"] = &HTTPProtocolSupport{}

	if v, ok := protocolMap[protocol]; ok {
		ret, err := v.RequestForwarding(c)
		return ret, err
	}

	return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest}, fmt.Errorf("protocol unsupported %s", protocol)
}

type HTTPProtocolSupport struct {
}

func (h *HTTPProtocolSupport) RequestForwarding(c droplet.Context) (interface{}, error) {
	input := c.Input().(*DebugOnlineInput)
	url := input.URL
	method := input.Method
	body := input.Body
	contentType := input.ContentType

	if url == "" || method == "" {
		return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest}, fmt.Errorf("parameters error")
	}

	client := &http.Client{}
	client.Timeout = 5 * time.Second

	var tempMap map[string][]string
	err := json.Unmarshal([]byte(input.HeaderParams), &tempMap)

	if err != nil {
		return &data.SpecCodeResponse{StatusCode: http.StatusInternalServerError}, err
	}

	req, err := http.NewRequest(strings.ToUpper(method), url, bytes.NewReader(body))
	if err != nil {
		return &data.SpecCodeResponse{StatusCode: http.StatusInternalServerError}, err
	}

	req.Header.Add("Content-Type", contentType)
	for k, v := range tempMap {
		for _, v1 := range v {
			req.Header.Add(k, v1)
		}
	}

	resp, err := client.Do(req)
	if err != nil {
		return &data.SpecCodeResponse{StatusCode: http.StatusInternalServerError}, err
	}

	defer resp.Body.Close()

	_body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return &data.SpecCodeResponse{StatusCode: http.StatusInternalServerError}, err
	}
	returnData := make(map[string]interface{})
	result := &Result{}
	err = json.Unmarshal(_body, &returnData)
	if err != nil {
		result.Code = resp.StatusCode
		result.Message = resp.Status
		result.Data = string(_body)
	} else {
		result.Code = resp.StatusCode
		result.Message = resp.Status
		result.Data = returnData
	}
	return result, nil
}
