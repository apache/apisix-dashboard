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
	Code string
	Msg  string
}

var (
	//AA 01 api-manager-api
	SystemSuccess   = Message{"010000", "success"}
	SystemError     = Message{"010001", "system error"}
	BadRequestError = Message{Code: "010002", Msg: "Request format error"}
	NotFoundError   = Message{Code: "010003", Msg: "No resources found"}
	InvalidParam    = Message{"010004", "Request parameter error"}
	DBWriteError    = Message{"010005", "Database save failed"}
	DBReadError     = Message{"010006", "Database query failed"}
	DBDeleteError   = Message{"010007", "Database delete failed"}
	RecordNotExist  = Message{"010009", "Record does not exist"}

	//BB 01 config module
	ConfEnvError      = Message{"010101", "Environment variable not found: %s"}
	ConfFilePathError = Message{"010102", "Error loading configuration file: %s"}

	// BB 02 route module
	RouteRequestError      = Message{"010201", "Route request parameters are abnormal: %s"}
	ApisixRouteCreateError = Message{"010202", "Failed to create APISIX route: %s"}
	DBRouteCreateError     = Message{"010203", "Route storage failure: %s"}
	ApisixRouteUpdateError = Message{"010204", "Update APISIX routing failed: %s"}
	ApisixRouteDeleteError = Message{"010205", "Failed to remove APISIX route: %s"}
	DBRouteUpdateError     = Message{"010206", "Route update failed: %s"}
	DBRouteDeleteError     = Message{"010207", "Route remove failed: %s"}

	// 03 plugin module
	ApisixPluginListError   = Message{"010301", "List APISIX plugins  failed: %s"}
	ApisixPluginSchemaError = Message{"010301", "Find APISIX plugin schema failed: %s"}

	// 04 ssl模块
	SslParseError        = Message{"010401", "Certificate resolution failed: %s"}
	ApisixSslCreateError = Message{"010402", "Create APISIX SSL failed"}
	ApisixSslUpdateError = Message{"010403", "Update APISIX SSL failed"}
	ApisixSslDeleteError = Message{"010404", "Delete APISIX SSL failed"}

	// 06 upstream
	UpstreamRequestError      = Message{"010601", "upstream request parameters are abnormal: %s"}
	UpstreamTransError        = Message{"010602", "upstream parameter conversion is abnormal: %s"}
	DBUpstreamError           = Message{"010603", "upstream storage failure: %s"}
	ApisixUpstreamCreateError = Message{"010604", "apisix upstream create failure: %s"}
	ApisixUpstreamUpdateError = Message{"010605", "apisix upstream update failure: %s"}
	ApisixUpstreamDeleteError = Message{"010606", "apisix upstream delete failure: %s"}
	DBUpstreamDeleteError     = Message{"010607", "upstream delete failure: %s"}

	ApisixConsumerCreateError = Message{"010702", "Create APISIX Consumer failed"}
	ApisixConsumerUpdateError = Message{"010703", "Update APISIX Consumer failed"}
	ApisixConsumerDeleteError = Message{"010704", "Delete APISIX Consumer failed"}
	DuplicateUserName         = Message{"010705", "Duplicate username"}
)

type ManagerError struct {
	TraceId string
	Code    string
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
	return &ManagerError{TraceId: "", Code: m.Code, Msg: fmt.Sprintf(m.Msg, args...)}
}

func New(m Message, args ...interface{}) *ManagerError {
	return &ManagerError{TraceId: "", Code: m.Code, Msg: m.Msg, Detail: fmt.Sprintf("%s", args...)}
}

func (e *ManagerError) Response() map[string]interface{} {
	return map[string]interface{}{
		"code": e.Code,
		"msg":  e.Msg,
	}
}

func (e *ManagerError) ItemResponse(data interface{}) map[string]interface{} {
	return map[string]interface{}{
		"code": e.Code,
		"msg":  e.Msg,
		"data": data,
	}
}

func (e *ManagerError) ListResponse(count, list interface{}) map[string]interface{} {
	return map[string]interface{}{
		"code":  e.Code,
		"msg":   e.Msg,
		"count": count,
		"list":  list,
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
	Msg  string
}

func (e *HttpError) Error() string {
	return e.Msg
}
