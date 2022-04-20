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
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/tidwall/gjson"
)

func TestImport_default(t *testing.T) {
	path, err := filepath.Abs("../testdata/import/default.yaml")
	assert.Nil(t, err)

	headers := map[string]string{
		"Authorization": token,
	}
	files := []UploadFile{
		{Name: "file", Filepath: path},
	}
	PostFile(ManagerAPIHost+"/apisix/admin/import/routes", nil, files, headers)

	// sleep for data sync
	time.Sleep(sleepTime)

	request, _ := http.NewRequest("GET", ManagerAPIHost+"/apisix/admin/routes", nil)
	request.Header.Add("Authorization", token)
	resp, err := http.DefaultClient.Do(request)
	assert.Nil(t, err)
	defer resp.Body.Close()
	respBody, _ := ioutil.ReadAll(resp.Body)
	list := gjson.Get(string(respBody), "data.rows").Value().([]interface{})

	var tests []HttpTestCase
	for _, item := range list {
		route := item.(map[string]interface{})
		tc := HttpTestCase{
			Desc:         "route patch for update status(online)",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodPatch,
			Path:         "/apisix/admin/routes/" + route["id"].(string),
			Body:         `{"status":1}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		}
		tests = append(tests, tc)
	}

	// verify route
	tests = append(tests, HttpTestCase{
		Desc:         "verify the route just imported",
		Object:       APISIXExpect(t),
		Method:       http.MethodGet,
		Path:         "/hello",
		ExpectStatus: http.StatusOK,
		ExpectBody:   "hello world",
		Sleep:        sleepTime,
	})

	// delete test data
	for _, item := range list {
		route := item.(map[string]interface{})
		tc := HttpTestCase{
			Desc:         "delete route",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/" + route["id"].(string),
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		}
		tests = append(tests, tc)
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}

func TestImport_json(t *testing.T) {
	path, err := filepath.Abs("../testdata/import/default.json")
	assert.Nil(t, err)

	headers := map[string]string{
		"Authorization": token,
	}
	files := []UploadFile{
		{Name: "file", Filepath: path},
	}
	PostFile(ManagerAPIHost+"/apisix/admin/import/routes", nil, files, headers)

	// sleep for data sync
	time.Sleep(sleepTime)

	request, _ := http.NewRequest("GET", ManagerAPIHost+"/apisix/admin/routes", nil)
	request.Header.Add("Authorization", token)
	resp, err := http.DefaultClient.Do(request)
	assert.Nil(t, err)
	defer resp.Body.Close()
	respBody, _ := ioutil.ReadAll(resp.Body)
	list := gjson.Get(string(respBody), "data.rows").Value().([]interface{})

	var tests []HttpTestCase
	for _, item := range list {
		route := item.(map[string]interface{})
		tc := HttpTestCase{
			Desc:         "route patch for update status(online)",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodPatch,
			Path:         "/apisix/admin/routes/" + route["id"].(string),
			Body:         `{"status":1}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		}
		tests = append(tests, tc)
	}

	// verify route
	tests = append(tests, HttpTestCase{
		Desc:         "verify the route just imported",
		Object:       APISIXExpect(t),
		Method:       http.MethodGet,
		Path:         "/hello",
		ExpectStatus: http.StatusOK,
		ExpectBody:   "hello world",
		Sleep:        sleepTime,
	})

	// delete test data
	for _, item := range list {
		route := item.(map[string]interface{})
		tc := HttpTestCase{
			Desc:         "delete route",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/" + route["id"].(string),
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		}
		tests = append(tests, tc)
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}

func TestImport_with_plugins(t *testing.T) {
	path, err := filepath.Abs("../testdata/import/with-plugins.yaml")
	assert.Nil(t, err)

	headers := map[string]string{
		"Authorization": token,
	}
	files := []UploadFile{
		{Name: "file", Filepath: path},
	}
	PostFile(ManagerAPIHost+"/apisix/admin/import/routes", nil, files, headers)

	// sleep for data sync
	time.Sleep(sleepTime)

	request, _ := http.NewRequest("GET", ManagerAPIHost+"/apisix/admin/routes", nil)
	request.Header.Add("Authorization", token)
	resp, err := http.DefaultClient.Do(request)
	assert.Nil(t, err)
	defer resp.Body.Close()
	respBody, _ := ioutil.ReadAll(resp.Body)
	list := gjson.Get(string(respBody), "data.rows").Value().([]interface{})

	var tests []HttpTestCase
	for _, item := range list {
		route := item.(map[string]interface{})
		tc := HttpTestCase{
			Desc:         "route patch for update status(online)",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodPatch,
			Path:         "/apisix/admin/routes/" + route["id"].(string),
			Body:         `{"status":1}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		}
		tests = append(tests, tc)
	}

	// verify route
	verifyTests := []HttpTestCase{
		{
			Desc:         "verify the route just imported",
			Object:       APISIXExpect(t),
			Method:       http.MethodPost,
			Path:         "/hello",
			Body:         `{}`,
			ExpectStatus: http.StatusBadRequest,
			ExpectBody:   `property "id" is required`,
			Sleep:        sleepTime,
		},
		{
			Desc:         "verify the route just imported",
			Object:       APISIXExpect(t),
			Method:       http.MethodPost,
			Path:         "/hello",
			Headers:      map[string]string{"id": "1"},
			Body:         `{}`,
			ExpectStatus: http.StatusBadRequest,
			ExpectBody:   `property "status" is required`,
			Sleep:        sleepTime,
		},
		{
			Desc:         "verify the route just imported",
			Object:       APISIXExpect(t),
			Method:       http.MethodPost,
			Path:         "/hello",
			Headers:      map[string]string{"id": "1"},
			Body:         `{"status": "1"}`,
			ExpectStatus: http.StatusUnauthorized,
			ExpectBody:   `{"message":"Missing authorization in request"}`,
			Sleep:        sleepTime,
		},
	}
	tests = append(tests, verifyTests...)

	// delete test data
	for _, item := range list {
		route := item.(map[string]interface{})
		tc := HttpTestCase{
			Desc:         "delete route",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/" + route["id"].(string),
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		}
		tests = append(tests, tc)
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}

func TestImport_with_multi_routes(t *testing.T) {
	path, err := filepath.Abs("../testdata/import/multi-routes.yaml")
	assert.Nil(t, err)

	headers := map[string]string{
		"Authorization": token,
	}
	files := []UploadFile{
		{Name: "file", Filepath: path},
	}
	PostFile(ManagerAPIHost+"/apisix/admin/import/routes", nil, files, headers)

	// sleep for data sync
	time.Sleep(sleepTime)

	request, _ := http.NewRequest("GET", ManagerAPIHost+"/apisix/admin/routes", nil)
	request.Header.Add("Authorization", token)
	resp, err := http.DefaultClient.Do(request)
	assert.Nil(t, err)
	defer resp.Body.Close()
	respBody, _ := ioutil.ReadAll(resp.Body)
	list := gjson.Get(string(respBody), "data.rows").Value().([]interface{})

	assert.Equal(t, 2, len(list))

	var tests []HttpTestCase
	for _, item := range list {
		route := item.(map[string]interface{})
		tc := HttpTestCase{
			Desc:         "route patch for update status(online)",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodPatch,
			Path:         "/apisix/admin/routes/" + route["id"].(string),
			Body:         `{"status":1}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		}
		tests = append(tests, tc)
		uris := route["uris"].([]interface{})
		isGet := false
		for _, uri := range uris {
			if uri == "/get" {
				isGet = true
			}
		}
		// verify route data
		if isGet {
			tcDataVerify := HttpTestCase{
				Desc:         "verify data of route",
				Object:       ManagerApiExpect(t),
				Method:       http.MethodGet,
				Path:         "/apisix/admin/routes/" + route["id"].(string),
				Headers:      map[string]string{"Authorization": token},
				ExpectStatus: http.StatusOK,
				ExpectBody: []string{`"methods":["GET","POST","HEAD","PUT","PATCH","DELETE"]`,
					`"proxy-rewrite":{"disable":false,"scheme":"http"}`,
					`"labels":{"API_VERSION":"v2","dev":"test"}`,
					`"upstream":{"nodes":[{"host":"172.16.238.20","port":80,"weight":1,"priority":10}],"timeout":{"connect":6000,"send":6000,"read":6000},"type":"roundrobin","pass_host":"node"}`,
				},
				Sleep: sleepTime,
			}
			tests = append(tests, tcDataVerify)
		} else {
			tcDataVerify := HttpTestCase{
				Desc:         "verify data of route2",
				Object:       ManagerApiExpect(t),
				Method:       http.MethodGet,
				Path:         "/apisix/admin/routes/" + route["id"].(string),
				Headers:      map[string]string{"Authorization": token},
				ExpectStatus: http.StatusOK,
				ExpectBody: []string{`"methods":["POST"]`,
					`"proxy-rewrite":{"disable":false,"scheme":"http"}`,
					`"labels":{"API_VERSION":"v1","version":"v1"}`,
					`"upstream":{"nodes":[{"host":"172.16.238.20","port":80,"weight":1,"priority":10}],"timeout":{"connect":6000,"send":6000,"read":6000},"type":"roundrobin","pass_host":"node"}`,
				},
				Sleep: sleepTime,
			}
			tests = append(tests, tcDataVerify)
		}
	}

	// verify route
	verifyTests := []HttpTestCase{
		{
			Desc:         "verify the route just imported",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/get",
			ExpectStatus: http.StatusOK,
			ExpectBody:   `/get`,
			Sleep:        sleepTime,
		},
		{
			Desc:         "verify the route just imported",
			Object:       APISIXExpect(t),
			Method:       http.MethodPost,
			Path:         "/post",
			ExpectStatus: http.StatusOK,
			ExpectBody:   `/post`,
			Sleep:        sleepTime,
		},
	}
	tests = append(tests, verifyTests...)

	// delete test data
	for _, item := range list {
		route := item.(map[string]interface{})
		tc := HttpTestCase{
			Desc:         "delete route",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/" + route["id"].(string),
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		}
		tests = append(tests, tc)
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}

func TestRoute_export_import(t *testing.T) {
	// create routes
	tests := []HttpTestCase{
		{
			Desc:   "Create a route",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
					"uris": ["/test-test1"],
					"name": "route_all1",
					"desc": "所有",
					"methods": ["GET"],
					"hosts": ["test.com"],
					"status": 1,
					"upstream": {
						"nodes": {
							"` + UpstreamIp + `:1980": 1
						},
						"type": "roundrobin"
					}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
		{
			Desc:   "Create a route2",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r2",
			Body: `{
					"uris": ["/test-test2"],
					"name": "route_all2",
					"desc": "所有1",
					"methods": ["GET"],
					"hosts": ["test.com"],
					"status": 1,
					"upstream": {
						"nodes": {
							"` + UpstreamIp + `:1980": 1
						},
						"type": "roundrobin"
					}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
		{
			Desc:   "Create a route3",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r3",
			Body: `{
					"uris": ["/test-test3"],
					"name": "route_all3",
					"desc": "所有2",
					"methods": ["GET"],
					"hosts": ["test.com"],
					"status": 1,
					"upstream": {
						"nodes": {
							"` + UpstreamIp + `:1980": 1
						},
						"type": "roundrobin"
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

	// export routes
	time.Sleep(sleepTime)
	tmpPath := "/tmp/export.json"
	headers := map[string]string{
		"Authorization": token,
	}
	body, status, err := httpGet(ManagerAPIHost+"/apisix/admin/export/routes", headers)
	assert.Nil(t, err)
	assert.Equal(t, http.StatusOK, status)

	content := gjson.Get(string(body), "data")
	err = ioutil.WriteFile(tmpPath, []byte(content.Raw), 0644)
	assert.Nil(t, err)

	// import routes (should failed -- duplicate)
	files := []UploadFile{
		{Name: "file", Filepath: tmpPath},
	}
	respBody, status, err := PostFile(ManagerAPIHost+"/apisix/admin/import/routes", nil, files, headers)
	assert.Nil(t, err)
	assert.Equal(t, 400, status)
	assert.True(t, strings.Contains(string(respBody), "duplicate"))
	time.Sleep(sleepTime)

	// delete routes
	tests = []HttpTestCase{
		{
			Desc:         "delete the route1 just created",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "delete the route2 just created",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r2",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "delete the route3 just created",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r3",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
	}
	for _, tc := range tests {
		testCaseCheck(tc, t)
	}

	// import again
	time.Sleep(sleepTime)
	respBody, status, err = PostFile(ManagerAPIHost+"/apisix/admin/import/routes", nil, files, headers)
	assert.Nil(t, err)
	assert.Equal(t, 200, status)
	assert.True(t, strings.Contains(string(respBody), `"data":{"paths":3,"routes":3}`))
	time.Sleep(sleepTime)

	// sleep for data sync
	time.Sleep(sleepTime)

	request, _ := http.NewRequest("GET", ManagerAPIHost+"/apisix/admin/routes", nil)
	request.Header.Add("Authorization", token)
	resp, err := http.DefaultClient.Do(request)
	assert.Nil(t, err)
	defer resp.Body.Close()
	respBody, _ = ioutil.ReadAll(resp.Body)
	list := gjson.Get(string(respBody), "data.rows").Value().([]interface{})

	assert.Equal(t, 3, len(list))

	// verify route data
	tests = []HttpTestCase{}
	for _, item := range list {
		route := item.(map[string]interface{})
		tcDataVerify := HttpTestCase{
			Desc:         "verify data of route2",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/routes/" + route["id"].(string),
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody: []string{`"methods":["GET"]`,
				`"desc":"所有`,
				`"hosts":["test.com"]`,
				`"upstream":{"nodes":[{"host":"` + UpstreamIp + `","port":1980,"weight":1}],"type":"roundrobin"}`,
			},
			Sleep: sleepTime,
		}
		tests = append(tests, tcDataVerify)
	}

	// delete test data
	for _, item := range list {
		route := item.(map[string]interface{})
		tc := HttpTestCase{
			Desc:         "delete route",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/" + route["id"].(string),
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		}
		tests = append(tests, tc)
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}

func TestRoute_export_import_merge(t *testing.T) {
	// create routes
	tests := []HttpTestCase{
		{
			Desc:   "Create a route",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
					"id": "r1",
					"uris": ["/test1", "/test2"],
					"name": "route_all",
					"desc": "所有",
					"methods": ["GET","POST","PUT","DELETE"],
					"hosts": ["test.com"],
					"status": 1,
					"upstream": {
						"nodes": {
							"` + UpstreamIp + `:1980": 1
						},
						"type": "roundrobin"
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

	// export routes
	time.Sleep(sleepTime)
	tmpPath := "/tmp/export.json"
	headers := map[string]string{
		"Authorization": token,
	}
	body, status, err := httpGet(ManagerAPIHost+"/apisix/admin/export/routes", headers)
	assert.Nil(t, err)
	assert.Equal(t, http.StatusOK, status)

	content := gjson.Get(string(body), "data")
	err = ioutil.WriteFile(tmpPath, []byte(content.Raw), 0644)
	assert.Nil(t, err)

	// import routes (should failed -- duplicate)
	files := []UploadFile{
		{Name: "file", Filepath: tmpPath},
	}
	respBody, status, err := PostFile(ManagerAPIHost+"/apisix/admin/import/routes", nil, files, headers)
	assert.Nil(t, err)
	assert.Equal(t, 400, status)
	assert.True(t, strings.Contains(string(respBody), "duplicate"))
	time.Sleep(sleepTime)

	// delete routes
	tests = []HttpTestCase{
		{
			Desc:         "delete the route1 just created",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
	}
	for _, tc := range tests {
		testCaseCheck(tc, t)
	}

	// import again
	time.Sleep(sleepTime)
	respBody, status, err = PostFile(ManagerAPIHost+"/apisix/admin/import/routes", nil, files, headers)
	assert.Nil(t, err)
	assert.Equal(t, 200, status)
	assert.True(t, strings.Contains(string(respBody), `"data":{"paths":2,"routes":1}`))
	time.Sleep(sleepTime)

	// sleep for data sync
	time.Sleep(sleepTime)

	request, _ := http.NewRequest("GET", ManagerAPIHost+"/apisix/admin/routes", nil)
	request.Header.Add("Authorization", token)
	resp, err := http.DefaultClient.Do(request)
	assert.Nil(t, err)
	defer resp.Body.Close()
	respBody, _ = ioutil.ReadAll(resp.Body)
	list := gjson.Get(string(respBody), "data.rows").Value().([]interface{})

	assert.Equal(t, 1, len(list))

	// verify route data
	tests = []HttpTestCase{}
	for _, item := range list {
		route := item.(map[string]interface{})
		tcDataVerify := HttpTestCase{
			Desc:         "verify data of route2",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/routes/" + route["id"].(string),
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody: []string{`"methods":["GET","POST","PUT","DELETE"]`,
				`"/test1"`,
				`"/test2"`,
				`"desc":"所有`,
				`"hosts":["test.com"]`,
				`"upstream":{"nodes":[{"host":"` + UpstreamIp + `","port":1980,"weight":1}],"type":"roundrobin"}`,
			},
			Sleep: sleepTime,
		}
		tests = append(tests, tcDataVerify)
	}

	// delete test data
	for _, item := range list {
		route := item.(map[string]interface{})
		tc := HttpTestCase{
			Desc:         "delete route",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/" + route["id"].(string),
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		}
		tests = append(tests, tc)
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}
