package consumer

import (
	"reflect"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/shiningrush/droplet"
	"github.com/shiningrush/droplet/data"
	"github.com/shiningrush/droplet/wrapper"
	wgin "github.com/shiningrush/droplet/wrapper/gin"

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/apisix/manager-api/internal/handler"
	"github.com/apisix/manager-api/internal/utils"
)

type Handler struct {
	consumerStore *store.GenericStore
}

func NewHandler() (handler.RouteRegister, error) {
	s, err := store.NewGenericStore(store.GenericStoreOption{
		BasePath: "/apisix/consumers",
		ObjType:  reflect.TypeOf(entity.Consumer{}),
		KeyFunc: func(obj interface{}) string {
			r := obj.(*entity.Consumer)
			return r.Username
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
		consumerStore: s,
	}, nil
}

func (h *Handler) ApplyRoute(r *gin.Engine) {
	r.GET("/apisix/admin/consumers/:id", wgin.Wraps(h.Get,
		wrapper.InputType(reflect.TypeOf(GetInput{}))))
	r.GET("/apisix/admin/consumers", wgin.Wraps(h.List,
		wrapper.InputType(reflect.TypeOf(ListInput{}))))
	r.POST("/apisix/admin/consumers", wgin.Wraps(h.Create,
		wrapper.InputType(reflect.TypeOf(entity.Consumer{}))))
	r.PUT("/apisix/admin/consumers/:id", wgin.Wraps(h.Update,
		wrapper.InputType(reflect.TypeOf(UpdateInput{}))))
	r.DELETE("/apisix/admin/consumers", wgin.Wraps(h.BatchDelete,
		wrapper.InputType(reflect.TypeOf(BatchDelete{}))))
}

type GetInput struct {
	ID string `auto_read:"id,path" validate:"required"`
}

func (h *Handler) Get(c droplet.Context) (interface{}, error) {
	input := c.Input().(*GetInput)

	r, err := h.consumerStore.Get(input.ID)
	if err != nil {
		return nil, err
	}
	return r, nil
}

type ListInput struct {
	Username string `auto_read:"username,query"`
	data.Pager
}

func (h *Handler) List(c droplet.Context) (interface{}, error) {
	input := c.Input().(*ListInput)

	ret, err := h.consumerStore.List(store.ListInput{
		Predicate: func(obj interface{}) bool {
			if input.Username != "" {
				return strings.Index(obj.(*entity.Consumer).Username, input.Username) > 0
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

func (h *Handler) Create(c droplet.Context) (interface{}, error) {
	input := c.Input().(*entity.Consumer)

	if err := h.consumerStore.Create(c.Context(), input); err != nil {
		return nil, err
	}

	return nil, nil
}

type UpdateInput struct {
	ID string `auto_read:"id,path"`
	entity.Consumer
}

func (h *Handler) Update(c droplet.Context) (interface{}, error) {
	input := c.Input().(*UpdateInput)
	input.Consumer.ID = input.ID

	if err := h.consumerStore.Update(c.Context(), &input.Consumer); err != nil {
		return nil, err
	}

	return nil, nil
}

type BatchDelete struct {
	UserNames string `auto_read:"usernames,query"`
}

func (h *Handler) BatchDelete(c droplet.Context) (interface{}, error) {
	input := c.Input().(*BatchDelete)

	if err := h.consumerStore.BatchDelete(c.Context(), strings.Split(input.UserNames, ",")); err != nil {
		return nil, err
	}

	return nil, nil
}
