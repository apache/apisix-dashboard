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

package iam

import (
	"net/http"
	
	"github.com/gin-gonic/gin"
	
	"github.com/apache/apisix-dashboard/api/internal/config"
	iamDef "github.com/apache/apisix-dashboard/api/pkg/iam"
	"github.com/apache/apisix-dashboard/api/pkg/iam/demo"
)

var (
	access     iamDef.Access
	accessLock bool
)

func Filter(cfg config.Config) gin.HandlerFunc {
	// When feature gate demoIAMAccess is configured to be on,
	// set the access implementation to Demo
	if cfg.FeatureGate.DemoIAMAccess {
		access = demo.Access{}
		accessLock = true
	}
	
	return func(c *gin.Context) {
		if access != nil && c.Request.URL.Path != "/apisix/admin/user/login" {
			identity := c.MustGet("identity").(string)
			err := access.Check(identity, c.Request.URL.Path, c.Request.Method)
			if err != nil {
				c.AbortWithStatus(http.StatusForbidden)
				return
			}
		}
		
		c.Next()
	}
}

// SetAccessImplementation provides a function that allows developers to replace the built-in access control implementation
// This function is allowed to be called only once and returns true on success.
// After setting, the access implementation will be locked and another attempt to set it will return false.
func SetAccessImplementation(impl iamDef.Access) bool {
	if accessLock {
		return false
	}
	access = impl
	accessLock = true
	return true
}
