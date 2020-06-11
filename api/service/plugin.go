package service

import (
	"encoding/json"
	"fmt"
	"github.com/apisix/manager-api/conf"
	"github.com/apisix/manager-api/utils"
)

type ApisixPluginRequest struct {
	Name string `json:"name"`
}

func (apr *ApisixPluginRequest) Schema() (map[string]interface{}, error) {
	url := fmt.Sprintf("%s/schema/plugins/%s", conf.BaseUrl, apr.Name)
	if resp, err := utils.Get(url); err != nil {
		logger.Error(err.Error())
		return nil, err
	} else {
		arresp := make(map[string]interface{})
		if err := json.Unmarshal(resp, &arresp); err != nil {
			logger.Error(err.Error())
			return nil, err
		} else {
			return arresp, nil
		}
	}
}

func (apr *ApisixPluginRequest) List() ([]string, error) {

	url := fmt.Sprintf("%s/plugins/list", conf.BaseUrl)
	if resp, err := utils.Get(url); err != nil {
		logger.Error(err.Error())
		return nil, err
	} else {
		var arresp []string
		if err := json.Unmarshal(resp, &arresp); err != nil {
			logger.Error(err.Error())
			return nil, err
		} else {
			return arresp, nil
		}
	}
}
