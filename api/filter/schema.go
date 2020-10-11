package filter

import (
	"github.com/apisix/manager-api/errno"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/xeipuuv/gojsonschema"

	"github.com/apisix/manager-api/conf"
)

func SchemaCheck() gin.HandlerFunc {
	return func(c *gin.Context) {
		pathPrefix := "/apisix/admin/"
		resource := strings.Replace(c.Request.URL.Path, pathPrefix, "", 1)

		idx := strings.LastIndex(resource, "/")
		//remove param for access check (eg: /:id)
		if idx > 0 {
			resource = resource[:idx]
		}
		method := strings.ToUpper(c.Request.Method)
		if method != "PUT" && method != "POST" {
			logger.Info("method not need to check: ", method)
			return
		}

		//schemaDef := conf.Schema(resource, method)
		jsonPath := "main." + resource
		schemaDef := conf.Schema.Get(jsonPath).String()
		if schemaDef == "" {
			logger.Info("jsonPath: ", jsonPath, " conf.Schema: ", conf.Schema)
			return
		}

		schemaLoader := gojsonschema.NewStringLoader(schemaDef)
		reqBody, _ := c.GetRawData()
		body := string(reqBody)
		paramLoader := gojsonschema.NewStringLoader(body)

		schema, err := gojsonschema.NewSchema(schemaLoader)
		if err != nil {
			logger.Info("scheme load error:", err, body)
			return
		}
		result, err := schema.Validate(paramLoader)
		if err != nil {
			logger.Info("scheme validate error:", err)
			return
		}

		if !result.Valid() {
			actual := result.Errors()[0].String()
			err := errno.FromMessage(errno.SchemaCheckFailed, actual)
			c.AbortWithStatusJSON(http.StatusBadRequest, err.Response())
			logger.Info("schemaDef: ", schemaDef, " body: ", body)
			return
		}

		logger.Info("schemaDef: ", schemaDef, " body: ", body)

		c.Next()
	}
}
