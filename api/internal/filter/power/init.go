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

package power

import (
	"encoding/csv"
	"github.com/apisix/manager-api/internal/log"
	"github.com/gin-gonic/gin"
	"io"
	"os"
	"regexp"
)

// 初始化用户权限

func InitAdminRoute(r *gin.Engine) {
	var infors [][]string
	routes := r.Routes()
	csvFile, err := os.OpenFile("./policy.csv", os.O_RDWR|os.O_CREATE, 0777)
	if err != nil {
		log.Warn("fail to open file:", err)
		return
	}
	defer csvFile.Close()
	for _, route := range routes {
		regexpAdmin, _ := regexp.Compile("(admin)")
		exist := regexpAdmin.MatchString(route.Path)
		if !exist || route.Method == "GET" {
			continue
		}
		infors = append(infors, []string{"p", "role_admin", route.Path, route.Method})
	}

	writeCsv := csv.NewWriter(csvFile)

	err = writeCsv.WriteAll(infors)

	if err != nil {
		log.Warn("fail to write csv:", err)
		return
	}
}

func InitUserPower(userId string) {
	csvFile, err := os.OpenFile("./policy.csv", os.O_RDWR|os.O_CREATE, 0666)
	if err != nil {
		log.Warn("fail to open file:", err)
		return
	}
	defer csvFile.Close()
	csvFile.Seek(0, io.SeekEnd)
	writeCsv := csv.NewWriter(csvFile)

	err = writeCsv.Write([]string{"g", "user_" + userId, "role_admin"})
	if err != nil {
		log.Warn("fail to write csv:", err)
		return
	}
	writeCsv.Flush()
}
