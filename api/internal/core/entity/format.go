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
	"net"
	"strconv"

	"github.com/apisix/manager-api/log"
)

func mapKV2Node(key string, val float64) (*Node, error) {
	host, port, err := net.SplitHostPort(key)
	if err != nil {
		log.Warn("split host port fail: %s", err)
		return nil, err
	}

	portInt, err := strconv.Atoi(port)
	if err != nil {
		log.Errorf("parse port to int fail: %s", err)
		return nil, err
	}

	node := &Node{
		Host:   host,
		Port:   portInt,
		Weight: int(val),
	}

	return node, nil
}

func NodesFormat(obj interface{}) interface{} {
	var nodes []*Node
	switch objType := obj.(type) {
	case map[string]float64:
		log.Infof("nodes type: %v", objType)
		value := obj.(map[string]float64)
		for key, val := range value {
			node, err := mapKV2Node(key, val)
			if err != nil {
				return obj
			}
			nodes = append(nodes, node)
		}
		return nodes
	case map[string]interface{}:
		log.Infof("nodes type: %v", objType)
		value := obj.(map[string]interface{})
		for key, val := range value {
			node, err := mapKV2Node(key, val.(float64))
			if err != nil {
				return obj
			}
			nodes = append(nodes, node)
		}
		return nodes
	case []*Node:
		log.Infof("nodes type: %v", objType)
		return obj
	case []interface{}:
		log.Infof("nodes type []interface{}: %v", objType)
		list := obj.([]interface{})
		for _, v := range list {
			val := v.(map[string]interface{})
			node := &Node{
				Host:   val["host"].(string),
				Port:   int(val["port"].(float64)),
				Weight: int(val["weight"].(float64)),
			}
			nodes = append(nodes, node)
		}
		return nodes
	}

	return obj
}
