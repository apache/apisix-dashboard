package store

import (
	"github.com/apisix/manager-api/internal/core/entity"
)

type Query struct {
	Sort       *Sort
	Filter     *Filter
	Pagination *Pagination
}

type Sort struct {
	SortByList []SortBy
}

type SortBy struct {
	Property  entity.PropertyName
	Ascending bool
}

var NoSort = &Sort{
	SortByList: []SortBy{},
}

type Filter struct {
	FilterByList []FilterBy
}

type FilterBy struct {
	Property entity.PropertyName
	Value    entity.ComparableValue
}

var NoFilter = &Filter{
	FilterByList: []FilterBy{},
}

type Pagination struct {
	PageSize   int
	PageNumber int
}

func NewPagination(PageSize, pageNumber int) *Pagination {
	return &Pagination{PageSize, pageNumber}
}

func (p *Pagination) IsValid() bool {
	return p.PageSize >= 0 && p.PageNumber >= 0
}

func (p *Pagination) IsAvailable(itemsCount, startingIndex int) bool {
	return itemsCount > startingIndex && p.PageSize > 0
}

func (p *Pagination) Index(itemsCount int) (startIndex int, endIndex int) {
	startIndex = p.PageSize * p.PageNumber
	endIndex = startIndex + p.PageSize

	if endIndex > itemsCount {
		endIndex = itemsCount
	}

	return startIndex, endIndex
}

func NewQuery(sort *Sort, filter *Filter, pagination *Pagination) *Query {
	return &Query{
		Sort:       sort,
		Filter:     filter,
		Pagination: pagination,
	}
}

func NewSort(sortByListRaw []string) *Sort {
	if sortByListRaw == nil || len(sortByListRaw)%2 == 1 {
		// Empty sort list or invalid (odd) length
		return NoSort
	}
	sortByList := []SortBy{}
	for i := 0; i+1 < len(sortByListRaw); i += 2 {
		var ascending bool
		orderOption := sortByListRaw[i]
		if orderOption == "a" {
			ascending = true
		} else if orderOption == "d" {
			ascending = false
		} else {
			return NoSort
		}

		propertyName := sortByListRaw[i+1]
		sortBy := SortBy{
			Property:  entity.PropertyName(propertyName),
			Ascending: ascending,
		}
		sortByList = append(sortByList, sortBy)
	}
	return &Sort{
		SortByList: sortByList,
	}
}

func NewFilter(filterByListRaw []string) *Filter {
	if filterByListRaw == nil || len(filterByListRaw)%2 == 1 {
		return NoFilter
	}
	filterByList := []FilterBy{}
	for i := 0; i+1 < len(filterByListRaw); i += 2 {
		propertyName := filterByListRaw[i]
		propertyValue := filterByListRaw[i+1]
		filterBy := FilterBy{
			Property: entity.PropertyName(propertyName),
			Value:    entity.ComparingString(propertyValue),
		}
		filterByList = append(filterByList, filterBy)
	}
	return &Filter{
		FilterByList: filterByList,
	}
}
