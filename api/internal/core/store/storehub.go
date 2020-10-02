package store

import (
	"fmt"
	"github.com/apisix/manager-api/internal/utils"
)

type HubKey string

const (
	HubKeyConsumer HubKey = "consumer"
	HubKeyRoute    HubKey = "route"
	HubKeyService  HubKey = "service"
	HubKeySsl      HubKey = "ssl"
	HubKeyUpstream HubKey = "upstream"
)

var (
	storeHub = map[HubKey]*GenericStore{}
)

func InitStore(key HubKey, opt GenericStoreOption) error {
	s, err := NewGenericStore(opt)
	if err != nil {
		return err
	}
	if err := s.Init(); err != nil {
		return err
	}

	utils.AppendToClosers(s.Close)
	storeHub[key] = s
	return nil
}

func GetStore(key HubKey) *GenericStore {
	if s, ok := storeHub[key]; ok {
		return s
	}
	panic(fmt.Sprintf("no store with key: %s", key))
}
