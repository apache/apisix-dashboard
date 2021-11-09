package global_rule_test

import (
	"testing"
	"time"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"github.com/apisix/manager-api/test/e2enew/base"
)

func TestGlobalRule(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Global Rule Suite")
}

var _ = AfterSuite(func() {
	base.CleanResource("routes")
	base.CleanResource("global_rules")
	time.Sleep(base.SleepTime)
})
