package handler

import "github.com/gin-gonic/gin"

type Func = func(c *gin.Context) Response
type Response struct {
	Status  int
	Success bool
	Message string
	Data    map[string]interface{}
}

func Warp(f Func) gin.HandlerFunc {
	return func(c *gin.Context) {
		resp := f(c)
		if resp.Status == 0 {
			resp.Status = 200
		}
		c.JSON(resp.Status, buildResponse(resp.Success, resp.Message, resp.Data))
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
