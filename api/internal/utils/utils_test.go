package utils

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestGetFlakeUid(t *testing.T) {
	id := GetFlakeUid()
	assert.NotEqual(t, 0, id)
}

func TestGetFlakeUidStr(t *testing.T) {
	id := GetFlakeUidStr()
	assert.NotEqual(t, "", id)
}
