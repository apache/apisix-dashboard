package route

import (
  "bytes"
  "net/http"
  "strings"
  "testing"
)

var token string

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
  sessionResponse := handler.
    Post("/user/login").
    Header("Content-Type", "application/x-www-form-urlencoded").
    Body("username=admin&password=admin").
    Expect(t).
    Status(http.StatusOK).
    End().Response.Body

  buf := new(bytes.Buffer)
  buf.ReadFrom(sessionResponse)
  data := buf.String()
  tokenArr := strings.Split(data, "\"token\":\"")
  token = strings.Split(tokenArr[1], "\"}")[0]
}
