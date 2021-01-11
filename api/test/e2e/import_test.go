package e2e

import (
	"github.com/stretchr/testify/assert"
	"github.com/tidwall/gjson"
	"io/ioutil"
	"net/http"
	"path/filepath"
	"testing"
)

func TestImport_default(t *testing.T) {
	path, err := filepath.Abs("../testdata/import-test-default.yaml")
	assert.Nil(t, err)

	headers := map[string]string{
		"Authorization": token,
	}
	files := []UploadFile{
		{Name: "file", Filepath: path},
	}
	PostFile(ManagerAPIHost+"/apisix/admin/import", nil, files, headers)

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
	path, err := filepath.Abs("../testdata/import-test.json")
	assert.Nil(t, err)

	headers := map[string]string{
		"Authorization": token,
	}
	files := []UploadFile{
		{Name: "file", Filepath: path},
	}
	PostFile(ManagerAPIHost+"/apisix/admin/import", nil, files, headers)

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
	path, err := filepath.Abs("../testdata/import-test-plugins.yaml")
	assert.Nil(t, err)

	headers := map[string]string{
		"Authorization": token,
	}
	files := []UploadFile{
		{Name: "file", Filepath: path},
	}
	PostFile(ManagerAPIHost+"/apisix/admin/import", nil, files, headers)

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
			ExpectBody:   `property "status" is required`,
			Sleep:        sleepTime,
		},
		{
			Desc:         "verify the route just imported",
			Object:       APISIXExpect(t),
			Method:       http.MethodPost,
			Path:         "/hello",
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
