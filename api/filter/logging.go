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
package filter

import (
	"bytes"
	"io/ioutil"
	"time"

	"github.com/apisix/manager-api/errno"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func RequestLogHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		start, host, remoteIP, path, method := time.Now(), c.Request.Host, c.ClientIP(), c.Request.URL.Path, c.Request.Method
		var val interface{}
		if method == "GET" {
			val = c.Request.URL.Query()
		} else {
			val, _ = c.GetRawData()

			// set RequestBody back
			c.Request.Body = ioutil.NopCloser(bytes.NewReader(val.([]byte)))
		}
		c.Set("requestBody", val)
		uuid, _ := c.Get("X-Request-Id")

		param, _ := c.Get("requestBody")

		switch param.(type) {
		case []byte:
			param = string(param.([]byte))
		default:
		}

		blw := &bodyLogWriter{body: bytes.NewBufferString(""), ResponseWriter: c.Writer}
		c.Writer = blw
		c.Next()
		latency := time.Now().Sub(start) / 1000000
		statusCode := c.Writer.Status()
		respBody := blw.body.String()
		if uuid == "" {
			uuid = c.Writer.Header().Get("X-Request-Id")
		}
		var errs []string
		for _, err := range c.Errors {
			if e, ok := err.Err.(*errno.ManagerError); ok {
				errs = append(errs, e.Error())
			}
		}
		logger.WithFields(logrus.Fields{
			"requestId":  uuid,
			"latency":    latency,
			"remoteIp":   remoteIP,
			"method":     method,
			"path":       path,
			"statusCode": statusCode,
			"host":       host,
			"params":     param,
			"respBody":   respBody,
			"errMsg":     errs,
		}).Info("")
	}
}

type bodyLogWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (w bodyLogWriter) Write(b []byte) (int, error) {
	w.body.Write(b)
	return w.ResponseWriter.Write(b)
}
