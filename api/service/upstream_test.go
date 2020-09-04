package service

import (
	"testing"

	uuid "github.com/satori/go.uuid"
	"github.com/stretchr/testify/assert"
)

// parse from params to RouteRequest must be error
func TestUpstreamRequest_Parse(t *testing.T) {
	a := assert.New(t)
	param := []byte(`{
		"name": "upstream-test",
		"description": "test upstream",
		"type": "roundrobin",
		"nodes": {
			"127.0.0.1:8080":100,
			"127.0.0.1:8081":200
		},
		"timeout":{
			"connect":15,
			"send":15,
			"read":15
		},
		"enable_websocket": true,
		"hash_on": "header",
		"key": "server_addr",
		"checks": {
			"active": {
				"timeout": 5,
				"http_path": "/status",
				"host": "foo.com",
				"healthy": {
					"interval": 2,
					"successes": 1
				},
				"unhealthy": {
					"interval": 1,
					"http_failures": 2
				},
				"req_headers": ["User-Agent: curl/7.29.0"]
			},
			"passive": {
				"healthy": {
					"http_statuses": [200, 201],
					"successes": 3
				},
				"unhealthy": {
					"http_statuses": [500],
					"http_failures": 3,
					"tcp_failures": 3
				}
			}
		}	
	}`)

	ur := &UpstreamRequest{}
	err := ur.Parse(param)
	a.Nil(err)
	a.Equal("header", ur.HashOn)
	a.Equal("server_addr", ur.Key)

	u4 := uuid.NewV4()
	uuid := u4.String()
	ur.Id = uuid

	aur, err := ur.Parse2Apisix()
	a.Nil(err)

	res := aur.toJson()
	a.NotNil(res)

	//create a upstream
	apisixResp, err := aur.Create()
	a.Nil(err)
	rur, err := apisixResp.Parse2Request()
	a.Nil(err)
	a.Equal(ur.Key, rur.Key)

	aur.Id = rur.Id
	//get the upstream just created
	created, err := aur.FindById()
	a.Nil(err)
	createdFormat, err := created.Parse2Request()
	a.Nil(err)
	a.Equal(createdFormat.HashOn, rur.HashOn)

	//delete test data
	_, err = aur.Delete()
	a.Nil(err)
}
