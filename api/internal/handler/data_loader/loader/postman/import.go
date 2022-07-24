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
package postman

import (
	"fmt"
	"bytes"
	"reflect"
	"github.com/apisix/manager-api/internal/handler/data_loader/loader"

	postman "github.com/rbretecher/go-postman-collection"

)

func (o Loader) Import(input interface{}) (*loader.DataSets, error) {
	if input == nil {
		panic("handler/data_loader: input is nil")
	}

	d, ok := input.([]byte)
	_ = d
	if !ok {
                panic(fmt.Sprintf("handler/data_loader: input format error: expected []byte but it is %s", reflect.TypeOf(input).Kind().String()))
        }


	if !ok {
                panic(fmt.Sprintf("input format error: expected []byte but it is %s", reflect.TypeOf(input).Kind().String()))
        }

	// Load postman document
	r := bytes.NewReader(d)
	postman, err := postman.ParseCollection(r)
	_ = postman
	if err != nil {
                return nil, err
        }

	fmt.Println("%v+n", postman)

	data := &loader.DataSets{}
	return data, nil
}



