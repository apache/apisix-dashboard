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
package route

import (
	"net/http"
	"testing"

	"github.com/apisix/manager-api/service"
)

func TestClearTestData(t *testing.T) {
	// delete consumers
	c1, _ := service.GetConsumerByUserName("e2e_test_consumer1")
	handler.
		Delete(uriPrefix + "/consumers/" + c1.ID.String()).
		Expect(t).
		Status(http.StatusOK).
		End()

	//delete test ssl
	service.DeleteTestSslData()
}
