package data_loader_test

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/ginkgo/extensions/table"
	. "github.com/onsi/gomega"
)

var _ = Describe("Postman Collection v2.1", func() {
	DescribeTable("Import cases",
		func(f func()) {
			f()
		},
		Entry("Postman-API101.yaml", func() {
		}),
	)
})

