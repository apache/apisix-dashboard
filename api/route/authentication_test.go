package route

import (
  "net/http"
  "testing"
)

var session string

func TestUserLogin(t *testing.T) {
  // password error
  handler.
    Post("/user/login").
    Header("Content-Type", "application/x-www-form-urlencoded").
    Body("username=admin&password=admin1").
    Expect(t).
    Status(http.StatusUnauthorized).
    End()

  // login success
  sessionResponseCookie := handler.
    Post("/user/login").
    Header("Content-Type", "application/x-www-form-urlencoded").
    Body("username=admin&password=admin").
    Expect(t).
    Status(http.StatusOK).
    End().Response.Cookies()

  session = sessionResponseCookie[0].Value
}
