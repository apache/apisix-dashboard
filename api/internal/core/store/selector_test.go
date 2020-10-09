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
	"reflect"
	"testing"

	"github.com/apisix/manager-api/internal/core/entity"
)

type PaginationTestCase struct {
	Info          string
	Pagination    *Pagination
	ExpectedOrder []int
}

type SortTestCase struct {
	Info          string
	Sort          *Sort
	ExpectedOrder []int
}

type FilterTestCase struct {
	Info          string
	Filter        *Filter
	ExpectedOrder []int
}

type TestRow struct {
	Name       string
	CreateTime int64
	Id         int
	Snis       []string
}

func (self TestRow) GetProperty(name entity.PropertyName) entity.ComparableValue {
	switch name {
	case entity.NameProperty:
		return entity.ComparingString(self.Name)
	case entity.SnisProperty:
		return entity.ComparingStringArray(self.Snis)
	case entity.CreateTimeProperty:
		return entity.ComparingInt(self.CreateTime)
	default:
		return nil
	}
}

func toRows(std []TestRow) []Row {
	rows := make([]Row, len(std))
	for i := range std {
		rows[i] = std[i]
	}
	return rows
}

func fromRows(rows []Row) []TestRow {
	std := make([]TestRow, len(rows))
	for i := range std {
		std[i] = rows[i].(TestRow)
	}
	return std
}

func getDataList() []Row {
	return toRows([]TestRow{
		{"b", 1, 1, []string{"a", "b"}},
		{"a", 2, 2, []string{"c", "d"}},
		{"a", 3, 3, []string{"f", "e"}},
		{"c", 4, 4, []string{"g", "h"}},
		{"c", 5, 5, []string{"k", "j"}},
		{"d", 6, 6, []string{"i", "h"}},
		{"e", 7, 7, []string{"t", "r"}},
		{"e", 8, 8, []string{"q", "w"}},
		{"f", 9, 9, []string{"x", "z"}},
		{"a", 10, 10, []string{"v", "n"}},
	})
}

func getOrder(dataList []TestRow) []int {
	ordered := []int{}
	for _, e := range dataList {
		ordered = append(ordered, e.Id)
	}
	return ordered
}

func TestSort(t *testing.T) {
	testCases := []SortTestCase{
		{
			"no sort - do not change the original order",
			NoSort,
			[]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10},
		},
		{
			"ascending sort by 1 property - all items sorted by this property",
			NewSort([]string{"a", "create_time"}),
			[]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10},
		},
		{
			"descending sort by 1 property - all items sorted by this property",
			NewSort([]string{"d", "create_time"}),
			[]int{10, 9, 8, 7, 6, 5, 4, 3, 2, 1},
		},
		{
			"sort by 2 properties - items should first be sorted by first property and later by second",
			NewSort([]string{"a", "name", "d", "create_time"}),
			[]int{10, 3, 2, 1, 5, 4, 6, 8, 7, 9},
		},
		{
			"empty sort list - no sort",
			NewSort([]string{}),
			[]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10},
		},
		{
			"nil - no sort",
			NewSort(nil),
			[]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10},
		},
		// Invalid arguments to the NewSortQuery
		{
			"sort by few properties where at least one property name is invalid - no sort",
			NewSort([]string{"a", "INVALID_PROPERTY", "d", "creationTimestamp"}),
			[]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10},
		},
		{
			"sort by few properties where at least one order option is invalid - no sort",
			NewSort([]string{"d", "name", "INVALID_ORDER", "creationTimestamp"}),
			[]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10},
		},
		{
			"sort by few properties where one order tag is missing property - no sort",
			NewSort([]string{""}),
			[]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10},
		},
		{
			"sort by few properties where one order tag is missing property - no sort",
			NewSort([]string{"d", "name", "a", "creationTimestamp", "a"}),
			[]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10},
		},
	}
	for _, testCase := range testCases {
		selector := Selector{
			List:  getDataList(),
			Query: &Query{Sort: testCase.Sort},
		}
		sortedData := fromRows(selector.Sort().List)
		order := getOrder(sortedData)
		if !reflect.DeepEqual(order, testCase.ExpectedOrder) {
			t.Errorf(`Sort: %s. Received invalid items for %+v. Got %v, expected %v.`,
				testCase.Info, testCase.Sort, order, testCase.ExpectedOrder)
		}
	}

}

func TestPagination(t *testing.T) {
	testCases := []PaginationTestCase{
		{
			"no pagination - all existing elements should be returned",
			NewPagination(0, 0),
			[]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10},
		},
		{
			"request one item from existing page - element should be returned",
			NewPagination(1, 5),
			[]int{6},
		},
		{
			"request one item from non existing page - no elements should be returned",
			NewPagination(1, 10),
			[]int{},
		},
		{
			"request 2 items from existing page - 2 elements should be returned",
			NewPagination(2, 1),
			[]int{3, 4},
		},
		{
			"request 3 items from partially existing page - last few existing should be returned",
			NewPagination(3, 3),
			[]int{10},
		},
		{
			"request more than total number of elements from page 1 - all existing elements should be returned",
			NewPagination(11, 0),
			[]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10},
		},
		{
			"request 3 items from non existing page - no elements should be returned",
			NewPagination(3, 4),
			[]int{},
		},
		{
			"Invalid pagination - all elements should be returned",
			NewPagination(-1, 4),
			[]int{},
		},
		{
			"Invalid pagination - all elements should be returned",
			NewPagination(1, -4),
			[]int{},
		},
	}
	for _, testCase := range testCases {
		selector := Selector{
			List:  getDataList(),
			Query: &Query{Pagination: testCase.Pagination},
		}
		paginatedData := fromRows(selector.Paginate().List)
		order := getOrder(paginatedData)
		if !reflect.DeepEqual(order, testCase.ExpectedOrder) {
			t.Errorf(`Pagination: %s. Received invalid items for %+v. Got %v, expected %v.`,
				testCase.Info, testCase.Pagination, order, testCase.ExpectedOrder)
		}
	}

}

func TestFilter(t *testing.T) {
	testCases := []FilterTestCase{
		{
			"no sort - do not change the original order",
			NewFilter(nil),
			[]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10},
		},
		{
			"string filter",
			NewFilter([]string{"name", "a"}),
			[]int{2, 3, 10},
		},
		{
			"string array filter",
			NewFilter([]string{"snis", "x"}),
			[]int{9},
		},
		{
			"multi filter",
			NewFilter([]string{"snis", "t", "name", "e"}),
			[]int{7},
		},
	}
	for _, testCase := range testCases {
		selector := Selector{
			List:  getDataList(),
			Query: &Query{Filter: testCase.Filter},
		}
		filteredData := fromRows(selector.Filter().List)
		order := getOrder(filteredData)
		if !reflect.DeepEqual(order, testCase.ExpectedOrder) {
			t.Errorf(`Filter: %s. Received invalid items for %+v. Got %v, expected %v.`,
				testCase.Info, testCase.Filter, order, testCase.ExpectedOrder)
		}
	}

}
