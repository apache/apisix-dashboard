package store

import "strings"

type PropertyName string

// List of all property names supported by the UI.
const (
  NameProperty              = "name"
  StatusProperty            = "status"
  TypeProperty              = "type"
)

type DataSelectQuery struct {
  SortQuery       *SortQuery
  FilterQuery     *FilterQuery
}


// SortQuery holds options for sort functionality of data select.
type SortQuery struct {
  SortByList []SortBy
}

// SortBy holds the name of the property that should be sorted and whether order should be ascending or descending.
type SortBy struct {
  Property  PropertyName
  Ascending bool
}

// NoSort is as option for no sort.
var NoSort = &SortQuery{
  SortByList: []SortBy{},
}

type FilterQuery struct {
  FilterByList []FilterBy
}

type FilterBy struct {
  Property PropertyName
  Value    ComparableValue
}

var NoFilter = &FilterQuery{
  FilterByList: []FilterBy{},
}

// DefaultDataSelect downloads first 10 items from page 1 with no sort and no metrics.
var DefaultDataSelect = NewDataSelectQuery(NoSort, NoFilter)

// NewDataSelectQuery creates DataSelectQuery object from simpler data select queries.
func NewDataSelectQuery( sortQuery *SortQuery, filterQuery *FilterQuery) *DataSelectQuery {
  return &DataSelectQuery{
    SortQuery:       sortQuery,
    FilterQuery:     filterQuery,
  }
}

// NewSortQuery takes raw sort options list and returns SortQuery object. For example:
// ["a", "parameter1", "d", "parameter2"] - means that the data should be sorted by
// parameter1 (ascending) and later - for results that return equal under parameter 1 sort - by parameter2 (descending)
func NewSortQuery(sortByListRaw []string) *SortQuery {
  if sortByListRaw == nil || len(sortByListRaw)%2 == 1 {
    // Empty sort list or invalid (odd) length
    return NoSort
  }
  sortByList := []SortBy{}
  for i := 0; i+1 < len(sortByListRaw); i += 2 {
    // parse order option
    var ascending bool
    orderOption := sortByListRaw[i]
    if orderOption == "a" {
      ascending = true
    } else if orderOption == "d" {
      ascending = false
    } else {
      //  Invalid order option. Only ascending (a), descending (d) options are supported
      return NoSort
    }

    // parse property name
    propertyName := sortByListRaw[i+1]
    sortBy := SortBy{
      Property:  PropertyName(propertyName),
      Ascending: ascending,
    }
    // Add to the sort options.
    sortByList = append(sortByList, sortBy)
  }
  return &SortQuery{
    SortByList: sortByList,
  }
}

// NewFilterQuery takes raw filter options list and returns FilterQuery object. For example:
// ["parameter1", "value1", "parameter2", "value2"] - means that the data should be filtered by
// parameter1 equals value1 and parameter2 equals value2
func NewFilterQuery(filterByListRaw []string) *FilterQuery {
  if filterByListRaw == nil || len(filterByListRaw)%2 == 1 {
    return NoFilter
  }
  filterByList := []FilterBy{}
  for i := 0; i+1 < len(filterByListRaw); i += 2 {
    propertyName := filterByListRaw[i]
    propertyValue := filterByListRaw[i+1]
    filterBy := FilterBy{
      Property: PropertyName(propertyName),
      Value:    ComparingString(propertyValue),
    }
    // Add to the filter options.
    filterByList = append(filterByList, filterBy)
  }
  return &FilterQuery{
    FilterByList: filterByList,
  }
}

type ComparingString string

func (self ComparingString) Compare(otherV ComparableValue) int {
  other := otherV.(ComparingString)
  return strings.Compare(string(self), string(other))
}

func (self ComparingString) Contains(otherV ComparableValue) bool {
  other := otherV.(ComparingString)
  return strings.Contains(string(self), string(other))
}
