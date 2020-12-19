/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package utils

import (
	"encoding/json"
	jsonpatch "github.com/evanphx/json-patch/v5"
)

func MergeJson(doc, patch []byte) ([]byte, error) {
	out, err := jsonpatch.MergePatch(doc, patch)

	if err != nil {
		return nil, err
	}
	return out, nil
}

func PatchJson(doc []byte, path, val string) ([]byte, error) {
	patch := []byte(`[ { "op": "replace", "path": "` + path + `", "value": ` + val + `}]`)
	obj, err := jsonpatch.DecodePatch(patch)
	if err != nil {
		return nil, err
	}

	out, err := obj.Apply(doc)

	if err != nil {
		// try to add if field not exist
		patch = []byte(`[ { "op": "add", "path": "` + path + `", "value": ` + val + `}]`)
		obj, err = jsonpatch.DecodePatch(patch)
		if err != nil {
			return nil, err
		}
		out, err = obj.Apply(doc)
		if err != nil {
			return nil, err
		}
	}

	return out, nil
}

func MergePatch(obj interface{}, subPath string, reqBody []byte) ([]byte, error) {
	var res []byte
	jsonBytes, err := json.Marshal(obj)
	if err != nil {
		return res, err
	}

	if subPath != "" {
		res, err = PatchJson(jsonBytes, subPath, string(reqBody))
	} else {
		res, err = MergeJson(jsonBytes, reqBody)
	}

	if err != nil {
		return res, err
	}
	return res, nil
}
