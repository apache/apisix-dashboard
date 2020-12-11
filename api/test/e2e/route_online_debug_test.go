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
package e2e

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/tidwall/gjson"
)

func TestRoute_Online_Debug_Route_Not_Exist(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc:     "hit route that not exist",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello_",
			Headers:      map[string]string{"Host": "foo.com"},
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
		},
	}
	for _, tc := range tests {
		testCaseCheck(tc)
	}
	basepath := "http://127.0.0.1:9000/apisix/admin/debug-request-forwarding"
	request, _ := http.NewRequest("POST", basepath, strings.NewReader(`{"url": "http://172.16.238.30:9080/hello_","method": "GET"}`))
	request.Header.Add("Authorization", token)
	resp, err := http.DefaultClient.Do(request)
	if err != nil {
		return
	}
	defer resp.Body.Close()
	respBody, _ := ioutil.ReadAll(resp.Body)
	fmt.Println(string(respBody))
	realBody := gjson.Get(string(respBody), "data")
	assert.Equal(t, `{"code":404,"message":"404 Not Found","data":{"error_msg":"404 Route Not Found"}}`, realBody.String())
}

func TestRoute_Online_Debug_Route_With_Query_Params(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc:     "hit route that not exist",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello_",
			Headers:      map[string]string{"Host": "foo.com"},
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
		},
		{
			caseDesc: "create route with query params",
			Object:   ManagerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/hello",
				"methods": ["GET"],
				"vars": [
					["arg_name","==","aaa"]
				],
				"upstream": {
					"type": "roundrobin",
					"nodes": [{
						"host": "172.16.238.20",
						"port": 1980,
						"weight": 1
					}]
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
		{
			caseDesc: "online debug route with query params",
			Object:   ManagerApiExpect(t),
			Method:   http.MethodPost,
			Path:     "/apisix/admin/debug-request-forwarding",
			Body: `{
				"url": "http://172.16.238.30:9080/hello?name=aaa",
				"method": "GET"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}
}

func TestRoute_Online_Debug_Route_With_Header_Params(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc:     "make sure the route is not created ",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
			Sleep:        sleepTime,
		},
		{
			caseDesc: "create route with header params",
			Object:   ManagerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/hello",
				"methods": ["GET"],
				"vars": [
					["http_version","==","v2"]
				],
				"upstream": {
					"type": "roundrobin",
					"nodes": [{
						"host": "172.16.238.20",
						"port": 1980,
						"weight": 1
					}]
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
		{
			caseDesc: "online debug route with header params",
			Object:   ManagerApiExpect(t),
			Method:   http.MethodPost,
			Path:     "/apisix/admin/debug-request-forwarding",
			Body: `{
				"url": "http://127.0.0.1:9080/hello",
				"method": "GET",
				"headerParams": {
					"version": ["v2"]
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}
}

func TestRoute_Online_Debug_Route_With_Body_Params(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc:     "make sure the route is not created ",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
			Sleep:        sleepTime,
		},
		{
			caseDesc: "create route with method POST",
			Object:   ManagerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/hello",
				"methods": ["POST"],
				"upstream": {
					"type": "roundrobin",
					"nodes": [{
						"host": "172.16.238.20",
						"port": 1980,
						"weight": 1
					}]
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
		{
			caseDesc: "online debug route with body params",
			Object:   ManagerApiExpect(t),
			Method:   http.MethodPost,
			Path:     "/apisix/admin/debug-request-forwarding",
			Body: `{
				"url": "http://127.0.0.1:9080/hello",
				"method": "GET",
				"bodyParams": {
					"name": "test",
					"desc": "online debug route with body params"
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}
}

func TestRoute_Online_Debug_Route_With_Basic_Auth(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc:     "make sure the route is not created ",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
			Sleep:        sleepTime,
		},
		{
			caseDesc: "create route enable basic-auth plugin",
			Object:   ManagerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/hello",
				"methods": ["GET"],
				"plugins": {
					"basic-auth": {}
				},
				"upstream": {
					"type": "roundrobin",
					"nodes": [{
						"host": "172.16.238.20",
						"port": 1980,
						"weight": 1
					}]
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
		{
			caseDesc:     "make sure the consumer is not created",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusNotFound,
		},
		{
			caseDesc: "create consumer",
			Object:   ManagerApiExpect(t),
			Path:     "/apisix/admin/consumers",
			Method:   http.MethodPut,
			Body: `{
				"username": "jack",
				"plugins": {
					"basic-auth": {
						"username": "jack",
						"password": "123456",
					}
				},
				"desc": "test description"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
		{
			caseDesc: "online debug route with username and password",
			Object:   ManagerApiExpect(t),
			Method:   http.MethodPost,
			Path:     "/apisix/admin/debug-request-forwarding",
			Body: `{
				"url": "http://127.0.0.1:9080/hello",
				"method": "GET",
				"headerParams": {
					"Authorization": ["Basic amFjazoxMjM0NTYKIA=="],
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}

	// online debug without auth
	basepath := "http://127.0.0.1:9000/apisix/admin/debug-request-forwarding"
	request, _ := http.NewRequest("POST", basepath, strings.NewReader(`{"url": "http://127.0.0.1:9080/hello","method": "GET"}`))
	request.Header.Add("Authorization", token)
	resp, err := http.DefaultClient.Do(request)
	if err != nil {
		return
	}
	defer resp.Body.Close()
	respBody, _ := ioutil.ReadAll(resp.Body)
	realBody := gjson.Get(string(respBody), "data")
	assert.Equal(t, `{"code":401,"message":"404 Not Found","data":{"message":"Missing authorization in request"}}`, realBody.String())
}

/*func TestRoute_Online_Debug_Route_With_Jwt_Auth(t *testing.T) {
    tests := []HttpTestCase{
        {
            caseDesc:     "make sure the route is not created ",
            Object:       APISIXExpect(t),
            Method:       http.MethodGet,
            Path:         "/hello",
            ExpectStatus: http.StatusNotFound,
            ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
        },
        {
            caseDesc: "create route enable basic-auth plugin",
            Object:   ManagerApiExpect(t),
            Method:   http.MethodPut,
            Path:     "/apisix/admin/routes/r1",
            Body: `{
                    "uri": "/hello",
                    "methods": ["GET"],
                    "plugins": {
                        "jwt-auth": {}
                    },
                    "upstream": {
                        "type": "roundrobin",
                        "nodes": [{
                            "host": "172.16.238.20",
                            "port": 1980,
                            "weight": 1
                        }]
                    }
                }`,
            Headers:      map[string]string{"Authorization": token},
            ExpectStatus: http.StatusOK,
        },
        {
            caseDesc:     "make sure the consumer is not created",
            Object:       ManagerApiExpect(t),
            Method:       http.MethodGet,
            Path:         "/apisix/admin/consumers/jack",
            Headers:      map[string]string{"Authorization": token},
            ExpectStatus: http.StatusNotFound,
        },
        {
            caseDesc: "create consumer",
            Object:   ManagerApiExpect(t),
            Path:     "/apisix/admin/consumers",
            Method:   http.MethodPut,
            Body: `{
                "username": "jack",
                "plugins": {
                    "jwt-auth": {
                        "key": "user-key",
                        "secret": "my-secret-key",
                        "algorithm": "HS256"
                    }
                },
                "desc": "test description"
            }`,
            Headers:      map[string]string{"Authorization": token},
            ExpectStatus: http.StatusOK,
        },
    }

    // sign jwt token
    body, status, err := httpGet("http://127.0.0.1:9080/apisix/plugin/jwt/sign?key=user-key")
    assert.Nil(t, err)
    assert.Equal(t, http.StatusOK, status)
    jwtToken := string(body)

    for _, tc := range tests {
        testCaseCheck(tc)
    }

    time.Sleep(sleepTime)

    // verify token and clean test data
    tests = []HttpTestCase{
        {
            caseDesc: "online debug route with jwt token",
            Object:   ManagerApiExpect(t),
            Method:   http.MethodPost,
            Path:     "/apisix/admin/debug-request-forwarding",
            Body: `{
                "uri": "http://127.0.0.1:9080/hello",
                "method": "GET",
                "headerParams": {
                    "Authorization":`+ jwtToken +`,
                }
            }`,
            Headers:      map[string]string{"Authorization": token},
            ExpectStatus: http.StatusOK,
        },
        {
            caseDesc:     "verify route without jwt token",
            Object:       APISIXExpect(t),
            Method:       http.MethodGet,
            Path:         "/hello",
            ExpectStatus: http.StatusOK,
            ExpectBody:   `{"message":"Missing JWT token in request"}`,
            Sleep:        sleepTime,
        },
    }

    for _, tc := range tests {
        testCaseCheck(tc)
    }
}

func TestRoute_Online_Debug_Route_With_Key_Auth(t *testing.T) {
    tests := []HttpTestCase{
        {
            caseDesc:     "make sure the route is not created ",
            Object:       APISIXExpect(t),
            Method:       http.MethodGet,
            Path:         "/hello",
            ExpectStatus: http.StatusNotFound,
            ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
        },
        {
            caseDesc: "create route enable key-auth plugin",
            Object:   ManagerApiExpect(t),
            Method:   http.MethodPut,
            Path:     "/apisix/admin/routes/r1",
            Body: `{
                    "uri": "/hello",
                    "methods": ["GET"],
                    "plugins": {
                        "key-auth": {}
                    },
                    "upstream": {
                        "type": "roundrobin",
                        "nodes": [{
                            "host": "172.16.238.20",
                            "port": 1980,
                            "weight": 1
                        }]
                    }
                }`,
            Headers:      map[string]string{"Authorization": token},
            ExpectStatus: http.StatusOK,
        },
        {
            caseDesc:     "make sure the consumer is not created",
            Object:       ManagerApiExpect(t),
            Method:       http.MethodGet,
            Path:         "/apisix/admin/consumers/jack",
            Headers:      map[string]string{"Authorization": token},
            ExpectStatus: http.StatusNotFound,
        },
        {
            caseDesc: "create consumer",
            Object:   ManagerApiExpect(t),
            Path:     "/apisix/admin/consumers",
            Method:   http.MethodPut,
            Body: `{
                "username": "jack",
                "plugins": {
                    "key-auth": {
                        "key": "user-key"
                    }
                },
                "desc": "test description"
            }`,
            Headers:      map[string]string{"Authorization": token},
            ExpectStatus: http.StatusOK,
        },
        {
            caseDesc: "online debug route with apikey",
            Object:   ManagerApiExpect(t),
            Method:   http.MethodPost,
            Path:     "/apisix/admin/debug-request-forwarding",
            Body: `{
                "uri": "http://127.0.0.1:9080/hello",
                "method": "GET",
                "headerParams": {
                    "apikey": "user-key",
                }
            }`,
            Headers:      map[string]string{"Authorization": token},
            ExpectStatus: http.StatusOK,
        },
        {
            caseDesc: "online debug route without apikey",
            Object:   ManagerApiExpect(t),
            Method:   http.MethodPost,
            Path:     "/apisix/admin/debug-request-forwarding",
            Body: `{
                "uri": "http://127.0.0.1:9080/hello",
                "method": "GET"
            }`,
            Headers:      map[string]string{"Authorization": token},
            ExpectStatus: http.StatusOK,
            ExpectBody:   `{"message":"Missing JWT token in request"}`,
        },
    }

    for _, tc := range tests {
        testCaseCheck(tc)
    }
}

func TestRoute_Online_Debug_Route_With_Query_Params_Key_Auth(t *testing.T) {
    tests := []HttpTestCase{
        {
            caseDesc:     "make sure the route is not created ",
            Object:       APISIXExpect(t),
            Method:       http.MethodGet,
            Path:         "/hello",
            ExpectStatus: http.StatusNotFound,
            ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
        },
        {
            caseDesc: "create route enable key-auth plugin",
            Object:   ManagerApiExpect(t),
            Method:   http.MethodPut,
            Path:     "/apisix/admin/routes/r1",
            Body: `{
                    "uri": "/hello",
                    "methods": ["GET"],
                    "vars": [
                        ["arg_name","==","aaa"]
                    ],
                    "plugins": {
                        "key-auth": {}
                    },
                    "upstream": {
                        "type": "roundrobin",
                        "nodes": [{
                            "host": "172.16.238.20",
                            "port": 1980,
                            "weight": 1
                        }]
                    }
                }`,
            Headers:      map[string]string{"Authorization": token},
            ExpectStatus: http.StatusOK,
        },
        {
            caseDesc:     "make sure the consumer is not created",
            Object:       ManagerApiExpect(t),
            Method:       http.MethodGet,
            Path:         "/apisix/admin/consumers/jack",
            Headers:      map[string]string{"Authorization": token},
            ExpectStatus: http.StatusNotFound,
        },
        {
            caseDesc: "create consumer",
            Object:   ManagerApiExpect(t),
            Path:     "/apisix/admin/consumers",
            Method:   http.MethodPut,
            Body: `{
                "username": "jack",
                "plugins": {
                    "key-auth": {
                        "key": "user-key"
                    }
                },
                "desc": "test description"
            }`,
            Headers:      map[string]string{"Authorization": token},
            ExpectStatus: http.StatusOK,
        },
        {
            caseDesc: "online debug route with apikey",
            Object:   ManagerApiExpect(t),
            Method:   http.MethodPost,
            Path:     "/apisix/admin/debug-request-forwarding",
            Body: `{
                "uri": "http://127.0.0.1:9080/hello?name=aaa",
                "method": "GET",
                "headerParams": {
                    "apikey": "user-key",
                }
            }`,
            Headers:      map[string]string{"Authorization": token},
            ExpectStatus: http.StatusOK,
        },
        {
            caseDesc: "online debug route without apikey",
            Object:   ManagerApiExpect(t),
            Method:   http.MethodPost,
            Path:     "/apisix/admin/debug-request-forwarding",
            Body: `{
                "uri": "http://127.0.0.1:9080/hello?name=aaa",
                "method": "GET"
            }`,
            Headers:      map[string]string{"Authorization": token},
            ExpectStatus: http.StatusOK,
            ExpectBody:   `{"message":"Missing JWT token in request"}`,
        },
    }

    for _, tc := range tests {
        testCaseCheck(tc)
    }
} */
