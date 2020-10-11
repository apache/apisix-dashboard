package utils

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/xeipuuv/gojsonschema"

	"github.com/apisix/manager-api/conf"
)

func SchemaCheck(jsonPath string, reqBody interface{}) error {
	schemaDef := conf.Schema.Get(jsonPath).String()
	if schemaDef == "" {
		return fmt.Errorf("schema not found")
	}
	var err error

	bodyBytes, err := json.Marshal(reqBody)
	if err != nil {
		return err
	}
	body := string(bodyBytes)
	schemaLoader := gojsonschema.NewStringLoader(schemaDef)
	paramLoader := gojsonschema.NewStringLoader(body)
	schema, err := gojsonschema.NewSchema(schemaLoader)
	if err != nil {
		log.Println("body:", body, " schemaDef:", schemaDef)
		return fmt.Errorf("scheme load error: %s", err)
	}

	result, err := schema.Validate(paramLoader)
	if err != nil {
		log.Println("body:", body, " schemaDef:", schemaDef)
		return fmt.Errorf("scheme validate error: %s", err)
	}

	if !result.Valid() {
		actual := result.Errors()[0].String()
		log.Println("body:", body, " schemaDef:", schemaDef)
		return fmt.Errorf("scheme validate fail: %s", actual)
	}

	return nil
}
