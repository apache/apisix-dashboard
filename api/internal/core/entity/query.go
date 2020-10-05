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

import "strings"

type PropertyName string

const (
	IdProperty         = "id"
	NameProperty       = "name"
	CreateTimeProperty = "create_time"
	UpdateTimeProperty = "update_time"
)

type ComparingString string

type ComparableValue interface {
	Compare(ComparableValue) int
	Contains(ComparableValue) bool
}

func (comparing ComparingString) Compare(compared ComparableValue) int {
	other := compared.(ComparingString)
	return strings.Compare(string(comparing), string(other))
}

func (comparing ComparingString) Contains(compared ComparableValue) bool {
	other := compared.(ComparingString)
	return strings.Contains(string(comparing), string(other))
}

type ComparingInt int64

func int64Compare(a, b int64) int {
	if a > b {
		return 1
	} else if a == b {
		return 0
	}
	return -1
}

func (comparing ComparingInt) Compare(compared ComparableValue) int {
	other := compared.(ComparingInt)
	return int64Compare(int64(comparing), int64(other))
}

func (comparing ComparingInt) Contains(compared ComparableValue) bool {
	return comparing.Compare(compared) == 0
}

func (info BaseInfo) GetProperty(name PropertyName) ComparableValue {
	switch name {
	case IdProperty:
		return ComparingString(info.ID)
	case CreateTimeProperty:
		return ComparingInt(info.CreateTime)
	case UpdateTimeProperty:
		return ComparingInt(info.UpdateTime)
	default:
		return nil
	}
}

func (route Route) GetProperty(name PropertyName) ComparableValue {
	switch name {
	case NameProperty:
		return ComparingString(route.Name)
	default:
		return nil
	}
}

func (upstream Upstream) GetProperty(name PropertyName) ComparableValue {
	switch name {
	case NameProperty:
		return ComparingString(upstream.Name)
	default:
		return nil
	}
}
