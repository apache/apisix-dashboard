package conf

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
)

func Test_mergeSchema(t *testing.T) {
	type args struct {
		apisixSchema    []byte
		customizeSchema []byte
	}
	tests := []struct {
		name           string
		args           args
		wantRes        []byte
		wantErr        bool
		wantErrMessage string
	}{
		{
			name: "should failed when have duplicates key",
			args: args{
				apisixSchema:    []byte(`{"main":{"a":1,"b":2},"plugins":{"a":1}}`),
				customizeSchema: []byte(`{"main":{"b":1}}`),
			},
			wantErr:        true,
			wantErrMessage: "duplicates key: main.b between schema.json and customize_schema.json",
		},
		{
			name: "should success",
			args: args{
				apisixSchema:    []byte(`{"main":{"a":1,"b":2},"plugins":{"a":1}}`),
				customizeSchema: []byte(`{"main":{"c":3}}`),
			},
			wantErr: false,
			wantRes: []byte(`{"main":{"a":1,"b":2,"c":3},"plugins":{"a":1}}`),
		},
	}
	for _, tt := range tests {

		t.Run(tt.name, func(t *testing.T) {
			var (
				wantMap map[string]interface{}
				gotMap  map[string]interface{}
			)

			got, err := mergeSchema(tt.args.apisixSchema, tt.args.customizeSchema)
			if tt.wantErr {
				assert.Equal(t, tt.wantErrMessage, err.Error())
				return
			}

			assert.NoError(t, err)
			err = json.Unmarshal(got, &gotMap)
			assert.NoError(t, err)
			err = json.Unmarshal(tt.wantRes, &wantMap)
			assert.NoError(t, err)
			assert.Equal(t, wantMap, gotMap)
		})
	}
}
