package data_loader

import (
	"encoding/json"
	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/getkin/kin-openapi/openapi3"
	"github.com/shiningrush/droplet"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"testing"
)

func TestExportRoutes(t *testing.T) {
	input := &ExportInput{IDs: "1"}
	//*entity.Route
	r := `{
            "id":"338557727322211274",
            "create_time":1611325730,
            "update_time":1611325730,
            "uri":"/test",
            "name":"test_kongGet",
            "plugins":{
                "proxy-rewrite":{
                    "disable":false,
                    "scheme":"https"
                }
            },
            "upstream":{
                "nodes":[
                    {
                        "host":"httpin.org",
                        "port":443,
                        "weight":1
                    }
                ],
                "type":"roundrobin",
                "pass_host":"pass"
            },
            "status":1
        }`
	var route *entity.Route
	err := json.Unmarshal([]byte(r), &route)
	mStore := &store.MockInterface{}
	mStore.On("Get", mock.Anything).Run(func(args mock.Arguments) {
	}).Return(route, nil)

	h := Handler{routeStore: mStore}
	ctx := droplet.NewContext()
	ctx.SetInput(input)

	ret, err := h.ExportRoutes(ctx)
	assert.Nil(t, err)
	swagger, ok := ret.(*openapi3.Swagger)
	assert.Equal(t, true, ok)
	assert.NotNil(t, swagger)
	// other asserts
}
