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
	r.GET("/apisix/admin/names/routegroups", listRouteGroupName)
	r.PUT("/apisix/admin/routegroups/:gid", updateRouteGroup)
	r.DELETE("/apisix/admin/routegroups/:gid", deleteRouteGroup)
	r.GET("/apisix/admin/notexist/routegroups", isRouteGroupExist)
	return r
}

func isRouteGroupExist(c *gin.Context) {
	if name, exist := c.GetQuery("name"); exist {
		db := conf.DB()
		db = db.Table("route_group")
		exclude, exist := c.GetQuery("exclude")
		if exist {
			db = db.Where("name=? and id<>?", name, exclude)
		} else {
			db = db.Where("name=?", name)
		}
		var count int
		if err := db.Count(&count).Error; err != nil {
			e := errno.FromMessage(errno.RouteGroupRequestError, err.Error())
			logger.Error(e.Msg)
			c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
			return
		} else {
			if count == 0 {
				c.Data(http.StatusOK, service.ContentType, errno.Success())
				return
			} else {
				e := errno.FromMessage(errno.DuplicateRouteGroupName, name)
				c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
				return
			}
		}
	} else {
		e := errno.FromMessage(errno.RouteGroupRequestError, "name is needed")
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	}
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
	if err, count := routeGroup.FindRouteGroup(gid); err != nil {
		e := errno.FromMessage(errno.RouteGroupRequestError, err.Error()+"route_group ID:"+gid)
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	} else {
		if count < 1 {
			e := errno.FromMessage(errno.RouteRequestError, " route_group ID: "+gid+" not exist")
			logger.Error(e.Msg)
			c.AbortWithStatusJSON(e.Status, e.Response())
			return
		}
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

func listRouteGroupName(c *gin.Context) {
	db := conf.DB()
	routeGroupList := []service.RouteGroupDao{}
	var count int
	if err := db.Order("name").Table("route_group").Find(&routeGroupList).Count(&count).Error; err != nil {
		e := errno.FromMessage(errno.RouteGroupRequestError, err.Error())
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
		return
	} else {
		responseList := make([]*service.RouteGroupNameResponse, 0)
		for _, r := range routeGroupList {
			response, err := r.Parse2NameResponse()
			if err == nil {
				responseList = append(responseList, response)
			}
		}
		result := &service.ListResponse{Count: count, Data: responseList}
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
	routeGroup := &service.RouteGroupDao{}
	if err := conf.DB().Table("route_group").Where("id=?", gid).First(&routeGroup).Error; err != nil {
		e := errno.FromMessage(errno.RouteGroupRequestError, err.Error()+" route_group ID: "+gid)
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	}
	// delete from mysql
	routeGroup.ID = uuid.FromStringOrNil(gid)
	if err := routeGroup.DeleteRouteGroup(); err != nil {
		e := errno.FromMessage(errno.DBRouteGroupDeleteError, err.Error())
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
		return
	}
	c.Data(http.StatusOK, service.ContentType, errno.Success())
}
