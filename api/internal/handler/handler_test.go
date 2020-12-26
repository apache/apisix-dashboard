package handler

import (
	"errors"
	"testing"

	"github.com/go-playground/assert/v2"
)

func TestIDCompare(t *testing.T) {
	// init
	cases := []struct {
		idOnPath, desc string
		idOnBody       interface{}
		wantError      error
	}{
		{
			desc:     "ID on body is int, and it could be considered the same as ID on path",
			idOnPath: "1",
			idOnBody: 1,
		},
		{
			desc:      "ID on body is int, and it is different from ID on path",
			idOnPath:  "1",
			idOnBody:  2,
			wantError: errors.New("ID on path (1) doesn't match ID on body (2)"),
		},
		{
			desc:     "ID on body is same as ID on path",
			idOnPath: "1",
			idOnBody: "1",
		},
		{
			desc:      "ID on body is different from ID on path",
			idOnPath:  "a",
			idOnBody:  "b",
			wantError: errors.New("ID on path (a) doesn't match ID on body (b)"),
		},
		{
			desc:     "No ID on body",
			idOnPath: "1",
		},
		{
			desc:     "No ID on path",
			idOnBody: 1,
		},
	}
	for _, c := range cases {
		t.Run(c.desc, func(t *testing.T) {
			err := IDCompare(c.idOnPath, c.idOnBody)
			assert.Equal(t, c.wantError, err)
		})
	}
}
