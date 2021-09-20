package entity

import (
	"testing"

	"github.com/blang/semver"
	"github.com/stretchr/testify/assert"
)

func TestRouteFilter(t *testing.T) {
	route := Route{
		BaseInfo: BaseInfo{
			ID: 1,
		},
		URI:            "/test",
		Uris:           nil,
		Name:           "test_route",
		Desc:           "test_route_desc",
		Priority:       0,
		Methods:        []string{"GET", "POST", "PUT"},
		Host:           "example.com",
		Hosts:          nil,
		RemoteAddr:     "",
		RemoteAddrs:    nil,
		Vars:           nil,
		FilterFunc:     "",
		Script:         nil,
		ScriptID:       nil,
		Plugins:        nil,
		PluginConfigID: nil,
		Upstream: &UpstreamDef{
			Nodes: []map[string]interface{}{
				{
					"host":   "1.1.1.1",
					"port":   "1111",
					"weight": 1,
				},
			},
			Retries: 5,
			Timeout: &Timeout{
				Connect: 6,
				Send:    6,
				Read:    6,
			},
			Type:   "roundrobin",
			Checks: nil,
			Scheme: "HTTP",
			KeepalivePool: &UpstreamKeepalivePool{
				IdleTimeout: 60,
				Requests:    1000,
				Size:        320,
			},
		},
		ServiceID:       nil,
		UpstreamID:      nil,
		ServiceProtocol: "",
		Labels: map[string]string{
			"test": "test",
		},
		EnableWebsocket: true,
		Status:          1,
	}
	route.BaseInfo.Creating()

	targetVersion = semver.MustParse("2.4.0")
	filtered, _ := CompatibilityFilter(&route)
	filteredRoute1 := filtered.(*Route)

	assert.Equal(t, (*UpstreamKeepalivePool)(nil), filteredRoute1.Upstream.KeepalivePool)
}
