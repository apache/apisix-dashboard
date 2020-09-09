package route

import (
	"encoding/json"
	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/apisix/manager-api/internal/handler"
	"github.com/apisix/manager-api/internal/utils"
	"github.com/apisix/manager-api/service"
	"github.com/gin-gonic/gin"
	"net/http"
	"reflect"
)

type Handler struct {
	routeStore *store.GenericStore
}

func NewHandler() (handler.RouteRegister, error) {
	s, err := store.NewGenericStore(store.GenericStoreOption{
		BasePath: "/apisix/routes",
		ObjType:  reflect.TypeOf(entity.Route{}),
		KeyFunc: func(obj interface{}) string {
			r := obj.(*entity.Route)
			return r.ID
		},
	})
	if err != nil {
		return nil, err
	}
	if err := s.Init(); err != nil {
		return nil, err
	}

	utils.AppendToClosers(s.Close)
	return &Handler{
		routeStore: s,
	}, nil
}

func (h *Handler) ApplyRoute(r *gin.Engine) {
	// it is a terrible bugs
	//r.Group("/apisix/admin/routes")
	//{
	//  r.GET("/:id", h.Get)
	//  r.GET("", h.List)
	//  r.POST("", h.Create)
	//  r.PUT("/:id", h.Update)
	//  r.DELETE("", h.BatchDelete)
	//}

	r.GET("/apisix/admin/routes/:id", h.Get)
	r.GET("/apisix/admin/routes", h.List)
	r.POST("/apisix/admin/routes", h.Create)
	r.PUT("/apisix/admin/routes/:id", h.Update)
	r.DELETE("/apisix/admin/routes", h.BatchDelete)
}

func (h *Handler) Get(c *gin.Context) {
	id := c.Param("id")
	r, err := h.routeStore.Get(id)
	if err != nil {
		// TODO
		return
	}
	bs, _ := json.Marshal(r)
	c.Data(http.StatusOK, service.ContentType, bs)
}
func (h *Handler) List(c *gin.Context) {
	// TODO
}
func (h *Handler) Create(c *gin.Context) {
	// TODO
}
func (h *Handler) Update(c *gin.Context) {
	// TODO
}
func (h *Handler) BatchDelete(c *gin.Context) {
	// TODO
}
