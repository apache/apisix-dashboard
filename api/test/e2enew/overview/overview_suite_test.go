package overview_test

import (
	"testing"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

func TestOverview(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Overview Suite")
}
