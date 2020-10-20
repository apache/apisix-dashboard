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
package store

import (
	"errors"
	"fmt"
	"io/ioutil"

	"github.com/xeipuuv/gojsonschema"
	"go.uber.org/zap/buffer"

	"github.com/apisix/manager-api/conf"
	"github.com/apisix/manager-api/internal/core/entity"
)

type Validator interface {
	Validate(obj interface{}) error
}
type JsonSchemaValidator struct {
	schema *gojsonschema.Schema
}

func NewJsonSchemaValidator(jsonPath string) (Validator, error) {
	bs, err := ioutil.ReadFile(jsonPath)
	if err != nil {
		return nil, fmt.Errorf("get abs path failed: %w", err)
	}
	s, err := gojsonschema.NewSchema(gojsonschema.NewStringLoader(string(bs)))
	if err != nil {
		return nil, fmt.Errorf("new schema failed: %w", err)
	}
	return &JsonSchemaValidator{
		schema: s,
	}, nil
}

func (v *JsonSchemaValidator) Validate(obj interface{}) error {
	ret, err := v.schema.Validate(gojsonschema.NewGoLoader(obj))
	if err != nil {
		return fmt.Errorf("validate failed: %w", err)
	}

	if !ret.Valid() {
		errString := buffer.Buffer{}
		for i, vErr := range ret.Errors() {
			if i != 0 {
				errString.AppendString("\n")
			}
			errString.AppendString(vErr.String())
		}
		return errors.New(errString.String())
	}
	return nil
}

type APISIXJsonSchemaValidator struct {
	schema *gojsonschema.Schema
}

func NewAPISIXJsonSchemaValidator(jsonPath string) (Validator, error) {
	schemaDef := conf.Schema.Get(jsonPath).String()
	if schemaDef == "" {
		return nil, fmt.Errorf("schema not found")
	}

	s, err := gojsonschema.NewSchema(gojsonschema.NewStringLoader(schemaDef))
	if err != nil {
		return nil, fmt.Errorf("new schema failed: %w", err)
	}
	return &APISIXJsonSchemaValidator{
		schema: s,
	}, nil
}

func getPlugins(reqBody interface{}) map[string]interface{} {
	switch reqBody.(type) {
	case *entity.Route:
		route := reqBody.(*entity.Route)
		return route.Plugins
	case *entity.Service:
		service := reqBody.(*entity.Service)
		return service.Plugins
	case *entity.Consumer:
		consumer := reqBody.(*entity.Consumer)
		return consumer.Plugins
	}
	return nil
}

func (v *APISIXJsonSchemaValidator) Validate(obj interface{}) error {
	ret, err := v.schema.Validate(gojsonschema.NewGoLoader(obj))
	if err != nil {
		return fmt.Errorf("scheme validate failed: %w", err)
	}

	if !ret.Valid() {
		errString := buffer.Buffer{}
		for i, vErr := range ret.Errors() {
			if i != 0 {
				errString.AppendString("\n")
			}
			errString.AppendString(vErr.String())
		}
		return fmt.Errorf("scheme validate fail: %s", errString.String())
	}

	//check plugin json schema
	plugins := getPlugins(obj)
	if plugins != nil {
		for pluginName, pluginConf := range plugins {
			schemaDef := conf.Schema.Get("plugins." + pluginName).String()
			if schemaDef == "" {
				return fmt.Errorf("scheme validate failed: schema not found")
			}

			s, err := gojsonschema.NewSchema(gojsonschema.NewStringLoader(schemaDef))
			if err != nil {
				return fmt.Errorf("scheme validate failed: %w", err)
			}

			ret, err := s.Validate(gojsonschema.NewGoLoader(pluginConf))
			if err != nil {
				return fmt.Errorf("scheme validate failed: %w", err)
			}

			if !ret.Valid() {
				errString := buffer.Buffer{}
				for i, vErr := range ret.Errors() {
					if i != 0 {
						errString.AppendString("\n")
					}
					errString.AppendString(vErr.String())
				}
				return fmt.Errorf("scheme validate failed: %s", errString.String())
			}
		}
	}

	return nil
}
