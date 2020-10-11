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
package utils

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/xeipuuv/gojsonschema"

	"github.com/apisix/manager-api/conf"
)

func SchemaCheck(jsonPath string, reqBody interface{}) error {
	schemaDef := conf.Schema.Get(jsonPath).String()
	if schemaDef == "" {
		return fmt.Errorf("schema not found")
	}
	var err error

	bodyBytes, err := json.Marshal(reqBody)
	if err != nil {
		return err
	}
	body := string(bodyBytes)
	schemaLoader := gojsonschema.NewStringLoader(schemaDef)
	paramLoader := gojsonschema.NewStringLoader(body)
	schema, err := gojsonschema.NewSchema(schemaLoader)
	if err != nil {
		log.Println("body:", body, " schemaDef:", schemaDef)
		return fmt.Errorf("scheme load error: %s", err)
	}

	result, err := schema.Validate(paramLoader)
	if err != nil {
		log.Println("body:", body, " schemaDef:", schemaDef)
		return fmt.Errorf("scheme validate error: %s", err)
	}

	if !result.Valid() {
		actual := result.Errors()[0].String()
		log.Println("body:", body, " schemaDef:", schemaDef)
		return fmt.Errorf("scheme validate fail: %s", actual)
	}

	return nil
}
