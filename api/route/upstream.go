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

func AppendUpstream(r *gin.Engine) *gin.Engine {
	r.POST("/apisix/admin/upstreams", createUpstream)
	r.GET("/apisix/admin/upstreams/:uid", findUpstream)
	r.GET("/apisix/admin/upstreams", listUpstream)
	r.PUT("/apisix/admin/upstreams/:uid", updateUpstream)
	r.DELETE("/apisix/admin/upstreams/:uid", deleteUpstream)
	return r
}

func createUpstream(c *gin.Context) {
	u4 := uuid.NewV4()
	uid := u4.String()
	// todo 参数校验
	param, exist := c.Get("requestBody")
	if !exist || len(param.([]byte)) < 1 {
		e := errno.FromMessage(errno.RouteRequestError, "upstream create with no post data")
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	}
	// trans params
	ur := &service.UpstreamRequest{}
	if err := ur.Parse(param); err != nil {
		e := errno.FromMessage(errno.UpstreamRequestError, err.Error())
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	}
	ur.Id = uid
	fmt.Println(ur)
	if aur, err := ur.Parse2Apisix(); err != nil {
		e := errno.FromMessage(errno.UpstreamTransError, err.Error())
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	} else {
		// apisix
		if resp, err := aur.Create(); err != nil {
			e := errno.FromMessage(errno.ApisixUpstreamCreateError, err.Error())
			logger.Error(e.Msg)
			c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
			return
		} else {
			// mysql
			fmt.Println(resp.UNode.UValue.Id)
			fmt.Println(resp.UNode.UValue.Upstream.Nodes)
			if ud, err := service.Trans2UpstreamDao(resp, ur); err != nil {
				c.AbortWithStatusJSON(http.StatusInternalServerError, err.Response())
				return
			} else {
				if err := conf.DB().Create(ud).Error; err != nil {
					e := errno.FromMessage(errno.DBUpstreamError, err.Error())
					logger.Error(e.Msg)
					c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
					return
				}
			}
		}
	}
	c.Data(http.StatusOK, service.ContentType, errno.Success())
}

func findUpstream(c *gin.Context) {
	uid := c.Param("uid")
	// find from apisix
	aur := &service.ApisixUpstreamRequest{Id: uid}
	if resp, err := aur.FindById(); err != nil {
		e := errno.FromMessage(errno.UpstreamRequestError, err.Error()+" upstream ID: "+uid)
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
		return
	} else {
		if result, err := resp.Parse2Request(); err != nil {
			e := errno.FromMessage(errno.UpstreamRequestError, err.Error()+" upstream ID: "+uid)
			logger.Error(e.Msg)
			c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
			return
		} else {
			resp, _ := json.Marshal(result)
			c.Data(http.StatusOK, service.ContentType, resp)
		}
	}
}

func listUpstream(c *gin.Context) {
	size, _ := strconv.Atoi(c.Query("size"))
	page, _ := strconv.Atoi(c.Query("page"))
	if size == 0 {
		size = 10
	}
	db := conf.DB()
	upstreamList := []service.UpstreamDao{}
	var count int
	if err := db.Order("update_time desc").Table("upstreams").Offset((page - 1) * size).Limit(size).Find(&upstreamList).Count(&count).Error; err != nil {
		e := errno.FromMessage(errno.RouteRequestError, err.Error())
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
		return
	} else {
		responseList := make([]*service.UpstreamResponse, 0)
		for _, r := range upstreamList {
			response, err := r.Parse2Response()
			if err == nil {
				responseList = append(responseList, response)
			}
		}
		result := &service.ListResponse{Count: count, Data: responseList}
		resp, _ := json.Marshal(result)
		c.Data(http.StatusOK, service.ContentType, resp)
	}
}
func updateUpstream(c *gin.Context) {
	uid := c.Param("uid")
	// todo 参数校验
	param, exist := c.Get("requestBody")
	if !exist || len(param.([]byte)) < 1 {
		e := errno.FromMessage(errno.RouteRequestError, "upstream update with no post data")
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	}
	// trans params
	ur := &service.UpstreamRequest{}
	if err := ur.Parse(param); err != nil {
		e := errno.FromMessage(errno.UpstreamRequestError, err.Error())
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	}
	ur.Id = uid
	fmt.Println(ur)
	if aur, err := ur.Parse2Apisix(); err != nil {
		e := errno.FromMessage(errno.UpstreamTransError, err.Error())
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	} else {
		// apisix
		if resp, err := aur.Update(); err != nil {
			e := errno.FromMessage(errno.ApisixUpstreamUpdateError, err.Error())
			logger.Error(e.Msg)
			c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
			return
		} else {
			// mysql
			if ud, err := service.Trans2UpstreamDao(resp, ur); err != nil {
				c.AbortWithStatusJSON(http.StatusInternalServerError, err.Response())
				return
			} else {
				if err := conf.DB().Model(&service.UpstreamDao{}).Update(ud).Error; err != nil {
					e := errno.FromMessage(errno.DBUpstreamError, err.Error())
					logger.Error(e.Msg)
					c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
					return
				}
			}
		}
	}
	c.Data(http.StatusOK, service.ContentType, errno.Success())
}

func deleteUpstream(c *gin.Context) {
	uid := c.Param("uid")
	// 参数校验
	upstream := &service.UpstreamDao{}
	if err := conf.DB().Table("upstreams").Where("id=?", uid).First(&upstream).Error; err != nil {
		e := errno.FromMessage(errno.UpstreamRequestError, err.Error()+" upstream ID: "+uid)
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	}
	// delete from apisix
	request := &service.ApisixUpstreamRequest{Id: uid}
	if _, err := request.Delete(); err != nil {
		e := errno.FromMessage(errno.ApisixUpstreamDeleteError, err.Error())
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
		return
	} else {
		// delete from mysql
		rd := &service.UpstreamDao{}
		rd.ID = uuid.FromStringOrNil(uid)
		if err := conf.DB().Delete(rd).Error; err != nil {
			e := errno.FromMessage(errno.DBUpstreamDeleteError, err.Error())
			logger.Error(e.Msg)
			c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
			return
		}
	}
	c.Data(http.StatusOK, service.ContentType, errno.Success())
}
