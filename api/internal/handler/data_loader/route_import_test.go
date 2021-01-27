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
	"bytes"
	"errors"
	"github.com/shiningrush/droplet/data"
	"io/ioutil"
	"mime/multipart"
	"net/http"
	"os/exec"
	"strings"
	"testing"

	"github.com/shiningrush/droplet"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"github.com/apisix/manager-api/internal/core/store"
)

type testFile struct {
	FieldName string
	FileName  string
	Content   []byte
}

func createRequestMultipartFiles(t *testing.T, files ...testFile) *http.Request {
	var body bytes.Buffer

	mw := multipart.NewWriter(&body)
	for _, file := range files {
		fw, err := mw.CreateFormFile(file.FieldName, file.FileName)
		assert.NoError(t, err)

		n, err := fw.Write(file.Content)
		assert.NoError(t, err)
		assert.Equal(t, len(file.Content), n)
	}
	err := mw.Close()
	assert.NoError(t, err)

	req, err := http.NewRequest("POST", "/", &body)
	assert.NoError(t, err)

	req.Header.Set("Content-Type", "multipart/form-data; boundary="+mw.Boundary())
	return req
}

func TestImport_invalid_file_type(t *testing.T) {
	input := &ImportInput{}
	input.FileName = "file1.txt"
	input.FileContent = []byte("hello")

	h := ImportHandler{}
	ctx := droplet.NewContext()
	ctx.SetInput(input)

	_, err := h.Import(ctx)
	assert.EqualError(t, err, "required file type is .yaml, .yml or .json but got: .txt")
}

func TestImport_invalid_content(t *testing.T) {
	input := &ImportInput{}
	input.FileName = "file1.json"
	input.FileContent = []byte(`{"test": "a"}`)

	h := ImportHandler{}
	ctx := droplet.NewContext()
	ctx.SetInput(input)

	_, err := h.Import(ctx)
	assert.EqualError(t, err, "empty or invalid imported file")
}

func ReadFile(t *testing.T, filePath string) []byte {
	cmd := exec.Command("pwd")
	pwdByte, err := cmd.CombinedOutput()
	pwd := string(pwdByte)
	pwd = strings.Replace(pwd, "\n", "", 1)
	dir := pwd[:strings.Index(pwd, "/api/")] + "/api/"
	bytes, err := ioutil.ReadFile(dir + filePath)
	assert.Nil(t, err)

	return bytes
}

func TestImport_with_service_id(t *testing.T) {
	bytes := ReadFile(t, "test/testdata/import/with-service-id.yaml")
	input := &ImportInput{}
	input.FileName = "file1.json"
	input.FileContent = bytes

	mStore := &store.MockInterface{}
	mStore.On("Get", mock.Anything).Run(func(args mock.Arguments) {
	}).Return(nil, errors.New("data not found by key: service1"))

	h := ImportHandler{
		routeStore:    &store.GenericStore{},
		svcStore:      mStore,
		upstreamStore: mStore,
	}
	ctx := droplet.NewContext()
	ctx.SetInput(input)

	_, err := h.Import(ctx)
	assert.EqualError(t, err, "data not found by key: service1")

	//
	mStore = &store.MockInterface{}
	mStore.On("Get", mock.Anything).Run(func(args mock.Arguments) {
	}).Return(nil, data.ErrNotFound)

	h = ImportHandler{
		routeStore:    &store.GenericStore{},
		svcStore:      mStore,
		upstreamStore: mStore,
	}
	ctx = droplet.NewContext()
	ctx.SetInput(input)

	_, err = h.Import(ctx)
	assert.EqualError(t, err, "service id: service1 not found")
}

func TestImport_with_upstream_id(t *testing.T) {
	bytes := ReadFile(t, "test/testdata/import/with-upstream-id.yaml")
	input := &ImportInput{}
	input.FileName = "file1.json"
	input.FileContent = bytes

	mStore := &store.MockInterface{}
	mStore.On("Get", mock.Anything).Run(func(args mock.Arguments) {
	}).Return(nil, errors.New("data not found by key: upstream1"))

	h := ImportHandler{
		routeStore:    &store.GenericStore{},
		svcStore:      mStore,
		upstreamStore: mStore,
	}
	ctx := droplet.NewContext()
	ctx.SetInput(input)

	_, err := h.Import(ctx)
	assert.EqualError(t, err, "data not found by key: upstream1")

	//
	mStore = &store.MockInterface{}
	mStore.On("Get", mock.Anything).Run(func(args mock.Arguments) {
	}).Return(nil, data.ErrNotFound)

	h = ImportHandler{
		routeStore:    &store.GenericStore{},
		svcStore:      mStore,
		upstreamStore: mStore,
	}
	ctx = droplet.NewContext()
	ctx.SetInput(input)

	_, err = h.Import(ctx)
	assert.EqualError(t, err, "upstream id: upstream1 not found")

}
