package consts

import "github.com/shiningrush/droplet/data"

const (
	ErrCodeDemoBiz = 20000
)

var (
  // base error please refer to github.com/shiningrush/droplet/data, such as data.ErrNotFound, data.ErrConflicted
	ErrDemoBiz = data.BaseError{Code: ErrCodeDemoBiz, Message: "this is just a demo error"}
)
