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
	"bytes"
	"context"
	"crypto/tls"
	"fmt"
	"io"
	"io/ioutil"
	"net"
	"net/http"
	"os"
	"os/exec"
	"reflect"
	"strings"
	"testing"
	"time"

	"github.com/gavv/httpexpect/v2"
	"github.com/pkg/errors"
	"github.com/stretchr/testify/assert"
	"github.com/tidwall/gjson"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/client-go/kubernetes"
	clientScheme "k8s.io/client-go/kubernetes/scheme"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/client/config"
)

var (
	token             string
	Token             string
	chaosTest         bool
	errorLogSinceTime time.Time

	UpstreamIp             = "172.16.238.20"
	APISIXHost             = "http://127.0.0.1:9080"
	APISIXInternalUrl      = "http://172.16.238.30:9080"
	APISIXSingleWorkerHost = "http://127.0.0.1:9081"
	ManagerAPIHost         = "http://127.0.0.1:9000"
)

func init() {
	if os.Getenv("CHAOS_TEST") != "" {
		UpstreamIp = "upstream.default.svc.cluster.local"
		APISIXInternalUrl = APISIXHost
		chaosTest = true
	}
}

func init() {
	//login to get auth token
	requestBody := []byte(`{
		"username": "admin",
		"password": "admin"
	}`)

	url := ManagerAPIHost + "/apisix/admin/user/login"
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewBuffer(requestBody))
	req.Header.Add("Content-Type", "application/json")
	if err != nil {
		panic(err)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}

	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		panic(err)
	}

	respond := gjson.ParseBytes(body)
	token = respond.Get("data.token").String()
	Token = token
}

func httpGet(url string, headers map[string]string) ([]byte, int, error) {
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, 0, err
	}
	for key, val := range headers {
		req.Header.Add(key, val)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, 0, err
	}

	return body, resp.StatusCode, nil
}

func ManagerApiExpect(t *testing.T) *httpexpect.Expect {
	return httpexpect.New(t, ManagerAPIHost)
}

func APISIXExpect(t *testing.T) *httpexpect.Expect {
	return httpexpect.New(t, APISIXHost)
}

func APISIXHTTPSExpect(t *testing.T) *httpexpect.Expect {
	e := httpexpect.WithConfig(httpexpect.Config{
		BaseURL:  "https://www.test2.com:9443",
		Reporter: httpexpect.NewAssertReporter(t),
		Client: &http.Client{
			Transport: &http.Transport{
				TLSClientConfig: &tls.Config{
					// accept any certificate; for testing only!
					InsecureSkipVerify: true,
				},
				DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
					if addr == "www.test2.com:9443" {
						addr = "127.0.0.1:9443"
					}
					dialer := &net.Dialer{}
					return dialer.DialContext(ctx, network, addr)
				},
			},
		},
	})

	return e
}

func BatchTestServerPort(t *testing.T, times int) map[string]int {
	url := APISIXSingleWorkerHost + "/server_port"
	req, err := http.NewRequest(http.MethodGet, url, nil)
	assert.Nil(t, err)

	res := map[string]int{}
	var resp *http.Response
	var client *http.Client
	var body string
	var bodyByte []byte

	for i := 0; i < times; i++ {
		client = &http.Client{}
		resp, err = client.Do(req)
		assert.Nil(t, err)

		bodyByte, err = ioutil.ReadAll(resp.Body)
		assert.Nil(t, err)
		body = string(bodyByte)

		if _, ok := res[body]; !ok {
			res[body] = 1
		} else {
			res[body] += 1
		}
	}

	defer resp.Body.Close()

	return res
}

var sleepTime = time.Duration(300) * time.Millisecond

type HttpTestCase struct {
	Desc          string
	Object        *httpexpect.Expect
	Method        string
	Path          string
	Query         string
	Body          string
	Headers       map[string]string
	Headers_test  map[string]interface{}
	ExpectStatus  int
	ExpectCode    int
	ExpectMessage string
	ExpectBody    interface{}
	UnexpectBody  interface{}
	ExpectHeaders map[string]string
	Sleep         time.Duration //ms
}

func testCaseCheck(tc HttpTestCase, t *testing.T) {
	t.Run(tc.Desc, func(t *testing.T) {
		//init
		expectObj := tc.Object
		var req *httpexpect.Request
		switch tc.Method {
		case http.MethodGet:
			req = expectObj.GET(tc.Path)
		case http.MethodPut:
			req = expectObj.PUT(tc.Path)
		case http.MethodPost:
			req = expectObj.POST(tc.Path)
		case http.MethodDelete:
			req = expectObj.DELETE(tc.Path)
		case http.MethodPatch:
			req = expectObj.PATCH(tc.Path)
		case http.MethodOptions:
			req = expectObj.OPTIONS(tc.Path)
		default:
		}

		if req == nil {
			panic("fail to init request")
		}

		if tc.Sleep != 0 {
			time.Sleep(tc.Sleep)
		} else {
			time.Sleep(time.Duration(50) * time.Millisecond)
		}

		if tc.Query != "" {
			req.WithQueryString(tc.Query)
		}

		// set header
		setContentType := false
		for key, val := range tc.Headers {
			req.WithHeader(key, val)
			if strings.ToLower(key) == "content-type" {
				setContentType = true
			}
		}

		// set default content-type
		if !setContentType {
			req.WithHeader("Content-Type", "application/json")
		}

		// set body
		if tc.Body != "" {
			req.WithText(tc.Body)
		}

		// respond check
		resp := req.Expect()

		// match http status
		if tc.ExpectStatus != 0 {
			resp.Status(tc.ExpectStatus)
		}

		// match headers
		if tc.ExpectHeaders != nil {
			for key, val := range tc.ExpectHeaders {
				resp.Header(key).Equal(val)
			}
		}

		// match body
		if tc.ExpectBody != nil {
			assert.Contains(t, []string{"string", "[]string"}, reflect.TypeOf(tc.ExpectBody).String())
			if body, ok := tc.ExpectBody.(string); ok {
				if body == "" {
					// "" indicates the body is expected to be empty
					resp.Body().Empty()
				} else {
					resp.Body().Contains(body)
				}
			} else if bodies, ok := tc.ExpectBody.([]string); ok && len(bodies) != 0 {
				for _, b := range bodies {
					resp.Body().Contains(b)
				}
			}
		}

		// match UnexpectBody
		if tc.UnexpectBody != nil {
			assert.Contains(t, []string{"string", "[]string"}, reflect.TypeOf(tc.UnexpectBody).String())
			if body, ok := tc.UnexpectBody.(string); ok {
				// "" indicates the body is expected to be non empty
				if body == "" {
					resp.Body().NotEmpty()
				} else {
					resp.Body().NotContains(body)
				}
			} else if bodies, ok := tc.UnexpectBody.([]string); ok && len(bodies) != 0 {
				for _, b := range bodies {
					resp.Body().NotContains(b)
				}
			}
		}
	})
}

