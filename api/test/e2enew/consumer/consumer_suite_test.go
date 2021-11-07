package consumer_test

import (
	"testing"
	"time"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"github.com/apisix/manager-api/test/e2enew/base"
)

func TestConsumer(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Consumer Suite")
}

var _ = AfterSuite(func() {
	base.CleanResource("routes")
	base.CleanResource("consumers")
	time.Sleep(base.SleepTime)
})
