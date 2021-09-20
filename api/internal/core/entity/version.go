package entity

import (
	"fmt"
	"reflect"

	"github.com/blang/semver"
)

var targetVersion = semver.MustParse("2.11.0")

// CompatibilityFilter version based data entity filter
func CompatibilityFilter(obj interface{}) (interface{}, error) {
	objType := processType(obj)
	objValue := processValue(obj)

	// skip invalid value
	if objValue.Kind() == reflect.Invalid {
		return obj, nil
	}

	for i := 0; i < objType.NumField(); i++ {
		field := objType.Field(i)
		value := objValue.Field(i)

		if field.Type == reflect.TypeOf(BaseInfo{}) {
			continue
		}

		// discard property (include struct and pointer) when targetVersion below supportVersion
		if version, ok := field.Tag.Lookup("version"); ok {
			supportedVersions := semver.MustParseRange(version)
			if !supportedVersions(targetVersion) {
				value.Set(reflect.Zero(field.Type))
				continue
			}
		} else {
			// property version define not existed
		}

		// process nested structures or pointers
		if field.Type.Kind() == reflect.Struct || field.Type.Kind() == reflect.Ptr {
			data, isPtr := formatEntity(value.Interface())

			// check whether the property in the structure supported by the targetVersion
			var (
				filteredData interface{}
				err error
			)
			if isPtr {
				filteredData, err = CompatibilityFilter(data)
			} else {
				filteredData, err = CompatibilityFilter(&data)
			}

			if err != nil {
				return nil, err
			}

			filteredValue := reflect.ValueOf(filteredData)

			// override original value
			if value.Kind() == reflect.Ptr {
				value.Set(filteredValue)
			} else if value.Kind() == reflect.Struct {
				value.Set(filteredValue.Elem())
			} else {
				continue
			}
		}

		// fill default value to empty property
	}

	return obj, nil
}

func processType(obj interface{}) reflect.Type {
	objType := reflect.TypeOf(obj)

	if objType.Kind() == reflect.Ptr {
		objType = objType.Elem()
	}

	return objType
}

func processValue(obj interface{}) reflect.Value {
	objValue := reflect.ValueOf(obj)

	if objValue.Kind() == reflect.Ptr {
		objValue = objValue.Elem()
	}

	return objValue
}

func formatEntity(obj interface{}) (interface{}, bool) {
	switch obj.(type) {
	case UpstreamDef:
		return obj.(UpstreamDef), false
	case *UpstreamDef:
		return obj.(*UpstreamDef), true
	}

	objType := reflect.TypeOf(obj)
	return obj, objType.Kind() == reflect.Ptr
}
