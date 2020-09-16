package route

import (
  "github.com/apisix/manager-api/internal/core/entity"
  "github.com/apisix/manager-api/internal/core/store"
  "github.com/apisix/manager-api/internal/handler"
  "github.com/apisix/manager-api/internal/utils"
  "github.com/gin-gonic/gin"
  "github.com/shiningrush/droplet"
  "github.com/shiningrush/droplet/data"
  "github.com/shiningrush/droplet/wrapper"
  wgin "github.com/shiningrush/droplet/wrapper/gin"
  "strings"

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
	r.GET("/apisix/admin/routes/:id",  wgin.Wraps(h.Get,
	  wrapper.InputType(reflect.TypeOf(GetInput{}))))
	r.GET("/apisix/admin/routes", wgin.Wraps(h.List,
    wrapper.InputType(reflect.TypeOf(ListInput{}))))
	r.POST("/apisix/admin/routes", wgin.Wraps(h.Create,
    wrapper.InputType(reflect.TypeOf(entity.Route{}))))
	r.PUT("/apisix/admin/routes/:id", wgin.Wraps(h.Update,
    wrapper.InputType(reflect.TypeOf(UpdateInput{}))))
	r.DELETE("/apisix/admin/routes", wgin.Wraps(h.BatchDelete,
    wrapper.InputType(reflect.TypeOf(BatchDelete{}))))
}

type GetInput struct {
  ID string `auto_read:"id,path" validate:"required"`
}

func (h *Handler) Get(c droplet.Context)(interface{}, error) {
	input := c.Input().(*GetInput)

	r, err := h.routeStore.Get(input.ID)
	if err != nil {
		return nil, err
	}
	return r, nil
}

type ListInput struct {
  Name string `auto_read:"name,query"`
  data.Pager
}

func (h *Handler) List(c droplet.Context)(interface{}, error) {
  input := c.Input().(*ListInput)

  ret, err := h.routeStore.List(store.ListInput{
    Predicate: func(obj interface{}) bool {
      if input.Name != "" {
        return strings.Index(obj.(*entity.Route).Name, input.Name) > 0
      }
      return true
    },
    PageSize:   input.PageSize,
    PageNumber: input.PageNumber,
  })
  if err != nil {
    return nil, err
  }

  return ret, nil
}

func (h *Handler) Create(c droplet.Context)(interface{}, error) {
  input := c.Input().(*entity.Route)

	if err := h.routeStore.Create(c.Context(), input); err != nil {
    return nil, err
  }

  return nil, nil
}

type UpdateInput struct {
  ID string `auto_read:"id,path"`
  entity.Route
}

func (h *Handler) Update(c droplet.Context)(interface{}, error) {
  input := c.Input().(*UpdateInput)
  input.Route.ID = input.ID

  if err := h.routeStore.Update(c.Context(), &input.Route); err != nil {
    return nil, err
  }

  return nil, nil
}

type BatchDelete struct {
  IDs string `auto_read:"ids,query"`
}

func (h *Handler) BatchDelete(c droplet.Context)(interface{}, error) {
  input := c.Input().(*BatchDelete)

  if err := h.routeStore.BatchDelete(c.Context(), strings.Split(input.IDs, ",")); err != nil {
    return nil, err
  }

  return nil, nil
}
