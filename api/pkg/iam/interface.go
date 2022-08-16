package iam

// Access interface defines the pattern of functions required for access control in the IAM
type Access interface {
	Check(identity, resource, action string) error
}
