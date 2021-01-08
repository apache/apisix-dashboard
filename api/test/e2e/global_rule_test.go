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
	"io/ioutil"
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/tidwall/gjson"
)

func TestGlobalRule(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:         "make sure the route doesn't exist",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
		},
		{
			Desc:   "create route",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				 "uri": "/hello",
				 "upstream": {
					 "type": "roundrobin",
					"nodes": [{
						"host": "172.16.238.20",
						"port": 1981,
						"weight": 1
					}]
				 }
			 }`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:   "create global rule",
			Object: ManagerApiExpect(t),
			Path:   "/apisix/admin/global_rules/1",
			Method: http.MethodPut,
			Body: `{
                                "plugins": {
		                        "response-rewrite": {
		                            "headers": {
		                                "X-VERSION":"1.0"
		                            }
		                        },
					"uri-blocker": {
						"block_rules": ["select.+(from|limit)", "(?:(union(.*?)select))"]
					}
                                }
                        }`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:          "verify route with header",
			Object:        APISIXExpect(t),
			Method:        http.MethodGet,
			Path:          "/hello",
			ExpectStatus:  http.StatusOK,
			ExpectBody:    "hello world",
			ExpectHeaders: map[string]string{"X-VERSION": "1.0"},
			Sleep:         sleepTime,
		},
		{
			Desc:          "verify route that should be blocked",
			Object:        APISIXExpect(t),
			Method:        http.MethodGet,
			Path:          "/hello",
			Query:         "name=;select%20from%20sys",
			ExpectStatus:  http.StatusForbidden,
			ExpectHeaders: map[string]string{"X-VERSION": "1.0"},
		},
		{
			Desc:   "update route with same plugin response-rewrite",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/hello",
				"plugins": {
					"response-rewrite": {
						"headers": {
							"X-VERSION":"2.0"
						}
					}
				},
				"upstream": {
					"type": "roundrobin",
					"nodes": [{
						"host": "172.16.238.20",
						"port": 1981,
						"weight": 1
					}]
				}
			 }`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:          "verify route that header should be the same as the route config",
			Object:        APISIXExpect(t),
			Method:        http.MethodGet,
			Path:          "/hello",
			ExpectStatus:  http.StatusOK,
			ExpectBody:    "hello world",
			ExpectHeaders: map[string]string{"X-VERSION": "2.0"},
			Sleep:         sleepTime,
		},
		{
			Desc:         "the uncovered global plugin should works",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Query:        "name=;select%20from%20sys",
			ExpectStatus: http.StatusForbidden,
			//ExpectHeaders: map[string]string{"X-VERSION":"2.0"},
		},
		{
			Desc:   "route patch to enable key-auth",
			Object: ManagerApiExpect(t),
			Method: http.MethodPatch,
			Path:   "/apisix/admin/global_rules/1/plugins",
			Body: `{
	                        "response-rewrite": {
	                            "headers": {
	                                "X-VERSION":"1.0"
	                            }
	                        },
				"key-auth": {}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "make sure that patch succeeded",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusUnauthorized,
			Sleep:        sleepTime,
		},
		{
			Desc:   "route patch to disable key-auth",
			Object: ManagerApiExpect(t),
			Method: http.MethodPatch,
			Path:   "/apisix/admin/global_rules/1",
			Body: `{
				"plugins": {
					"key-auth": null
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:          "make sure that patch succeeded",
			Object:        APISIXExpect(t),
			Method:        http.MethodGet,
			Path:          "/hello",
			ExpectStatus:  http.StatusOK,
			ExpectBody:    "hello world",
			ExpectHeaders: map[string]string{"X-VERSION": "2.0"},
			Sleep:         sleepTime,
		},
		{
			Desc:   "update global rule",
			Object: ManagerApiExpect(t),
			Path:   "/apisix/admin/global_rules/1",
			Method: http.MethodPut,
			Body: `{
                                "id": "1",
                                "plugins": {
		                        "response-rewrite": {
		                            "headers": {
		                                "X-VERSION":"1.0"
		                            }
		                        },
					"uri-blocker": {
						"block_rules": ["root.exe", "root.m+"]
					}
                                }
                        }`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "make sure that update succeeded",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Query:        "file=root.exe",
			ExpectStatus: http.StatusForbidden,
			Sleep:        sleepTime,
		},
		{
			Desc:   "update global rule to disable all plugins",
			Object: ManagerApiExpect(t),
			Path:   "/apisix/admin/global_rules/1",
			Method: http.MethodPut,
			Body: `{
                                "id": "1",
                                "plugins": {}
                        }`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:          "verify route that should not be blocked",
			Object:        APISIXExpect(t),
			Method:        http.MethodGet,
			Path:          "/hello",
			Query:         "file=root.exe",
			ExpectStatus:  http.StatusOK,
			ExpectHeaders: map[string]string{"X-VERSION": "2.0"},
		},
		{
			Desc:         "delete global rule",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/global_rules/1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "make sure the global rule has been deleted",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/global_rules/1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"code":10001,"message":"data not found"`,
			Sleep:        sleepTime,
		},
		{
			Desc:          "verify route that should not be blocked",
			Object:        APISIXExpect(t),
			Method:        http.MethodGet,
			Path:          "/hello",
			Query:         "file=root.exe",
			ExpectStatus:  http.StatusOK,
			ExpectHeaders: map[string]string{"X-VERSION": "2.0"},
		},
		{
			Desc:         "delete route",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "make sure the route has been deleted",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}

func TestGlobalRule_with_createtime_updatetime(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:   "create global rule",
			Object: ManagerApiExpect(t),
			Path:   "/apisix/admin/global_rules/1",
			Method: http.MethodPut,
			Body: `{
                                "plugins": {
		                        "response-rewrite": {
		                            "headers": {
		                                "X-VERSION":"1.0"
		                            }
		                        },
					"uri-blocker": {
						"block_rules": ["select.+(from|limit)", "(?:(union(.*?)select))"]
					}
                                }
                        }`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}

	basepath := "http://127.0.0.1:9000/apisix/admin/global_rules/1"
	time.Sleep(time.Duration(100) * time.Millisecond)

	// get the global_rule, save createtime and updatetime
	request, _ := http.NewRequest("GET", basepath, nil)
	request.Header.Add("Authorization", token)
	resp, err := http.DefaultClient.Do(request)
	assert.Nil(t, err)
	defer resp.Body.Close()

	respBody, _ := ioutil.ReadAll(resp.Body)
	createtime := gjson.Get(string(respBody), "data.create_time")
	updatetime := gjson.Get(string(respBody), "data.update_time")
	assert.True(t, createtime.Int() >= time.Now().Unix()-1 && createtime.Int() <= time.Now().Unix()+1)
	assert.True(t, updatetime.Int() >= time.Now().Unix()-1 && updatetime.Int() <= time.Now().Unix()+1)

	// wait 1 second so the update_time should be different
	time.Sleep(time.Duration(1) * time.Second)

	tests = []HttpTestCase{
		{
			Desc:   "update the global rule",
			Object: ManagerApiExpect(t),
			Path:   "/apisix/admin/global_rules/1",
			Method: http.MethodPut,
			Body: `{
                                "plugins": {
		                        "response-rewrite": {
		                            "headers": {
		                                "X-VERSION":"1.1"
		                            }
		                        },
					"uri-blocker": {
						"block_rules": ["select.+(from|limit)", "(?:(union(.*?)select))"]
					}
                                }
                        }`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}

	// get the global rule
	time.Sleep(time.Duration(1) * time.Second)
	request, _ = http.NewRequest("GET", basepath, nil)
	request.Header.Add("Authorization", token)
	resp, err = http.DefaultClient.Do(request)
	assert.Nil(t, err)
	defer resp.Body.Close()

	respBody, _ = ioutil.ReadAll(resp.Body)
	createtime2 := gjson.Get(string(respBody), "data.create_time")
	updatetime2 := gjson.Get(string(respBody), "data.update_time")

	// verify the global and compare result
	assert.Equal(t, "1.1", gjson.Get(string(respBody), "data.plugins.response-rewrite.headers.X-VERSION").String())
	assert.Equal(t, createtime.String(), createtime2.String())
	assert.NotEqual(t, updatetime.String(), updatetime2.String())

	tests = []HttpTestCase{
		{
			Desc:         "delete the global rule",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/global_rules/1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}
