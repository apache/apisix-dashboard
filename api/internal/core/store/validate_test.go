package store

import (
	"fmt"
	"github.com/stretchr/testify/assert"
	"testing"
)

type TestObj struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	Age   int    `json:"age"`
}

func TestJsonSchemaValidator_Validate(t *testing.T) {
	tests := []struct {
		givePath        string
		giveObj         interface{}
		wantNewErr      error
		wantValidateErr []error
	}{
		{
			givePath: "./test_case.json",
			giveObj: TestObj{
				Name:  "lessName",
				Email: "too long name greater than 10",
				Age:   12,
			},
			wantValidateErr: []error{
				fmt.Errorf("name: String length must be greater than or equal to 10\nemail: String length must be less than or equal to 10"),
				fmt.Errorf("email: String length must be less than or equal to 10\nname: String length must be greater than or equal to 10"),
			},
		},
	}

	for _, tc := range tests {
		v, err := NewJsonSchemaValidator(tc.givePath)
		if err != nil {
			assert.Equal(t, tc.wantNewErr, err)
			continue
		}
		err = v.Validate(tc.giveObj)
		ret := false
		for _, wantErr := range tc.wantValidateErr {
			if wantErr.Error() == err.Error() {
				ret = true
			}
		}
		assert.True(t, ret)
	}
}
