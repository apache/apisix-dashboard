package power

import (
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"net/http"
	"net/http/httptest"
	"testing"
)

func performRequest(r http.Handler, method, path string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(method, path, nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func TestInitAdminRoute(t *testing.T) {
	r := gin.New()
	r.Use(CheckForPower(Identity{}))
	r.POST("/admin/post", func(c *gin.Context) {
	})
	InitAdminRoute(r)

	w := performRequest(r, "POST", "/admin/post")
	assert.Equal(t, http.StatusUnauthorized, w.Code)

}
