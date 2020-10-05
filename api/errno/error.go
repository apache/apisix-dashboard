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
package errno

import (
	"encoding/json"
	"fmt"
)

type Message struct {
	Code   string
	Msg    string `json:"message"`
	Status int    `json:"-"`
}

var (
	//AA 01 api-manager-api
	//BB 00 system
	SystemSuccess      = Message{"010000", "success", 200}
	SystemError        = Message{"010001", "system error", 500}
	BadRequestError    = Message{"010002", "Request format error", 400}
	NotFoundError      = Message{"010003", "No resources found", 404}
	InvalidParam       = Message{"010004", "Request parameter error", 400}
	DBWriteError       = Message{"010005", "Database save failed", 500}
	DBReadError        = Message{"010006", "Database query failed", 500}
	DBDeleteError      = Message{"010007", "Database delete failed", 500}
	RecordNotExist     = Message{"010009", "Record does not exist", 404}
	InvalidParamDetail = Message{"010010", "Invalid request parameter: %s", 400}
	AdminApiSaveError  = Message{"010011", "Data save failed", 500}
	SchemaCheckFailed  = Message{"010012", "%s", 400}
	ForbiddenError     = Message{"010013", "Request Unauthorized", 401}

	//BB 01 configuration
	ConfEnvError      = Message{"010101", "Environment variable not found: %s", 500}
	ConfFilePathError = Message{"010102", "Error loading configuration file: %s", 500}

	// BB 02 route
	RouteRequestError       = Message{"010201", "Route request parameters are abnormal: %s", 400}
	ApisixRouteCreateError  = Message{"010202", "Failed to create APISIX route: %s", 500}
	DBRouteCreateError      = Message{"010203", "Route storage failure: %s", 500}
	ApisixRouteUpdateError  = Message{"010204", "Update APISIX routing failed: %s", 500}
	ApisixRouteDeleteError  = Message{"010205", "Failed to delete APISIX route: %s", 500}
	DBRouteUpdateError      = Message{"010206", "Route update failed: %s", 500}
	DBRouteDeleteError      = Message{"010207", "Route deletion failed: %s", 500}
	DBRouteReduplicateError = Message{"010208", "Route name is reduplicate : %s", 400}
	SetRouteUngroupError    = Message{"010209", "Set route ungroup err", 500}
	RoutePublishError       = Message{"010209", "Route publish error", 400}

	// 03 plugins
	ApisixPluginListError   = Message{"010301", "find APISIX plugin list failed: %s", 500}
	ApisixPluginSchemaError = Message{"010301", "find APISIX plugin schema failed: %s", 500}

	// 04 ssl
	SslParseError        = Message{"010401", "Certificate resolution failed: %s", 400}
	ApisixSslCreateError = Message{"010402", "Failed to create APISIX SSL", 500}
	ApisixSslUpdateError = Message{"010403", "Failed to update APISIX SSL", 500}
	ApisixSslDeleteError = Message{"010404", "Failed to delete APISIX SSL", 500}
	SslForSniNotExists   = Message{"010407", "Ssl for sni not exists：%s", 400}
	DuplicateSslCert     = Message{"010408", "Duplicate ssl cert", 400}

	// 06 upstream
	UpstreamRequestError       = Message{"010601", "upstream request parameters exception: %s", 400}
	UpstreamTransError         = Message{"010602", "Abnormal upstream parameter conversion: %s", 400}
	DBUpstreamError            = Message{"010603", "upstream storage failure: %s", 500}
	ApisixUpstreamCreateError  = Message{"010604", "apisix upstream create failed: %s", 500}
	ApisixUpstreamUpdateError  = Message{"010605", "apisix upstream update failed: %s", 500}
	ApisixUpstreamDeleteError  = Message{"010606", "apisix upstream delete failed: %s", 500}
	DBUpstreamDeleteError      = Message{"010607", "upstream storage delete failed: %s", 500}
	DBUpstreamReduplicateError = Message{"010608", "Upstream name is reduplicate : %s", 500}

	// 07 consumer
	ApisixConsumerCreateError = Message{"010702", "APISIX Consumer create failed", 500}
	ApisixConsumerUpdateError = Message{"010703", "APISIX Consumer update failed", 500}
	ApisixConsumerDeleteError = Message{"010704", "APISIX Consumer delete failed", 500}
	DuplicateUserName         = Message{"010705", "Duplicate consumer username", 400}

	// 08 routeGroup
	RouteGroupRequestError      = Message{"010801", "RouteGroup request parameters exception: %s", 400}
	DBRouteGroupError           = Message{"010802", "RouteGroup storage failure: %s", 500}
	DBRouteGroupDeleteError     = Message{"010803", "RouteGroup storage delete failed: %s", 500}
	RouteGroupHasRoutesError    = Message{"010804", "Route exist in this route group ", 500}
	RouteGroupSelectRoutesError = Message{"010805", "RouteGroup select routes failed : %s", 500}
	DuplicateRouteGroupName     = Message{"010806", "RouteGroup name is duplicate : %s", 500}

	// 99 authentication
	AuthenticationUserError = Message{"019901", "username or password error", 401}
)

type ManagerError struct {
	TraceId string
	Code    string
	Status  int
	Msg     string
	Data    interface{}
	Detail  string
}

// toString
func (e *ManagerError) Error() string {
	return e.Msg
}

func (e *ManagerError) ErrorDetail() string {
	return fmt.Sprintf("TraceId: %s, Code: %s, Msg: %s, Detail: %s", e.TraceId, e.Code, e.Msg, e.Detail)
}

func FromMessage(m Message, args ...interface{}) *ManagerError {
	return &ManagerError{TraceId: "", Code: m.Code, Status: m.Status, Msg: fmt.Sprintf(m.Msg, args...)}
}

func New(m Message, args ...interface{}) *ManagerError {
	return &ManagerError{TraceId: "", Code: m.Code, Msg: m.Msg, Status: m.Status, Detail: fmt.Sprintf("%s", args...)}
}

func (e *ManagerError) Response() map[string]interface{} {
	return map[string]interface{}{
		"code":    e.Code,
		"message": e.Msg,
	}
}

func (e *ManagerError) ItemResponse(data interface{}) map[string]interface{} {
	return map[string]interface{}{
		"code":    e.Code,
		"message": e.Msg,
		"data":    data,
	}
}

func (e *ManagerError) ListResponse(count, list interface{}) map[string]interface{} {
	return map[string]interface{}{
		"code":    e.Code,
		"message": e.Msg,
		"count":   count,
		"list":    list,
	}
}

func Success() []byte {
	w := FromMessage(SystemSuccess).Response()
	result, _ := json.Marshal(w)
	return result
}

func Succeed() map[string]interface{} {
	return FromMessage(SystemSuccess).Response()
}

type HttpError struct {
	Code int
	Msg  Message
}

func (e *HttpError) Error() string {
	return e.Msg.Msg
}
