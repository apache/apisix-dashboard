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
	for _, sortBy := range self.Query.Sort.SortByList {
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
		for _, filterBy := range self.Query.Filter.FilterByList {
			v := c.GetProperty(filterBy.Property)
			if v == nil || !v.Contains(filterBy.Value) {
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

//func NewSelector(dataList []Row, dsQuery *Query) []Row {
//	SelectableData := Selector{
//		List:  dataList,
//		Query: dsQuery,
//	}
//	return SelectableData.Sort().Paginate().List
//}

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
