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
package route

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/apisix/manager-api/conf"
	"github.com/apisix/manager-api/errno"
	"github.com/apisix/manager-api/service"
	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"
)

func AppendRoute(r *gin.Engine) *gin.Engine {
	r.POST("/apisix/admin/routes", createRoute)
	r.GET("/apisix/admin/routes/:rid", findRoute)
	r.GET("/apisix/admin/routes", listRoute)
	r.PUT("/apisix/admin/routes/:rid", updateRoute)
	r.DELETE("/apisix/admin/routes/:rid", deleteRoute)
	r.GET("/apisix/admin/notexist/routes", isRouteExist)
	return r
}

func isRouteExist(c *gin.Context) {
	if name, exist := c.GetQuery("name"); exist {
		db := conf.DB()
		db = db.Table("routes")
		exclude, exist := c.GetQuery("exclude")
		if exist {
			db = db.Where("name=? and id<>?", name, exclude)
		} else {
			db = db.Where("name=?", name)
		}
		var count int
		err := db.Count(&count).Error
		if err != nil {
			e := errno.FromMessage(errno.RouteRequestError, err.Error())
			logger.Error(e.Msg)
			c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
			return
		} else {
			if count == 0 {
				c.Data(http.StatusOK, service.ContentType, errno.Success())
				return
			} else {
				e := errno.FromMessage(errno.DBRouteReduplicateError, name)
				c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
				return
			}
		}
	} else {
		e := errno.FromMessage(errno.RouteRequestError, "name is needed")
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	}
}

func listRoute(c *gin.Context) {
	db := conf.DB()
	size, _ := strconv.Atoi(c.Query("size"))
	page, _ := strconv.Atoi(c.Query("page"))
	if size == 0 {
		size = 10
	}
	db = db.Table("routes")
	isSearch := true
	if name, exist := c.GetQuery("name"); exist {
		db = db.Where("name like ? ", "%"+name+"%")
		isSearch = false
	}
	if description, exist := c.GetQuery("description"); exist {
		db = db.Where("description like ? ", "%"+description+"%")
		isSearch = false
	}
	if host, exist := c.GetQuery("host"); exist {
		db = db.Where("hosts like ? ", "%"+host+"%")
		isSearch = false
	}
	if uri, exist := c.GetQuery("uri"); exist {
		db = db.Where("uris like ? ", "%"+uri+"%")
		isSearch = false
	}
	if ip, exist := c.GetQuery("ip"); exist {
		db = db.Where("upstream_nodes like ? ", "%"+ip+"%")
		isSearch = false
	}
	if rgid, exist := c.GetQuery("route_group_id"); exist {
		db = db.Where("route_group_id = ?", rgid)
		isSearch = false
	}
	if rgName, exist := c.GetQuery("route_group_name"); exist {
		db = db.Where("route_group_name like ?", "%"+rgName+"%")
		isSearch = false
	}
	// search
	if isSearch {
		if search, exist := c.GetQuery("search"); exist {
			s := "%" + search + "%"
			db = db.Where("name like ? or description like ? or hosts like ? or uris like ? or upstream_nodes like ? or route_group_id = ? or route_group_name like ?", s, s, s, s, s, search, s)
		}
	}
	// mysql
	routeList := []service.Route{}
	var count int
	if err := db.Order("priority, update_time desc").Table("routes").Offset((page - 1) * size).Limit(size).Find(&routeList).Error; err != nil {
		e := errno.FromMessage(errno.RouteRequestError, err.Error())
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	} else {
		responseList := make([]service.RouteResponse, 0)
		for _, r := range routeList {
			response := &service.RouteResponse{}
			response.Parse(&r)
			responseList = append(responseList, *response)
		}
		if err := db.Count(&count).Error; err != nil {
			e := errno.FromMessage(errno.RouteRequestError, err.Error())
			logger.Error(e.Msg)
			c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
			return
		}
		result := &service.ListResponse{Count: count, Data: responseList}
		resp, _ := json.Marshal(result)
		c.Data(http.StatusOK, service.ContentType, resp)
	}
}

