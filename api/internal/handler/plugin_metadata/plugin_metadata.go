package plugin_metadata

import (
	"reflect"

	"github.com/gin-gonic/gin"
	"github.com/shiningrush/droplet"
	"github.com/shiningrush/droplet/wrapper"
	wgin "github.com/shiningrush/droplet/wrapper/gin"

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/apisix/manager-api/internal/handler"
)

type Handler struct {
	metadataStore store.Interface
}

type GetInput struct {
	ID string `auto_read:"id,path"`
}

type UpdateInput struct {
	ID string `auto_read:"id,path"`
	entity.Upstream
}

type BatchDelete struct {
	IDs string `auto_read:"id,path"`
}

func NewHandler() (handler.RouteRegister, error) {
	return &Handler{
		metadataStore: store.GetStore(store.HubKeyPluginMetaData),
	}, nil
}

func (h *Handler) ApplyRoute(r *gin.Engine) {
	r.GET("/apisix/admin/plugin_metadata/:id", wgin.Wraps(h.Get,
		wrapper.InputType(reflect.TypeOf(GetInput{}))))
	r.PUT("/apisix/admin/plugin_metadata/:id", wgin.Wraps(h.Update,
		wrapper.InputType(reflect.TypeOf(UpdateInput{}))))
	r.DELETE("/apisix/admin/plugin_metadata/:id", wgin.Wraps(h.Delete,
		wrapper.InputType(reflect.TypeOf(BatchDelete{}))))
}

func (h *Handler) Get(c droplet.Context) (interface{}, error) {
	input := c.Input().(*GetInput)

	r, err := h.metadataStore.Get(c.Context(), input.ID)
	if err != nil {
		return handler.SpecCodeResponse(err), err
	}
	return r, nil
}

func (h *Handler) Update(c droplet.Context) (interface{}, error) {
	//TODO

	return nil, nil
}

func (h *Handler) Delete(c droplet.Context) (interface{}, error) {
	//TODO

	return nil, nil
}
