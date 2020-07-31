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
	r.GET("/apisix/admin/names/upstreams", listUpstreamName)
	r.PUT("/apisix/admin/upstreams/:uid", updateUpstream)
	r.DELETE("/apisix/admin/upstreams/:uid", deleteUpstream)
	r.GET("/apisix/admin/notexist/upstreams", isUpstreamExist)
	return r
}

func isUpstreamExist(c *gin.Context) {
	if name, exist := c.GetQuery("name"); exist {
		db := conf.DB()
		db = db.Table("upstreams")
		exclude, exist := c.GetQuery("exclude")
		if exist {
			db = db.Where("name=? and id<>?", name, exclude)
		} else {
			db = db.Where("name=?", name)
		}
		var count int
		if err := db.Count(&count).Error; err != nil {
			e := errno.FromMessage(errno.UpstreamRequestError, err.Error())
			logger.Error(e.Msg)
			c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
			return
		} else {
			if count == 0 {
				c.Data(http.StatusOK, service.ContentType, errno.Success())
				return
			} else {
				e := errno.FromMessage(errno.DBUpstreamReduplicateError, name)
				c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
				return
			}
		}
	} else {
		e := errno.FromMessage(errno.UpstreamRequestError, "name is needed")
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	}
}

func listUpstreamName(c *gin.Context) {
	db := conf.DB()
	upstreamList := []service.UpstreamDao{}
	var count int
	if err := db.Order("name").Table("upstreams").Find(&upstreamList).Count(&count).Error; err != nil {
		e := errno.FromMessage(errno.UpstreamRequestError, err.Error())
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
		return
	} else {
		responseList := make([]*service.UpstreamNameResponse, 0)
		for _, r := range upstreamList {
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
	// mysql
	if ud, err := service.Trans2UpstreamDao(nil, ur); err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, err.Response())
		return
	} else {
		// transaction
		db := conf.DB()
		tx := db.Begin()
		defer func() {
			if r := recover(); r != nil {
				tx.Rollback()
			}
		}()
		if err := tx.Create(ud).Error; err != nil {
			tx.Rollback()
			e := errno.FromMessage(errno.DBUpstreamError, err.Error())
			logger.Error(e.Msg)
			c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
			return
		} else {
			// apisix
			if aur, err := ur.Parse2Apisix(); err != nil {
				tx.Rollback()
				e := errno.FromMessage(errno.UpstreamTransError, err.Error())
				logger.Error(e.Msg)
				c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
				return
			} else {
				if resp, err := aur.Create(); err != nil {
					tx.Rollback()
					if httpError, ok := err.(*errno.HttpError); ok {
						c.AbortWithStatusJSON(httpError.Code, httpError.Msg)
						return
					} else {
						e := errno.FromMessage(errno.ApisixUpstreamCreateError, err.Error())
						logger.Error(e.Msg)
						c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
						return
					}
				} else {
					if err := tx.Commit().Error; err == nil {
						if ud, err := service.Trans2UpstreamDao(resp, ur); err != nil {
							e := errno.FromMessage(errno.DBUpstreamError, err.Error())
							logger.Error(e.Msg)
						} else {
							if err := conf.DB().Model(&service.UpstreamDao{}).Update(ud).Error; err != nil {
								e := errno.FromMessage(errno.DBUpstreamError, err.Error())
								logger.Error(e.Msg)
							}
						}
					}
				}
			}
		}
	}
	c.Data(http.StatusOK, service.ContentType, errno.Success())
}

