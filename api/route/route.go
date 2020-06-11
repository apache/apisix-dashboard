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
	"github.com/apisix/manager-api/conf"
	"github.com/apisix/manager-api/errno"
	"github.com/apisix/manager-api/service"
	"github.com/gin-gonic/gin"
	"github.com/satori/go.uuid"
	"net/http"
	"strconv"
)

func AppendRoute(r *gin.Engine) *gin.Engine {
	r.POST("/apisix/admin/routes", createRoute)
	r.GET("/apisix/admin/routes/:rid", findRoute)
	r.GET("/apisix/admin/routes", listRoute)
	r.PUT("/apisix/admin/routes/:rid", updateRoute)
	r.DELETE("/apisix/admin/routes/:rid", deleteRoute)
	return r
}

func listRoute(c *gin.Context) {
	db := conf.DB()
	size, _ := strconv.Atoi(c.Query("size"))
	page, _ := strconv.Atoi(c.Query("page"))
	if size == 0 {
		size = 10
	}
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
	// search
	if isSearch {
		if search, exist := c.GetQuery("search"); exist {
			db = db.Where("name like ? ", "%"+search+"%").
				Or("description like ? ", "%"+search+"%").
				Or("hosts like ? ", "%"+search+"%").
				Or("uris like ? ", "%"+search+"%").
				Or("upstream_nodes like ? ", "%"+search+"%")
		}
	}
	// todo params check
	// mysql
	routeList := []service.Route{}
	var count int
	if err := db.Order("priority, update_time desc").Table("routes").Offset((page - 1) * size).Limit(size).Find(&routeList).Count(&count).Error; err != nil {
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
		result := &service.ListResponse{Count: count, Data: responseList}
		resp, _ := json.Marshal(result)
		c.Data(http.StatusOK, service.ContentType, resp)
	}
}

func deleteRoute(c *gin.Context) {
	rid := c.Param("rid")
	// todo  params check
	// delete from apisix
	request := &service.ApisixRouteRequest{}
	if _, err := request.Delete(rid); err != nil {
		e := errno.FromMessage(errno.ApisixRouteDeleteError, err.Error())
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
		return
	} else {
		// delete from mysql
		rd := &service.Route{}
		rd.ID = uuid.FromStringOrNil(rid)
		if err := conf.DB().Delete(rd).Error; err != nil {
			e := errno.FromMessage(errno.DBRouteDeleteError, err.Error())
			logger.Error(e.Msg)
			c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
			return
		}
	}
	c.Data(http.StatusOK, service.ContentType, errno.Success())
}
func updateRoute(c *gin.Context) {
	rid := c.Param("rid")
	// todo  params check
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
	logger.Info(routeRequest.Plugins)

	arr := service.ToApisixRequest(routeRequest)
	logger.Info(arr)
	if resp, err := arr.Update(rid); err != nil {
		e := errno.FromMessage(errno.ApisixRouteUpdateError, err.Error())
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
		return
	} else {
		// update mysql
		if rd, err := service.ToRoute(routeRequest, arr, uuid.FromStringOrNil(rid), resp); err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, err.Response())
			return
		} else {
			if err := conf.DB().Model(&service.Route{}).Update(rd).Error; err != nil {
				e := errno.FromMessage(errno.DBRouteUpdateError, err.Error())
				logger.Error(e.Msg)
				c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
				return
			}
			logger.Info(rd)
		}
	}
	c.Data(http.StatusOK, service.ContentType, errno.Success())
}

func findRoute(c *gin.Context) {
	rid := c.Param("rid")
	// todo  params check
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
			resp, _ := json.Marshal(result)
			c.Data(http.StatusOK, service.ContentType, resp)
		}
	}
}

func createRoute(c *gin.Context) {
	u4 := uuid.NewV4()
	rid := u4.String()
	// todo params check
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
	logger.Info(routeRequest.Plugins)

	arr := service.ToApisixRequest(routeRequest)
	logger.Info(arr)
	if resp, err := arr.Create(rid); err != nil {
		e := errno.FromMessage(errno.ApisixRouteCreateError, err.Error())
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
		return
	} else {
		// update mysql
		if rd, err := service.ToRoute(routeRequest, arr, u4, resp); err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, err.Response())
			return
		} else {
			logger.Info(rd)
			if err := conf.DB().Create(rd).Error; err != nil {
				e := errno.FromMessage(errno.DBRouteCreateError, err.Error())
				logger.Error(e.Msg)
				c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
				return
			}
		}
	}
	c.Data(http.StatusOK, service.ContentType, errno.Success())
}
