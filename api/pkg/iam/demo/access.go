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

package demo

import (
	"embed"
	"errors"
	"strings"

	"github.com/casbin/casbin/v2"
	casbinFSAdapter "github.com/naucon/casbin-fs-adapter"

	"github.com/apache/apisix-dashboard/api/pkg/iam"
)

var (
	//go:embed model.conf policy.csv
	fs embed.FS

	// Ensure that demo Access conforms to the iam.Access interface definition
	_ iam.Access = Access{}
)

type Access struct{}

func (Access) Check(identity, resource, action string) error {
	// Load casbin model and adapter from Go embed FS
	model, _ := casbinFSAdapter.NewModel(fs, "model.conf")
	policies := casbinFSAdapter.NewAdapter(fs, "policy.csv")
	policies.LoadPolicy(model)
	// Create enforcer
	enforce, err := casbin.NewEnforcer(model, policies)
	if err != nil {
		return err
	}
	enforce.AddFunction("identify", KeyMatchFunc)
	// get all the permission the user has
	pers, _ := enforce.GetImplicitPermissionsForUser("role_admin")
	admin, _ := enforce.HasRoleForUser(identity, "role_admin")
	if !admin {
		for _, v := range pers {
			if KeyMatch(resource, v[1]) && action == v[2] {
				return errors.New("no permission")
			}
		}
	}

	// the normal url can be requested
	return nil
}

// KeyMatchFunc wrap KeyMatch to meet with casbin's need of custom functions
func KeyMatchFunc(args ...interface{}) (interface{}, error) {
	key1, key2 := args[0].(string), args[1].(string)
	return (bool)(KeyMatch(key1, key2)), nil
}

// KeyMatch can match three patterns of route /* && /:id && /:id/*
func KeyMatch(key1 string, key2 string) bool {
	i, j := strings.Index(key2, ":"), strings.Index(key2, "*")
	if len(key1) < i+1 {
		return false
	}
	if i != -1 {
		ok := key1[:i-1] == key2[:i-1]
		if j != -1 && ok {
			k, p := strings.Index(key2[i:], "/"), strings.Index(key1[i:], "/")
			if key2[i+k+1] == '*' {
				return true
			}
			return key2[i+k:j] == key1[i+p:i+p+k+1]
		}
		return ok
	} else if j != -1 {
		ok := key1[:j-1] == key2[:j-1]
		if i != -1 && ok {
			k, p := strings.Index(key2[i:], "/"), strings.Index(key1[i:], "/")
			if key2[i+k+1] == '*' {
				return true
			}
			return key2[i+k:j] == key1[i+p:i+p+k+1]
		}
		return ok
	}
	return key1 == key2
}
