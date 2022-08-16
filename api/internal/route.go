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
	"fmt"
	"os"

	"github.com/apache/apisix-dashboard/api/internal/handler/authentication"
	"github.com/apache/apisix-dashboard/api/internal/handler/misc"
	"github.com/apache/apisix-dashboard/api/internal/handler/resources"

	// "github.com/gin-contrib/pprof"
	"github.com/gin-contrib/gzip"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"

	"github.com/apache/apisix-dashboard/api/internal/config"
	"github.com/apache/apisix-dashboard/api/internal/filter"
	"github.com/apache/apisix-dashboard/api/internal/filter/iam"
	"github.com/apache/apisix-dashboard/api/internal/handler"
	"github.com/apache/apisix-dashboard/api/internal/log"
)

func SetUpRouter(cfg config.Config) *gin.Engine {
	if os.Getenv("ENV") == "local" || os.Getenv("ENV") == "dev" {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}
	r := gin.New()
	logger := log.GetLogger(log.AccessLog)

	// security
<<<<<<< HEAD
	r.Use(
		filter.RequestLogHandler(logger),
		filter.IPFilter(cfg.Security),
		filter.InvalidRequest(),
		filter.Authentication(cfg.Authentication),
		iam.Filter(cfg),
	)

=======
	r.Use(filter.RequestLogHandler(logger), filter.IPFilter(), filter.InvalidRequest(), filter.Authentication())
	if cfg.Conf.Security.IdentityUrl {
		r.Use(identity.CheckForPower(identity.DashBoardIdentifier.GetIdentifier()))
	}
>>>>>>> e80fcffa (chore:optimize the default strategy)
	// misc
	staticPath := "./html/"
	r.Use(gzip.Gzip(gzip.DefaultCompression), filter.CORS(cfg.Security), filter.RequestId(), filter.RecoverHandler())
	r.Use(static.Serve("/", static.LocalFile(staticPath, false)))
	r.NoRoute(func(c *gin.Context) {
		c.File(fmt.Sprintf("%s/index.html", staticPath))
	})
	
	factories := []handler.RegisterFactory{
		authentication.NewHandler,
		//data_loader.NewHandler,
		//data_loader.NewImportHandler,
		//server_info.NewHandler,
		misc.NewHandler,
		resources.NewHandler,
	}
	
	for i := range factories {
		h, err := factories[i]()
		if err != nil {
			panic(err)
		}
		h.ApplyRoute(r, cfg)
	}
	return r
}
