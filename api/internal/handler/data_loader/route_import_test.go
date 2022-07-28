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
package data_loader

import (
	"testing"

	"github.com/shiningrush/droplet"
	"github.com/stretchr/testify/assert"
)

func TestImport_invalid_loader(t *testing.T) {
	input := &ImportInput{}
	input.Type = "test"
	input.FileName = "file1.yaml"
	input.FileContent = []byte("hello")

	h := ImportHandler{}
	ctx := droplet.NewContext()
	ctx.SetInput(input)

	_, err := h.Import(ctx)
	assert.EqualError(t, err, "unsupported data loader type: test")
}

func TestImport_openapi3_invalid_file_type(t *testing.T) {
	input := &ImportInput{}
	input.FileName = "file1.txt"
	input.FileContent = []byte("hello")

	h := ImportHandler{}
	ctx := droplet.NewContext()
	ctx.SetInput(input)

	_, err := h.Import(ctx)
	assert.EqualError(t, err, "required file type is .yaml, .yml or .json but got: .txt")
}

func TestImport_openapi3_invalid_content(t *testing.T) {
	input := &ImportInput{}
	input.Type = "openapi3"
	input.FileName = "file1.json"
	input.FileContent = []byte(`{"test": "a"}`)

	h := ImportHandler{}
	ctx := droplet.NewContext()
	ctx.SetInput(input)

	_, err := h.Import(ctx)
	assert.EqualError(t, err, "empty or invalid imported file: OpenAPI documentation does not contain any paths")
}
