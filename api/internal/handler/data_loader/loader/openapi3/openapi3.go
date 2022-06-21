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
package openapi3

import (
	"regexp"

	"github.com/getkin/kin-openapi/openapi3"
)

type OpenAPISpecFileType string

type Loader struct {
	// MergeMethod indicates whether to merge routes when multiple HTTP methods are on the same path
	MergeMethod bool
	// TaskName indicates the name of current import/export task
	TaskName string
}

type PathValue struct {
	Method string
	Value  *openapi3.Operation
}

var (
	regURIVar = regexp.MustCompile(`{.*?}`)
)
