package route

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/apisix/manager-api/conf"
	"github.com/apisix/manager-api/errno"
	"github.com/apisix/manager-api/service"
	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"
)

func AppendRouteGroup(r *gin.Engine) *gin.Engine {
	r.POST("/apisix/admin/routegroups", createRouteGroup)
	r.GET("/apisix/admin/routegroups/:gid", findRouteGroup)
	r.GET("/apisix/admin/routegroups", listRouteGroup)
	r.PUT("/apisix/admin/routegroups/:gid", updateRouteGroup)
	r.DELETE("/apisix/admin/routegroups/:gid", deleteRouteGroup)
	return r
}

func createRouteGroup(c *gin.Context) {
	u4 := uuid.NewV4()
	gid := u4.String()
	// todo 参数校验
	param, exist := c.Get("requestBody")
	if !exist || len(param.([]byte)) < 1 {
		e := errno.FromMessage(errno.RouteRequestError, "route_group create with no post data")
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	}
	// trans params
	rr := &service.RouteGroupRequest{}
	if err := rr.Parse(param); err != nil {
		e := errno.FromMessage(errno.RouteGroupRequestError, err.Error())
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	}
	rr.Id = gid
	fmt.Println(rr)
	// mysql
	if rd, err := service.Trans2RouteGroupDao(rr); err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, err.Response())
		return
	} else {
		if err := rd.CreateRouteGroup(); err != nil {
			e := errno.FromMessage(errno.DBRouteGroupError, err.Error())
			logger.Error(e.Msg)
			c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
			return
		}
	}
	c.Data(http.StatusOK, service.ContentType, errno.Success())
}

func findRouteGroup(c *gin.Context) {
	gid := c.Param("gid")
	routeGroup := &service.RouteGroupDao{}
	if err := routeGroup.FindRouteGroup(gid); err != nil {
		e := errno.FromMessage(errno.RouteGroupRequestError, err.Error()+"select error")
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	}
	resp, _ := json.Marshal(routeGroup)
	c.Data(http.StatusOK, service.ContentType, resp)
}

func listRouteGroup(c *gin.Context) {
	size, _ := strconv.Atoi(c.Query("size"))
	page, _ := strconv.Atoi(c.Query("page"))
	if size == 0 {
		size = 10
	}
	var s string

	rd := &service.RouteGroupDao{}
	routeGroupList := []service.RouteGroupDao{}
	if search, exist := c.GetQuery("search"); exist && len(search) > 0 {
		s = "%" + search + "%"
	}
	if err, count := rd.GetRouteGroupList(&routeGroupList, s, page, size); err != nil {
		e := errno.FromMessage(errno.RouteGroupRequestError, err.Error())
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
		return
	} else {
		result := &service.ListResponse{Count: count, Data: routeGroupList}
		resp, _ := json.Marshal(result)
		c.Data(http.StatusOK, service.ContentType, resp)
	}
}

func updateRouteGroup(c *gin.Context) {
	// get params
	gid := c.Param("gid")
	param, exist := c.Get("requestBody")
	if !exist || len(param.([]byte)) < 1 {
		e := errno.FromMessage(errno.RouteRequestError, "route_group update with no post data")
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	}
	// trans params
	rr := &service.RouteGroupRequest{}
	if err := rr.Parse(param); err != nil {
		e := errno.FromMessage(errno.RouteGroupRequestError, err.Error())
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	}
	rr.Id = gid
	if ud, err := service.Trans2RouteGroupDao(rr); err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, err.Response())
		return
	} else {
		// mysql
		if err2 := ud.UpdateRouteGroup(); err2 != nil {
			e := errno.FromMessage(errno.DBRouteGroupError, err2.Error())
			logger.Error(e.Msg)
			c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
			return
		}
	}
	c.Data(http.StatusOK, service.ContentType, errno.Success())
}

func deleteRouteGroup(c *gin.Context) {
	gid := c.Param("gid")
	// 参数校验
	RouteGroup := &service.RouteGroupDao{}
	if err := conf.DB().Table("route_group").Where("id=?", gid).First(&RouteGroup).Error; err != nil {
		e := errno.FromMessage(errno.RouteGroupRequestError, err.Error()+" route_group ID: "+gid)
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	}
	// delete from mysql
	rd := &service.RouteGroupDao{}
	rd.ID = uuid.FromStringOrNil(gid)
	if err := rd.DeleteRouteGroup(); err != nil {
		e := errno.FromMessage(errno.DBRouteGroupDeleteError, err.Error())
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
		return
	}
	c.Data(http.StatusOK, service.ContentType, errno.Success())
}
