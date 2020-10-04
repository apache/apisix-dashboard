package entity

import "strings"

type PropertyName string

const (
	NameProperty = "name"
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

func (p Route) GetProperty(name PropertyName) ComparableValue {
	switch name {
	case NameProperty:
		return ComparingString(p.Name)
	default:
		return nil
	}
}

func (p Upstream) GetProperty(name PropertyName) ComparableValue {
	switch name {
	case NameProperty:
		return ComparingString(p.Name)
	default:
		return nil
	}
}
