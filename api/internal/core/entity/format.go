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
	"strconv"
	"strings"

	"github.com/apisix/manager-api/log"
)

func NodesFormat(obj interface{}) interface{} {
	var nodes []*Node
	switch objType := obj.(type) {
	case map[string]float64:
		log.Infof("nodes type: %v", objType)
		var strArr []string
		value := obj.(map[string]float64)
		for key, val := range value {
			node := &Node{}
			strArr = strings.Split(key, ":")
			if len(strArr) != 2 {
				log.Warn("length of string array is not 2")
				return obj
			}

			port, err := strconv.Atoi(strArr[1])
			if err != nil {
				log.Errorf("parse int fail:", err)
				return obj
			}

			node.Host = strArr[0]
			node.Port = port
			node.Weight = int(val)
			nodes = append(nodes, node)
		}
		return nodes
	case map[string]interface{}:
		log.Infof("nodes type: %v", objType)
		var strArr []string
		value := obj.(map[string]interface{})
		for key, val := range value {
			node := &Node{}
			strArr = strings.Split(key, ":")
			if len(strArr) != 2 {
				log.Warn("length of string array is not 2")
				return obj
			}

			port, err := strconv.Atoi(strArr[1])
			if err != nil {
				log.Errorf("parse int fail:", err)
				return obj
			}

			node.Host = strArr[0]
			node.Port = port
			node.Weight = int(val.(float64))
			nodes = append(nodes, node)
		}
		return nodes
	case []*Node:
		log.Infof("nodes type: %v", objType)
		return nodes
	case []interface{}:
		list := obj.([]interface{})
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
