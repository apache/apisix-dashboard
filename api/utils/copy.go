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

func CopyMap(origin map[string]interface{}) map[string]interface{} {
	result := make(map[string]interface{})
	for k, v := range origin {
		result[k] = v
	}
	return result
}

func CopyStrings(origin [][]string) [][]string {
	result := make([][]string, 0)
	for _, s := range origin {
		result = append(result, s)
	}
	return result
}

func Set2Map(origin []string) map[string]int {
	result := make(map[string]int)
	for _, s := range origin {
		result[s] = 1
	}
	return result
}
