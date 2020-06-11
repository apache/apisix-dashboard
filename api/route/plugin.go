package route

import (
	"encoding/json"
	"github.com/apisix/manager-api/errno"
	"github.com/apisix/manager-api/service"
	"github.com/gin-gonic/gin"
	"net/http"
)

func AppendPlugin(r *gin.Engine) *gin.Engine {
	r.GET("/apisix/admin/plugins", listPlugin)
	r.GET("/apisix/admin/schema/plugins/:name", findSchema)
	return r
}

func findSchema(c *gin.Context) {
	name := c.Param("name")
	request := &service.ApisixPluginRequest{Name: name}
	if result, err := request.Schema(); err != nil {
		e := errno.FromMessage(errno.ApisixPluginSchemaError, err.Error())
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	} else {
		resp, _ := json.Marshal(result)
		c.Data(http.StatusOK, service.ContentType, resp)
	}
}

func listPlugin(c *gin.Context) {
	request := &service.ApisixPluginRequest{}
	if result, err := request.List(); err != nil {
		e := errno.FromMessage(errno.ApisixPluginListError, err.Error())
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	} else {
		resp, _ := json.Marshal(result)
		c.Data(http.StatusOK, service.ContentType, resp)
	}
}
