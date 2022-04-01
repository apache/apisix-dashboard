package id_compatible_test

import (
	"testing"
	"time"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"github.com/apisix/manager-api/test/e2enew/base"
)

func TestIdCompatible(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Id Compatible Suite")
}

var _ = AfterSuite(func() {
	base.CleanResource("routes")
	time.Sleep(base.SleepTime)
})
