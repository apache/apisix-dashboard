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
	"io/fs"
	"net/http"
	"strings"

	"github.com/gin-contrib/pprof"
	"github.com/gin-gonic/gin"

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
	filesystem := fs.FS(StaticFiles)
	subtree, err := fs.Sub(filesystem, "html")

	if err != nil {
		log.Errorf("%s\n", err)
	}
	r.Use(serve("/", subtree))

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

type spaFileSystem struct {
	http.FileSystem
}

func (fs *spaFileSystem) Open(name string) (http.File, error) {
	f, err := fs.FileSystem.Open(name)
	//Default failsafe page
	if err != nil {
		return fs.FileSystem.Open("index.html")
	}
	return f, err
}

var HTMLBlackListRoutes = []string{
	"/apisix",
	"/ping",
}

func serve(urlPrefix string, fss fs.FS) gin.HandlerFunc {
	fileserver := http.FileServer(&spaFileSystem{http.FS(fss)})
	if urlPrefix != "" {
		fileserver = http.StripPrefix(urlPrefix, fileserver)
	}
	return func(c *gin.Context) {

		if c.Request.Method == "GET" &&
			(exists(urlPrefix, c.Request.URL.Path, &fss) || !isBlacklisted(c.Request.URL.Path)) {
			fileserver.ServeHTTP(c.Writer, c.Request)
			c.Abort()
		}
	}
}

func isBlacklisted(path string) bool {
	for _, checkpath := range HTMLBlackListRoutes {
		if strings.HasPrefix(path, checkpath) {
			return true
		}
	}
	return false
}

func exists(prefix string, filepath string, f *fs.FS) bool {
	if p := strings.TrimPrefix(filepath, prefix); len(p) < len(filepath) {
		_, err := fs.Stat(*f, p)
		if err != nil {
			return false
		}
	}
	return true
}
