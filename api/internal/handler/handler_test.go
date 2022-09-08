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
package handler

import (
	"errors"
	"net/http"
	"testing"

	"github.com/shiningrush/droplet/data"
	"github.com/stretchr/testify/assert"
)

func TestSpecCodeResponse(t *testing.T) {
	err := errors.New("schema validate failed: remote_addr: Must validate at least one schema (anyOf)")
	resp := SpecCodeResponse(err)
	assert.Equal(t, &data.SpecCodeResponse{StatusCode: http.StatusBadRequest}, resp)

	err = errors.New("data not found")
	resp = SpecCodeResponse(err)
	assert.Equal(t, &data.SpecCodeResponse{StatusCode: http.StatusNotFound}, resp)

	err = errors.New("system error")
	resp = SpecCodeResponse(err)
	assert.Equal(t, &data.SpecCodeResponse{StatusCode: http.StatusInternalServerError}, resp)
}

func TestIDCompare(t *testing.T) {
	// init
	cases := []struct {
		idOnPath, desc string
		idOnBody       interface{}
		wantError      error
	}{
		{
			desc:     "ID on body is int, and it could be considered the same as ID on path",
			idOnPath: "1",
			idOnBody: 1,
		},
		{
			desc:      "ID on body is int, and it is different from ID on path",
			idOnPath:  "1",
			idOnBody:  2,
			wantError: errors.New("ID on path (1) doesn't match ID on body (2)"),
		},
		{
			desc:     "ID on body is same as ID on path",
			idOnPath: "1",
			idOnBody: "1",
		},
		{
			desc:      "ID on body is different from ID on path",
			idOnPath:  "a",
			idOnBody:  "b",
			wantError: errors.New("ID on path (a) doesn't match ID on body (b)"),
		},
		{
			desc:     "No ID on body",
			idOnPath: "1",
		},
		{
			desc:     "No ID on path",
			idOnBody: 1,
		},
	}
	for _, c := range cases {
		t.Run(c.desc, func(t *testing.T) {
			err := IDCompare(c.idOnPath, c.idOnBody)
			assert.Equal(t, c.wantError, err)
		})
	}
}