func RunTestCases(tc HttpTestCase, t *testing.T) {
	testCaseCheck(tc, t)
}

func ReadAPISIXErrorLog(t *testing.T) string {
	if chaosTest {
		logContent, err := readAPISIXErrorLogFromK8S()
		assert.Nil(t, err)
		return logContent
	}
	cmd := exec.Command("pwd")
	pwdByte, err := cmd.CombinedOutput()
	pwd := string(pwdByte)
	pwd = strings.Replace(pwd, "\n", "", 1)
	pwd = pwd[:strings.Index(pwd, "/e2e")]
	bytes, err := ioutil.ReadFile(pwd + "/docker/apisix_logs/error.log")
	assert.Nil(t, err)
	logContent := string(bytes)

	return logContent
}

func readAPISIXErrorLogFromK8S() (string, error) {
	scheme := runtime.NewScheme()
	clientScheme.AddToScheme(scheme)

	restConfig := config.GetConfigOrDie()
	ctrlCli, err := client.New(restConfig, client.Options{Scheme: scheme})
	if err != nil {
		return "", err
	}
	kubeCli, err := kubernetes.NewForConfig(restConfig)
	if err != nil {
		return "", err
	}

	listOption := client.MatchingLabels{"io.kompose.service": "apisix"}
	podList := &corev1.PodList{}
	err = ctrlCli.List(context.Background(), podList, listOption)
	if err != nil {
		return "", err
	}
	pod := podList.Items[0]

	podLogOpts := corev1.PodLogOptions{}
	if !errorLogSinceTime.IsZero() {
		podLogOpts.SinceTime = &metav1.Time{Time: errorLogSinceTime}
	}

	req := kubeCli.CoreV1().Pods(pod.Namespace).GetLogs(pod.Name, &podLogOpts)
	podLogs, err := req.Stream(context.Background())
	if err != nil {
		return "", errors.Wrapf(err, "failed to open log stream for pod %s/%s", pod.GetNamespace(), pod.GetName())
	}
	defer podLogs.Close()

	buf := new(bytes.Buffer)
	_, err = io.Copy(buf, podLogs)
	if err != nil {
		return "", errors.Wrapf(err, "failed to copy information from podLogs to buf")
	}
	return buf.String(), nil
}

func CleanAPISIXErrorLog(t *testing.T) {
	if chaosTest {
		errorLogSinceTime = time.Now()
		return
	}
	cmd := exec.Command("pwd")
	pwdByte, err := cmd.CombinedOutput()
	pwd := string(pwdByte)
	pwd = strings.Replace(pwd, "\n", "", 1)
	pwd = pwd[:strings.Index(pwd, "/e2e")]
	cmd = exec.Command("sudo", "echo", " > ", pwd+"/docker/apisix_logs/error.log")
	_, err = cmd.CombinedOutput()
	if err != nil {
		fmt.Println("cmd error:", err.Error())
	}
	assert.Nil(t, err)
}

// ReadAPISIXAccessLog reads the access log of APISIX.
func ReadAPISIXAccessLog(t *testing.T) string {
	cmd := exec.Command("pwd")
	pwdByte, err := cmd.CombinedOutput()
	pwd := string(pwdByte)
	pwd = strings.Replace(pwd, "\n", "", 1)
	pwd = pwd[:strings.Index(pwd, "/e2e")]
	bytes, err := ioutil.ReadFile(pwd + "/docker/apisix_logs/access.log")
	assert.Nil(t, err)
	logContent := string(bytes)

	return logContent
}

// CleanAPISIXAccessLog cleans the access log of APISIX.
// It's always recommended to call this function before checking
// its content.
func CleanAPISIXAccessLog(t *testing.T) {
	cmd := exec.Command("pwd")
	pwdByte, err := cmd.CombinedOutput()
	pwd := string(pwdByte)
	pwd = strings.Replace(pwd, "\n", "", 1)
	pwd = pwd[:strings.Index(pwd, "/e2e")]
	cmd = exec.Command("sudo", "echo", " > ", pwd+"/docker/apisix_logs/access.log")
	_, err = cmd.CombinedOutput()
	if err != nil {
		fmt.Println("cmd error:", err.Error())
	}
	assert.Nil(t, err)
}
