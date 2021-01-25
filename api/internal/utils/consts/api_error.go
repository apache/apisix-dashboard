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
package consts

import (
	"github.com/gin-gonic/gin"
)

type WrapperHandle func(c *gin.Context) (interface{}, error)

// swagger:model ApiError
type ApiError struct {
	Status int `json:"-"`
	// response code
	Code int `json:"code"`
	// response message
	Message string `json:"message"`
}

func (err ApiError) Error() string {
	return err.Message
}

func InvalidParam(message string) *ApiError {
	return &ApiError{400, 10000, message}
}

func SystemError(message string) *ApiError {
	return &ApiError{500, 10001, message}
}

func NotFound(message string) *ApiError {
	return &ApiError{404, 10002, message}
}
