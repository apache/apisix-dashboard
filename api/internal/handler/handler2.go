package handler

import (
	"net/http"
	"reflect"

	"github.com/gin-gonic/gin"
	"github.com/pkg/errors"
)

type Func = func(c *gin.Context, input interface{}) Response
type Response struct {
	StatusCode int
	Success    bool
	Message    string
	Data       map[string]interface{}
}

func Wrap(f Func, inputType reflect.Type) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input interface{}
		if inputType != nil {
			input = reflect.New(inputType).Interface()
			if err := c.ShouldBind(&input); err != nil {
				c.AbortWithStatusJSON(http.StatusBadRequest, buildResponse(false, errors.Wrap(err, "input parse error").Error(), nil))
				return
			}
		}

		resp := f(c, input)
		if resp.StatusCode == 0 {
			resp.StatusCode = 200
		}
		c.JSON(resp.StatusCode, buildResponse(resp.Success, resp.Message, resp.Data))
	}
}

// buildResponse builds the response body for the Dashboard Resource API output.
func buildResponse(success bool, message string, data map[string]interface{}) map[string]interface{} {
	resp := map[string]interface{}{
		"success": success,
		"message": message,
	}
	if data != nil {
		resp["data"] = data
	}
	return resp
}
