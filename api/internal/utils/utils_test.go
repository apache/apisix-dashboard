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
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetFlakeUid(t *testing.T) {
	id := GetFlakeUid()
	assert.NotEqual(t, 0, id)
}

func TestGetFlakeUidStr(t *testing.T) {
	id := GetFlakeUidStr()
	assert.NotEqual(t, "", id)
	assert.Equal(t, 18, len(id))
}

func TestGetLocalIPs(t *testing.T) {
	_, err := getLocalIPs()
	assert.Equal(t, nil, err)
}

func TestSumIPs_with_nil(t *testing.T) {
	total := sumIPs(nil)
	assert.Equal(t, uint16(0), total)
}
