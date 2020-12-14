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

func TestGenLabelMap(t *testing.T) {
	mp := GenLabelMap("l1,l2:v2")

	assert.Equal(t, mp["l1"], "")
	assert.Equal(t, mp["l2"], "v2")
}

func TestLabelContains(t *testing.T) {
	mp1 := GenLabelMap("l1,l2:v2")
	mp2 := map[string]string{
		"l1": "v1",
	}
	assert.True(t, LabelContains(mp2, mp1))

	mp3 := map[string]string{
		"l1": "v1",
		"l2": "v3",
	}
	assert.True(t, LabelContains(mp3, mp1))

	mp4 := map[string]string{
		"l2": "v3",
	}
	assert.False(t, LabelContains(mp4, mp1))
}
