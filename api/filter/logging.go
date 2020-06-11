package filter

import (
	"bytes"
	"github.com/api7/api7-manager-api/errno"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"time"
)

func RequestLogHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		start, host, remoteIP, path, method := time.Now(), c.Request.Host, c.ClientIP(), c.Request.URL.Path, c.Request.Method
		var val interface{}
		if method == "GET" {
			val = c.Request.URL.Query()
		} else {
			val, _ = c.GetRawData()
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
			if e, ok := err.Err.(*errno.Api7Error); ok {
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
