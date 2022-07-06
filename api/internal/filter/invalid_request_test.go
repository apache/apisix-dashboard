package filter

import (
	"net/url"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestURLCheck_double_dot(t *testing.T) {
	assert.Equal(t, false, checkURL(&url.URL{Path: "../../../etc/hosts"}))
	assert.Equal(t, false, checkURL(&url.URL{Path: "/../../../etc/hosts"}))
	assert.Equal(t, true, checkURL(&url.URL{Path: "/etc/hosts"}))
}
