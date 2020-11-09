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
package entity

import (
	"log"
	"strconv"
	"strings"
)

func NodesFormat(obj interface{}) interface{} {
	var nodes []*Node
	if value, ok := obj.(map[string]float64); ok {
		var strArr []string
		for key, val := range value {
			node := &Node{}
			strArr = strings.Split(key, ":")
			if len(strArr) != 2 {
				log.Println("length of string array is not 2")
				return obj
			}

			port, err := strconv.Atoi(strArr[1])
			if err != nil {
				log.Println("parse int fail:", err)
				return obj
			}

			node.Host = strArr[0]
			node.Port = port
			node.Weight = int(val)
			nodes = append(nodes, node)
		}
		return nodes
	}

	if nodes, ok := obj.([]*Node); ok {
		return nodes
	}

	if list, ok := obj.([]interface{}); ok {
		for _, v := range list {
			val := v.(map[string]interface{})
			node := &Node{}
			node.Host = val["host"].(string)
			node.Port = int(val["port"].(float64))
			node.Weight = int(val["weight"].(float64))
			nodes = append(nodes, node)
		}

		return nodes
	}

	return obj
}
