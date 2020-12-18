package route_online_debug

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"reflect"
	"strings"
	"time"

	"github.com/apisix/manager-api/internal/handler"
	"github.com/gin-gonic/gin"
	"github.com/shiningrush/droplet"
	"github.com/shiningrush/droplet/data"
	"github.com/shiningrush/droplet/wrapper"
	wgin "github.com/shiningrush/droplet/wrapper/gin"
)

type Handler struct {
}

func NewHandler() (handler.RouteRegister, error) {
	return &Handler{}, nil
}

type ProtocolSupport interface {
	RequestForwarding(c droplet.Context) (interface{}, error)
}

var protocolMap map[string]ProtocolSupport

func init() {
	protocolMap = make(map[string]ProtocolSupport)
	protocolMap["http"] = &HTTPProtocolSupport{}
}

func (h *Handler) ApplyRoute(r *gin.Engine) {
	r.POST("/apisix/admin/debug-request-forwarding", wgin.Wraps(DebugRequestForwarding,
		wrapper.InputType(reflect.TypeOf(ParamsInput{}))))
}

type ParamsInput struct {
	URL             string              `json:"url,omitempty"`
	RequestProtocol string              `json:"request_protocol,omitempty"`
	BodyParams      map[string]string   `json:"body_params,omitempty"`
	Method          string              `json:"method,omitempty"`
	HeaderParams    map[string][]string `json:"header_params,omitempty"`
}

type Result struct {
	Code    int         `json:"code,omitempty"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}

func DebugRequestForwarding(c droplet.Context) (interface{}, error) {
	//TODO: other Protocols, e.g: grpc, websocket
	paramsInput := c.Input().(*ParamsInput)
	requestProtocol := paramsInput.RequestProtocol
	if requestProtocol == "" {
		requestProtocol = "http"
	}
	if v, ok := protocolMap[requestProtocol]; ok {
		return v.RequestForwarding(c)
	} else {
		return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest}, fmt.Errorf("protocol unspported %s", paramsInput.RequestProtocol)
	}
}

type HTTPProtocolSupport struct {
}

func (h *HTTPProtocolSupport) RequestForwarding(c droplet.Context) (interface{}, error) {
	paramsInput := c.Input().(*ParamsInput)
	bodyParams, _ := json.Marshal(paramsInput.BodyParams)
	client := &http.Client{}

	client.Timeout = 5 * time.Second
	req, err := http.NewRequest(strings.ToUpper(paramsInput.Method), paramsInput.URL, strings.NewReader(string(bodyParams)))
	if err != nil {
		return &data.SpecCodeResponse{StatusCode: http.StatusInternalServerError}, err
	}
	for k, v := range paramsInput.HeaderParams {
		for _, v1 := range v {
			req.Header.Add(k, v1)
		}
	}
	resp, err := client.Do(req)
	if err != nil {
		return &data.SpecCodeResponse{StatusCode: http.StatusInternalServerError}, err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return &data.SpecCodeResponse{StatusCode: http.StatusInternalServerError}, err
	}
	returnData := make(map[string]interface{})
	result := &Result{}
	err = json.Unmarshal(body, &returnData)
	if err != nil {
		result.Code = resp.StatusCode
		result.Message = resp.Status
		result.Data = string(body)
	} else {
		result.Code = resp.StatusCode
		result.Message = resp.Status
		result.Data = returnData

	}
	return result, nil
}
