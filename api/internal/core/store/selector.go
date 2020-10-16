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
// Copyright 2017 The Kubernetes Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package store

import (
	"sort"

	"github.com/apisix/manager-api/internal/core/entity"
)

type Row interface {
	GetProperty(entity.PropertyName) entity.ComparableValue
}

type Selector struct {
	List  []Row
	Query *Query
}

func (self Selector) Len() int { return len(self.List) }

func (self Selector) Swap(i, j int) {
	self.List[i], self.List[j] = self.List[j], self.List[i]
}

func (self Selector) Less(i, j int) bool {
	for _, sortBy := range self.Query.Sort.List {
		a := self.List[i].GetProperty(sortBy.Property)
		b := self.List[j].GetProperty(sortBy.Property)
		if a == nil || b == nil {
			break
		}
		cmp := a.Compare(b)
		if cmp == 0 {
			continue
		} else {
			return (cmp == -1 && sortBy.Ascending) || (cmp == 1 && !sortBy.Ascending)
		}
	}
	return false
}

func (self *Selector) Sort() *Selector {
	sort.Sort(*self)
	return self
}

func (self *Selector) Filter() *Selector {
	filteredList := []Row{}
	for _, c := range self.List {
		matches := true
		for _, filterBy := range self.Query.Filter.List {
			v := c.GetProperty(filterBy.Property)
			if v == nil || v.Compare(filterBy.Value) != 0 {
				matches = false
				break
			}
		}
		if matches {
			filteredList = append(filteredList, c)
		}
	}

	self.List = filteredList
	return self
}

func (self *Selector) Paginate() *Selector {
	pagination := self.Query.Pagination
	dataList := self.List
	TotalSize := len(dataList)
	startIndex, endIndex := pagination.Index(TotalSize)

	if startIndex == 0 && endIndex == 0 {
		return self
	}

	if !pagination.IsValid() {
		self.List = []Row{}
		return self
	}

	if startIndex > TotalSize {
		self.List = []Row{}
		return self
	}

	if endIndex >= TotalSize {
		self.List = dataList[startIndex:]
		return self
	}

	self.List = dataList[startIndex:endIndex]
	return self
}

func NewFilterSelector(list []Row, query *Query) []Row {
	selector := Selector{
		List:  list,
		Query: query,
	}
	filtered := selector.Filter()
	paged := filtered.Paginate()
	return paged.List
}

func DefaultSelector(list []Row, query *Query) ([]Row, int) {
	selector := Selector{
		List:  list,
		Query: query,
	}
	filtered := selector.Filter()
	filteredTotal := len(filtered.List)
	paged := filtered.Sort().Paginate()
	return paged.List, filteredTotal
}
