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
package internal

import (
	"embed"
	"fmt"
	"github.com/gin-contrib/pprof"
	"github.com/gin-gonic/gin"
	"io/fs"
	"net/http"
	"strings"

	"github.com/apisix/manager-api/internal/conf"
	"github.com/apisix/manager-api/internal/filter"
	"github.com/apisix/manager-api/internal/handler"
	"github.com/apisix/manager-api/internal/handler/authentication"
	"github.com/apisix/manager-api/internal/handler/consumer"
	"github.com/apisix/manager-api/internal/handler/data_loader"
	"github.com/apisix/manager-api/internal/handler/global_rule"
	"github.com/apisix/manager-api/internal/handler/healthz"
	"github.com/apisix/manager-api/internal/handler/label"
	"github.com/apisix/manager-api/internal/handler/plugin_config"
	"github.com/apisix/manager-api/internal/handler/route"
	"github.com/apisix/manager-api/internal/handler/route_online_debug"
	"github.com/apisix/manager-api/internal/handler/schema"
	"github.com/apisix/manager-api/internal/handler/server_info"
	"github.com/apisix/manager-api/internal/handler/service"
	"github.com/apisix/manager-api/internal/handler/ssl"
	"github.com/apisix/manager-api/internal/handler/tool"
	"github.com/apisix/manager-api/internal/handler/upstream"
	"github.com/apisix/manager-api/internal/log"
)

func SetUpRouter(StaticFiles embed.FS) *gin.Engine {
	if conf.ENV == conf.EnvLOCAL || conf.ENV == conf.EnvDEV {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}
	r := gin.New()
	logger := log.GetLogger(log.AccessLog)
	r.Use(filter.CORS(), filter.RequestId(), filter.IPFilter(), filter.RequestLogHandler(logger), filter.SchemaCheck(), filter.RecoverHandler())
	//r.Use(static.Serve("/", static.LocalFile(filepath.Join(conf.WorkDir, conf.WebDir), false)))
	//r.NoRoute(func(c *gin.Context) {
	//	c.File(fmt.Sprintf("%s/index.html", filepath.Join(conf.WorkDir, conf.WebDir)))
	//})
	filesystem := fs.FS(StaticFiles)
	subtree, err := fs.Sub(filesystem, "html")
	////ss , err := fs.Glob(filesystem,"html")
	////fmt.Println(ss)
	if err != nil {
		panic(err)
	}
	r.Use(serve("/", subtree))
	//r.Use(static.Serve("/", static.LocalFile("./html", false)))
	r.NoRoute(func(c *gin.Context) {
		c.FileFromFS("index.html", http.FS(subtree))
		//c.File(fmt.Sprintf("%s/index.html", "./html"))
	})

	factories := []handler.RegisterFactory{
		route.NewHandler,
		ssl.NewHandler,
		consumer.NewHandler,
		upstream.NewHandler,
		service.NewHandler,
		schema.NewHandler,
		schema.NewSchemaHandler,
		healthz.NewHandler,
		authentication.NewHandler,
		global_rule.NewHandler,
		route_online_debug.NewHandler,
		server_info.NewHandler,
		label.NewHandler,
		data_loader.NewHandler,
		data_loader.NewImportHandler,
		tool.NewHandler,
		plugin_config.NewHandler,
	}

	for i := range factories {
		h, err := factories[i]()
		if err != nil {
			panic(err)
		}
		h.ApplyRoute(r)
	}

	pprof.Register(r)

	return r
}

func serve(urlPrefix string, fss fs.FS) gin.HandlerFunc {
	fileserver := http.FileServer(http.FS(fss))
	if urlPrefix != "" {
		fileserver = http.StripPrefix(urlPrefix, fileserver)
	}

	return func(c *gin.Context) {
		if c.Request.URL.Path=="/" || exists(urlPrefix, c.Request.URL.Path, &fss) {
		fileserver.ServeHTTP(c.Writer, c.Request)
		c.Abort()
		}else if strings.HasPrefix(c.Request.URL.Path, "/user"){
			fmt.Println("here")
			c.Request.URL.Path = "/"
			fmt.Println(c.Request.Referer())
			fileserver.ServeHTTP(c.Writer, c.Request)
			c.Abort()
		}
	}
}

func exists(prefix string, filepath string, f *fs.FS) bool {
	if strings.HasPrefix(filepath, "/apisix"){
		return false
	}
	if p := strings.TrimPrefix(filepath, prefix); len(p) < len(filepath) {
		fmt.Println("check: ", p)
		_, err :=fs.Stat(*f, p)
		if err != nil {
			return false
		}
	}
	return true
}