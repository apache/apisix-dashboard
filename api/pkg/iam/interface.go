package iam

type Identifier interface {
	Check(userId, resource, action string) error
}

type ReplaceIdentifier struct {
	self *Identifier
}

func (dr *ReplaceIdentifier) ReplaceIdentifier(i Identifier) {
	dr.self = &i
}

func (dr ReplaceIdentifier) GetIdentifier() Identifier {
	return *dr.self
}
