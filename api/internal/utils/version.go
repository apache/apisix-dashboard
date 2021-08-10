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
	"fmt"
	"os"
)

var (
	gitHash string
	version string
)

// GetHashAndVersion get the hash and version
func GetHashAndVersion() (string, string) {
	return gitHash, version
}

// PrintVersion print version and git hash to stdout
func PrintVersion() {
	gitHash, version := GetHashAndVersion()
	fmt.Fprintf(os.Stdout, "%-8s: %s\n", "Version", version)
	fmt.Fprintf(os.Stdout, "%-8s: %s\n", "GitHash", gitHash)
}