func findUpstream(c *gin.Context) {
	uid := c.Param("uid")
	upstream := &service.UpstreamDao{}
	var count int
	if err := conf.DB().Table("upstreams").Where("id=?", uid).Count(&count).Error; err != nil {
		e := errno.FromMessage(errno.UpstreamRequestError, err.Error()+" upstream ID: "+uid)
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	} else {
		if count < 1 {
			e := errno.FromMessage(errno.UpstreamRequestError, " upstream ID: "+uid+" not exist")
			logger.Error(e.Msg)
			c.AbortWithStatusJSON(e.Status, e.Response())
			return
		}
	}
	conf.DB().Table("upstreams").Where("id=?", uid).First(&upstream)
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
	db = db.Table("upstreams")
	if search, exist := c.GetQuery("search"); exist {
		s := "%" + search + "%"
		db = db.Where("name like ? or description like ? or nodes like ? ", s, s, s)
	}
	upstreamList := []service.UpstreamDao{}
	var count int
	if err := db.Order("update_time desc").Offset((page - 1) * size).Limit(size).Find(&upstreamList).Error; err != nil {
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
		if err := db.Count(&count).Error; err != nil {
			e := errno.FromMessage(errno.UpstreamRequestError, err.Error())
			logger.Error(e.Msg)
			c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
			return
		}
		result := &service.ListResponse{Count: count, Data: responseList}
		resp, _ := json.Marshal(result)
		c.Data(http.StatusOK, service.ContentType, resp)
	}
}
func updateUpstream(c *gin.Context) {
	uid := c.Param("uid")
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
	// mysql
	if ud, err := service.Trans2UpstreamDao(nil, ur); err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, err.Response())
		return
	} else {
		// transaction
		db := conf.DB()
		tx := db.Begin()
		defer func() {
			if r := recover(); r != nil {
				tx.Rollback()
			}
		}()
		if err := tx.Model(&service.UpstreamDao{}).Update(ud).Error; err != nil {
			tx.Rollback()
			e := errno.FromMessage(errno.DBUpstreamError, err.Error())
			logger.Error(e.Msg)
			c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
			return
		} else {
			// apisix
			if aur, err := ur.Parse2Apisix(); err != nil {
				tx.Rollback()
				e := errno.FromMessage(errno.UpstreamTransError, err.Error())
				logger.Error(e.Msg)
				c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
				return
			} else {
				if resp, err := aur.Update(); err != nil {
					tx.Rollback()
					if httpError, ok := err.(*errno.HttpError); ok {
						c.AbortWithStatusJSON(httpError.Code, httpError.Msg)
						return
					} else {
						e := errno.FromMessage(errno.ApisixUpstreamUpdateError, err.Error())
						logger.Error(e.Msg)
						c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
						return
					}
				} else {
					if err := tx.Commit().Error; err == nil {
						if ud, err := service.Trans2UpstreamDao(resp, ur); err != nil {
							e := errno.FromMessage(errno.DBUpstreamError, err.Error())
							logger.Error(e.Msg)
						} else {
							if err := conf.DB().Model(&service.UpstreamDao{}).Update(ud).Error; err != nil {
								e := errno.FromMessage(errno.DBUpstreamError, err.Error())
								logger.Error(e.Msg)
							}
						}
					}
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
	db := conf.DB()
	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()
	// delete from mysql
	rd := &service.UpstreamDao{}
	rd.ID = uuid.FromStringOrNil(uid)
	if err := tx.Delete(rd).Error; err != nil {
		tx.Rollback()
		e := errno.FromMessage(errno.DBUpstreamDeleteError, err.Error())
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
		return
	} else {
		// delete from apisix
		request := &service.ApisixUpstreamRequest{Id: uid}
		if _, err := request.Delete(); err != nil {
			tx.Rollback()
			if httpError, ok := err.(*errno.HttpError); ok {
				c.AbortWithStatusJSON(httpError.Code, httpError.Msg)
				return
			} else {
				e := errno.FromMessage(errno.ApisixUpstreamDeleteError, err.Error())
				logger.Error(e.Msg)
				c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
				return
			}
		}
	}
	if err := tx.Commit().Error; err != nil {
		e := errno.FromMessage(errno.ApisixUpstreamDeleteError, err.Error())
		logger.Error(e.Msg)
	}
	c.Data(http.StatusOK, service.ContentType, errno.Success())
}
