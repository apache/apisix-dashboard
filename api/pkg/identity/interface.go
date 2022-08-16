package identity

type Identifier interface {
	Check(userId, method, path string) error
}

type ReplaceIdentifier struct {
	self *Identifier
}

var DashBoardIdentifier = initIdentifier()

func initIdentifier() *ReplaceIdentifier {
	var dr = &ReplaceIdentifier{}
	dr.ReplaceIdentifier(defaultIdentifier{})
	return dr
}

func (r *ReplaceIdentifier) ReplaceIdentifier(i Identifier) {
	r.self = &i
}

func (r ReplaceIdentifier) GetIdentifier() Identifier {
	return *r.self
}
