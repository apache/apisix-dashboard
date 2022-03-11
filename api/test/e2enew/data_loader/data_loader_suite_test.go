package data_loader_test

import (
	"testing"
	"time"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"github.com/apisix/manager-api/test/e2enew/base"
)

func TestDataLoader(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Data Loader Suite")
}

var _ = AfterSuite(func() {
	base.CleanResource("routes")
	base.CleanResource("upstreams")
	time.Sleep(base.SleepTime)
})
