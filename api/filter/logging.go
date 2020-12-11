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
	"time"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func RequestLogHandler(logger *zap.SugaredLogger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start, host, remoteIP, path, method := time.Now(), c.Request.Host, c.ClientIP(), c.Request.URL.Path, c.Request.Method
		query := c.Request.URL.RawQuery
		requestId := c.Writer.Header().Get("X-Request-Id")

		blw := &bodyLogWriter{body: bytes.NewBuffer(nil), ResponseWriter: c.Writer}
		c.Writer = blw
		c.Next()
		latency := time.Since(start) / 1000000
		statusCode := c.Writer.Status()
		//respBody := blw.body.String()

		var errs []string
		for _, err := range c.Errors {
			errs = append(errs, err.Error())
		}

		logger.Desugar().Info(path,
			//zap.String("path", path),
			zap.Int("status", statusCode),
			zap.String("host", host),
			zap.String("query", query),
			zap.String("requestId", requestId),
			zap.Duration("latency", latency),
			zap.String("remoteIP", remoteIP),
			zap.String("method", method),
			//zap.String("respBody", respBody),
			zap.Strings("errs", errs),
		)
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
