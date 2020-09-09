package handler

import "github.com/gin-gonic/gin"

type RegisterFactory func() (RouteRegister, error)

type RouteRegister interface {
	ApplyRoute(r *gin.Engine)
}
