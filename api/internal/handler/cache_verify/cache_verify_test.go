package cache_verify

import (
	"github.com/shiningrush/droplet"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestCacheVerify(t *testing.T) {
	handler := &Handler{}
	assert.NotNil(t, handler)

	_, err := handler.CacheVerify(droplet.NewContext())
	assert.Nil(t, err)

}
