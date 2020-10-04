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
	"net/http"
)

type WrapperHandle func(c *gin.Context) (interface{}, error)

func ErrorWrapper(handle WrapperHandle) gin.HandlerFunc {
	return func(c *gin.Context) {
		data, err := handle(c)
		if err != nil {
			apiError := err.(*ApiError)
			c.JSON(apiError.Status, apiError)
			return
		}
		c.JSON(http.StatusOK, gin.H{"data": data, "code": 200, "message": "success"})
	}
}

type ApiError struct {
	Status  int    `json:"-"`
	Code    int    `json:"code"`
	Message string `json:"message"`
}

func (err ApiError) Error() string {
	return err.Message
}

func InvalidParam(message string) *ApiError {
	return &ApiError{400, 400, message}
}

func SystemError(message string) *ApiError {
	return &ApiError{500, 500, message}
}
