package cache_verify

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/apisix/manager-api/internal/core/storage"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/apisix/manager-api/internal/handler"
	"github.com/gin-gonic/gin"
	"github.com/shiningrush/droplet"
	wgin "github.com/shiningrush/droplet/wrapper/gin"
	"reflect"
)

// we read from cache and etcd,then compare them

type Handler struct {
}

type compareResult struct {
	K          string `json:"key"`
	CacheValue string `json:"cache_value"`
	EtcdValue  string `json:"etcd_value"`
}

type resultOuput struct {
	Consumers     []compareResult `json:"inconsistent_consumers"`
	Routes        []compareResult `json:"inconsistent_routes"`
	Services      []compareResult `json:"inconsistent_services"`
	SSLs          []compareResult `json:"inconsistent_ssls"`
	Upstreams     []compareResult `json:"inconsistent_upstreams"`
	Scripts       []compareResult `json:"inconsistent_scripts"`
	GlobalPlugins []compareResult `json:"inconsistent_global_plugins"`
	PluginConfigs []compareResult `json:"inconsistent_plugin_configs"`
	ServerInfos   []compareResult `json:"inconsistent_server_infos"`
}

var infixMap = map[store.HubKey]string{
	store.HubKeyConsumer:     "consumers",
	store.HubKeyRoute:        "routes",
	store.HubKeyService:      "services",
	store.HubKeySsl:          "ssl",
	store.HubKeyUpstream:     "upstreams",
	store.HubKeyScript:       "scripts",
	store.HubKeyGlobalRule:   "global_rules",
	store.HubKeyServerInfo:   "data_plane/server_info",
	store.HubKeyPluginConfig: "plugin_configs",
}

func NewHandler() (handler.RouteRegister, error) {
	return &Handler{}, nil
}

func (h *Handler) ApplyRoute(r *gin.Engine) {
	r.GET("/apisix/admin/cache_verify", wgin.Wraps(h.CacheVerify))
}

func (h *Handler) CacheVerify(_ droplet.Context) (interface{}, error) {

	var rs resultOuput
	store.RangeStore(func(key store.HubKey, s *store.GenericStore) bool {
		s.Range(context.TODO(), func(k string, obj interface{}) bool {
			cmp, cacheValue, etcdValue := compare(k, infixMap[key], obj)
			if !cmp {
				if key == store.HubKeyConsumer {
					rs.Consumers = append(rs.Consumers, compareResult{EtcdValue: etcdValue, CacheValue: cacheValue, K: k})
				}
				if key == store.HubKeyRoute {
					rs.Routes = append(rs.Routes, compareResult{EtcdValue: etcdValue, CacheValue: cacheValue, K: k})
				}
				if key == store.HubKeyScript {
					rs.Scripts = append(rs.Scripts, compareResult{EtcdValue: etcdValue, CacheValue: cacheValue, K: k})
				}
				if key == store.HubKeyService {
					rs.Services = append(rs.Services, compareResult{EtcdValue: etcdValue, CacheValue: cacheValue, K: k})
				}
				if key == store.HubKeyGlobalRule {
					rs.GlobalPlugins = append(rs.GlobalPlugins, compareResult{EtcdValue: etcdValue, CacheValue: cacheValue, K: k})
				}
				if key == store.HubKeyPluginConfig {
					rs.PluginConfigs = append(rs.PluginConfigs, compareResult{EtcdValue: etcdValue, CacheValue: cacheValue, K: k})
				}
				if key == store.HubKeyUpstream {
					rs.Upstreams = append(rs.Upstreams, compareResult{EtcdValue: etcdValue, CacheValue: cacheValue, K: k})
				}
				if key == store.HubKeySsl {
					rs.SSLs = append(rs.SSLs, compareResult{EtcdValue: etcdValue, CacheValue: cacheValue, K: k})
				}
				if key == store.HubKeyServerInfo {
					rs.ServerInfos = append(rs.ServerInfos, compareResult{EtcdValue: etcdValue, CacheValue: cacheValue, K: k})
				}

			}
			return true
		})
		return true
	})
	return rs, nil
}

func compare(k, infix string, v interface{}) (bool, string, string) {
	s, err := json.Marshal(v)
	if err != nil {
		fmt.Printf("json marsharl failed : %v\n", err)
		return false, "", ""
	}
	cacheValue := string(s)
	key := fmt.Sprintf("/apisix/%s/%s", infix, k)
	val, err := storage.GenEtcdStorage().Get(context.TODO(), key)
	if err != nil {
		fmt.Printf("etcd get failed %v \n", err)
		return false, "", ""
	}
	etcdValue := val

	cmp, err := areEqualJSON(cacheValue, etcdValue)
	if err != nil {
		fmt.Printf("compare json failed %v\n", err)
	}
	return cmp, cacheValue, etcdValue
}

func areEqualJSON(s1, s2 string) (bool, error) {
	var o1 interface{}
	var o2 interface{}

	var err error
	err = json.Unmarshal([]byte(s1), &o1)
	if err != nil {
		return false, fmt.Errorf("error mashalling string 1 :: %s", err.Error())
	}
	err = json.Unmarshal([]byte(s2), &o2)
	if err != nil {
		return false, fmt.Errorf("error mashalling string 2 :: %s", err.Error())
	}

	return reflect.DeepEqual(o1, o2), nil
}