func deleteRoute(c *gin.Context) {
	rid := c.Param("rid")
	db := conf.DB()
	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()
	// delete from mysql
	rd := &service.Route{}
	rd.ID = uuid.FromStringOrNil(rid)
	if err := conf.DB().Delete(rd).Error; err != nil {
		tx.Rollback()
		e := errno.FromMessage(errno.DBRouteDeleteError, err.Error())
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
		return
	} else {
		request := &service.ApisixRouteRequest{}
		if _, err := request.Delete(rid); err != nil {
			tx.Rollback()
			if httpError, ok := err.(*errno.HttpError); ok {
				c.AbortWithStatusJSON(httpError.Code, httpError.Msg)
				return
			} else {
				e := errno.FromMessage(errno.ApisixRouteDeleteError, err.Error())
				logger.Error(e.Msg)
				c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
				return
			}
		}
	}
	if err := tx.Commit().Error; err != nil {
		e := errno.FromMessage(errno.ApisixRouteDeleteError, err.Error())
		logger.Error(e.Msg)
	}
	c.Data(http.StatusOK, service.ContentType, errno.Success())
}
func updateRoute(c *gin.Context) {
	rid := c.Param("rid")
	param, exist := c.Get("requestBody")
	if !exist || len(param.([]byte)) < 1 {
		e := errno.FromMessage(errno.RouteRequestError, "route create with no post data")
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	}
	routeRequest := &service.RouteRequest{}
	if err := routeRequest.Parse(param); err != nil {
		e := errno.FromMessage(errno.RouteRequestError, err.Error())
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	}
	routeGroup := &service.RouteGroupDao{}
	isCreateGroup := false
	if len(strings.Trim(routeRequest.RouteGroupId, "")) == 0 {
		isCreateGroup = true
		routeGroup.ID = uuid.NewV4()
		// create route group
		routeGroup.Name = routeRequest.RouteGroupName
		routeRequest.RouteGroupId = routeGroup.ID.String()
	}
	logger.Info(routeRequest.Plugins)
	db := conf.DB()
	arr := service.ToApisixRequest(routeRequest)
	var resp *service.ApisixRouteResponse
	if rd, err := service.ToRoute(routeRequest, arr, uuid.FromStringOrNil(rid), nil); err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, err.Response())
		return
	} else {
		tx := db.Begin()
		defer func() {
			if r := recover(); r != nil {
				tx.Rollback()
			}
		}()
		logger.Info(rd)
		if isCreateGroup {
			if err := tx.Model(&service.RouteGroupDao{}).Create(routeGroup).Error; err != nil {
				tx.Rollback()
				e := errno.FromMessage(errno.DuplicateRouteGroupName, routeGroup.Name)
				logger.Error(e.Msg)
				c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
				return
			}
		}
		if err := tx.Model(&service.Route{}).Update(rd).Error; err != nil {
			// rollback
			tx.Rollback()
			e := errno.FromMessage(errno.DBRouteCreateError, err.Error())
			logger.Error(e.Msg)
			c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
			return
		} else {
			if resp, err = arr.Update(rid); err != nil {
				tx.Rollback()
				if httpError, ok := err.(*errno.HttpError); ok {
					c.AbortWithStatusJSON(httpError.Code, httpError.Msg)
					return
				} else {
					e := errno.FromMessage(errno.ApisixRouteCreateError, err.Error())
					logger.Error(e.Msg)
					c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
					return
				}
			}
		}
		if err := tx.Commit().Error; err == nil {
			// update content_admin_api
			if rd, err := service.ToRoute(routeRequest, arr, uuid.FromStringOrNil(rid), resp); err != nil {
				e := errno.FromMessage(errno.DBRouteUpdateError, err.Error())
				logger.Error(e.Msg)
			} else {
				if err := conf.DB().Model(&service.Route{}).Update(rd).Error; err != nil {
					e := errno.FromMessage(errno.DBRouteUpdateError, err.Error())
					logger.Error(e.Msg)
				}
			}
		}
	}
	c.Data(http.StatusOK, service.ContentType, errno.Success())
}

