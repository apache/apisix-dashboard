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
package proto

import (
	"encoding/json"
	"net/http"

	"github.com/onsi/ginkgo"
	"github.com/onsi/gomega"

	"github.com/apisix/manager-api/test/e2enew/base"
)

var _ = ginkgo.Describe("Proto", func() {
	ginkgo.It("create proto success", func() {
		createProtoBody := make(map[string]interface{})
		createProtoBody["desc"] = "test_proto1"
		createProtoBody["content"] = `syntax = "proto3";
    package helloworld;
    service Greeter {
        rpc SayHello (HelloRequest) returns (HelloReply) {}
    }
    message HelloRequest {
        string name = 1;
    }
    message HelloReply {
        string message = 1;
    }`

		_createProtoBody, err := json.Marshal(createProtoBody)
		gomega.Expect(err).To(gomega.BeNil())

		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPost,
			Path:         "/apisix/admin/proto",
			Body:         string(_createProtoBody),
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})
})