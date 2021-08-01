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
package tool

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shiningrush/droplet"
	"github.com/shiningrush/droplet/data"
	wgin "github.com/shiningrush/droplet/wrapper/gin"

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/apisix/manager-api/internal/handler"
	"github.com/apisix/manager-api/internal/utils"
)

type Handler struct {
	serverInfoStore store.Interface
}

type InfoOutput struct {
	Hash    string `json:"commit_hash"`
	Version string `json:"version"`
}

type nodes struct {
	Hostname string `json:"hostname"`
	Version  string `json:"version"`
}

type VersionMatchOutput struct {
	Matched          bool    `json:"matched"`
	DashboardVersion string  `json:"dashboard_version"`
	MismatchedNodes  []nodes `json:"mismatched_nodes"`
}

func NewHandler() (handler.RouteRegister, error) {
	return &Handler{
		serverInfoStore: store.GetStore(store.HubKeyServerInfo),
	}, nil
}

func (h *Handler) ApplyRoute(r *gin.Engine) {
	r.GET("/apisix/admin/tool/version", wgin.Wraps(h.Version))
	r.GET("/apisix/admin/tool/version_match", wgin.Wraps(h.VersionMatch))
}

func (h *Handler) Version(_ droplet.Context) (interface{}, error) {
	hash, version := utils.GetHashAndVersion()
	return &InfoOutput{
		Hash:    hash,
		Version: version,
	}, nil
}

func (h *Handler) VersionMatch(c droplet.Context) (interface{}, error) {
	_, version := utils.GetHashAndVersion()
	var output VersionMatchOutput
	output.DashboardVersion = version

	matchedVersion := utils.GetMatchedVersion(version)

	var mismatchedNodes = make([]nodes, 0)
	_, err := h.serverInfoStore.List(c.Context(), store.ListInput{
		Predicate: func(obj interface{}) bool {
			serverInfo := obj.(*entity.ServerInfo)

			if serverInfo.Version != matchedVersion {
				mismatchedNodes = append(mismatchedNodes, nodes{
					Hostname: serverInfo.Hostname,
					Version:  serverInfo.Version,
				})
			}
			return false
		},
	})

	if err != nil {
		return nil, err
	}

	output.MismatchedNodes = mismatchedNodes
	if len(output.MismatchedNodes) == 0 {
		output.Matched = true
	} else {
		// TODO: move this to utils
		return &data.SpecCodeResponse{StatusCode: http.StatusOK, Response: data.Response{
			Data: &output,
			Code: 2000001,
			Message: fmt.Sprintf("The Manager API and Apache APISIX are mismatched. "+
				"The version of Manager API is %s, and should be used with Apache APISIX %s.",
				version, matchedVersion),
		}}, nil
	}

	return &output, nil
}