func findRoute(c *gin.Context) {
	rid := c.Param("rid")
	var count int
	if err := conf.DB().Table("routes").Where("id=?", rid).Count(&count).Error; err != nil {
		e := errno.FromMessage(errno.RouteRequestError, err.Error()+" route ID: "+rid)
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
		return
	} else {
		if count < 1 {
			e := errno.FromMessage(errno.RouteRequestError, " route ID: "+rid+" not exist")
			logger.Error(e.Msg)
			c.AbortWithStatusJSON(e.Status, e.Response())
			return
		}
	}
	// find from apisix
	request := &service.ApisixRouteRequest{}
	if response, err := request.FindById(rid); err != nil {
		e := errno.FromMessage(errno.RouteRequestError, err.Error()+" route ID: "+rid)
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	} else {
		// transfer response to dashboard struct
		if result, err := response.Parse(); err != nil {
			e := errno.FromMessage(errno.RouteRequestError, err.Error()+" route ID: "+rid)
			logger.Error(e.Msg)
			c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
			return
		} else {
			// need to find name from mysql temporary
			route := &service.Route{}
			if err := conf.DB().Table("routes").Where("id=?", rid).First(&route).Error; err != nil {
				e := errno.FromMessage(errno.RouteRequestError, err.Error()+" route ID: "+rid)
				logger.Error(e.Msg)
				c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
				return
			}
			result.Name = route.Name
			var script map[string]interface{}
			if err = json.Unmarshal([]byte(route.Script), &script); err != nil {
				script = map[string]interface{}{}
			}
			result.Script = script

			result.RouteGroupId = route.RouteGroupId
			result.RouteGroupName = route.RouteGroupName
			resp, _ := json.Marshal(result)
			c.Data(http.StatusOK, service.ContentType, resp)
		}
	}
}

func createRoute(c *gin.Context) {
	u4 := uuid.NewV4()
	rid := u4.String()
	param, exist := c.Get("requestBody")
	if !exist || len(param.([]byte)) < 1 {
		e := errno.FromMessage(errno.RouteRequestError, "route create with no post data")
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	}
	routeRequest := &service.RouteRequest{}
	if err := routeRequest.Parse(param); err != nil {
		e := errno.FromMessage(errno.RouteRequestError, err.Error())
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	}
	routeGroup := &service.RouteGroupDao{}
	isCreateGroup := false
	if len(strings.Trim(routeRequest.RouteGroupId, "")) == 0 {
		isCreateGroup = true
		routeGroup.ID = uuid.NewV4()
		// create route group
		routeGroup.Name = routeRequest.RouteGroupName
		routeRequest.RouteGroupId = routeGroup.ID.String()
	}
	logger.Info(routeRequest.Plugins)
	db := conf.DB()
	arr := service.ToApisixRequest(routeRequest)
	var resp *service.ApisixRouteResponse
	if rd, err := service.ToRoute(routeRequest, arr, u4, nil); err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, err.Response())
		return
	} else {
		tx := db.Begin()
		defer func() {
			if r := recover(); r != nil {
				tx.Rollback()
			}
		}()
		logger.Info(rd)
		if isCreateGroup {
			if err := tx.Model(&service.RouteGroupDao{}).Create(routeGroup).Error; err != nil {
				tx.Rollback()
				e := errno.FromMessage(errno.DuplicateRouteGroupName, routeGroup.Name)
				logger.Error(e.Msg)
				c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
				return
			}
		}
		if err := tx.Model(&service.Route{}).Create(rd).Error; err != nil {
			// rollback
			tx.Rollback()
			e := errno.FromMessage(errno.DBRouteCreateError, err.Error())
			logger.Error(e.Msg)
			c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
			return
		} else {
			if resp, err = arr.Create(rid); err != nil {
				tx.Rollback()
				if httpError, ok := err.(*errno.HttpError); ok {
					c.AbortWithStatusJSON(httpError.Code, httpError.Msg)
					return
				} else {
					e := errno.FromMessage(errno.ApisixRouteCreateError, err.Error())
					logger.Error(e.Msg)
					c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
					return
				}
			}
		}
		if err := tx.Commit().Error; err == nil {
			// update content_admin_api
			if rd, err := service.ToRoute(routeRequest, arr, u4, resp); err != nil {
				e := errno.FromMessage(errno.DBRouteUpdateError, err.Error())
				logger.Error(e.Msg)
			} else {
				if err := conf.DB().Model(&service.Route{}).Update(rd).Error; err != nil {
					e := errno.FromMessage(errno.DBRouteUpdateError, err.Error())
					logger.Error(e.Msg)
				}
			}
		}
	}
	c.Data(http.StatusOK, service.ContentType, errno.Success())
}
