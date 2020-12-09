// API doc of Manager API.
//
// Manager API directly operates ETCD and provides data management for APISIX, provides APIs for Front-end or other clients.
//
// Terms Of Service:
//     Schemes: http, https
//     Host: 127.0.0.1
//     License: Apache License 2.0 http://www.apache.org/licenses/LICENSE-2.0
//
//     Consumes:
//     - application/json
//     - application/xml
//
//     Produces:
//     - application/json
//     - application/xml
//
// swagger:meta
package handler

import (
	"github.com/shiningrush/droplet"
	"github.com/shiningrush/droplet/middleware"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/shiningrush/droplet/data"
)

type RegisterFactory func() (RouteRegister, error)

type RouteRegister interface {
	ApplyRoute(r *gin.Engine)
}

func SpecCodeResponse(err error) *data.SpecCodeResponse {
	errMsg := err.Error()
	if strings.Contains(errMsg, "required") ||
		strings.Contains(errMsg, "conflicted") ||
		strings.Contains(errMsg, "invalid") ||
		strings.Contains(errMsg, "missing") ||
		strings.Contains(errMsg, "schema validate failed") {
		return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest}
	}

	if strings.Contains(errMsg, "not found") {
		return &data.SpecCodeResponse{StatusCode: http.StatusNotFound}
	}

	return &data.SpecCodeResponse{StatusCode: http.StatusInternalServerError}
}

type ErrorTransformMiddleware struct {
	middleware.BaseMiddleware
}

func (mw *ErrorTransformMiddleware) Handle(ctx droplet.Context) error {
	if err := mw.BaseMiddleware.Handle(ctx); err != nil {
		bErr, ok := err.(*data.BaseError)
		if !ok {
			return err
		}
		switch bErr.Code {
		case data.ErrCodeValidate, data.ErrCodeFormat:
			ctx.SetOutput(&data.SpecCodeResponse{StatusCode: http.StatusBadRequest})
		case data.ErrCodeInternal:
			ctx.SetOutput(&data.SpecCodeResponse{StatusCode: http.StatusInternalServerError})
		}
		return err
	}
	return nil
}
