package consts

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

type WrapperHandle func(c *gin.Context) (interface{}, error)

func ErrorWrapper(handle WrapperHandle) gin.HandlerFunc {
	return func(c *gin.Context) {
		data, err := handle(c)
		if err != nil {
			apiError := err.(*ApiError)
			c.JSON(apiError.Status, apiError)
			return
		}
		c.JSON(http.StatusOK, gin.H{"data": data, "code": 200, "message": "success"})
	}
}

type ApiError struct {
	Status  int    `json:"-"`
	Code    int    `json:"code"`
	Message string `json:"message"`
}

func (err ApiError) Error() string {
	return err.Message
}

func InvalidParam(message string) *ApiError {
	return &ApiError{400, 400, message}
}

func SystemError(message string) *ApiError {
	return &ApiError{500, 500, message}
}
