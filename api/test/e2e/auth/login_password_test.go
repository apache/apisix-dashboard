package auth_test

import (
	"net/http"

	. "github.com/onsi/ginkgo"

	"github.com/apache/apisix-dashboard/api/test/e2e/base"
)

var _ = Describe("Login (Password)", func() {
	It("Login with valid password", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPost,
			Path:         "/apisix/admin/user/login",
			Body:         `{"username": "admin","password": "admin"}`,
			ExpectStatus: http.StatusOK,
			ExpectBody:   `"code":0`,
		})
	})

	It("Login with invalid username", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPost,
			Path:         "/apisix/admin/user/login",
			Body:         `{"username": "abcd","password": "admin"}`,
			ExpectStatus: http.StatusUnauthorized,
			ExpectBody:   `username or password error`,
		})
	})

	It("Login with invalid password", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPost,
			Path:         "/apisix/admin/user/login",
			Body:         `{"username": "admin","password": "password"}`,
			ExpectStatus: http.StatusUnauthorized,
			ExpectBody:   `username or password error`,
		})
	})

})
