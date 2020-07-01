package service

import (
	"encoding/json"
	"fmt"
	"github.com/apisix/manager-api/conf"
	"github.com/apisix/manager-api/errno"
	"github.com/apisix/manager-api/utils"
	"github.com/satori/go.uuid"
)

type UpstreamDao struct {
	Base
	Name            string `json:"name"`
	Description     string `json:"description,omitempty"`
	Nodes           string `json:"nodes"`
	Content         string `json:"content"`
	ContentAdminApi string `json:"content_admin_api"`
}

func (UpstreamDao) TableName() string {
	return "upstreams"
}

type ApisixUpstreamRequest struct {
	Id          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"desc"`
	Upstream
}

func (u *ApisixUpstreamRequest) toJson() []byte {
	res, _ := json.Marshal(&u)
	return res
}

type UpstreamRequest struct {
	Id          string `json:"id,omitempty"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Upstream
}

func (u *UpstreamRequest) toJson() []byte {
	res, _ := json.Marshal(&u)
	return res
}

func (r *UpstreamRequest) Parse(body interface{}) error {
	if err := json.Unmarshal(body.([]byte), r); err != nil {
		r = nil
		return err
	}
	return nil
}

func (r *UpstreamRequest) Parse2Apisix() (*ApisixUpstreamRequest, error) {
	aur := &ApisixUpstreamRequest{
		Id:          r.Id,
		Name:        r.Name,
		Description: r.Description,
		Upstream:    r.Upstream,
	}
	return aur, nil
}

type UpstreamResponse struct {
	Base
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
	Upstream
}

func (u *UpstreamDao) Parse2Response() (*UpstreamResponse, error) {
	// upstream
	aur := &ApisixUpstreamResponse{}
	if err := json.Unmarshal([]byte(u.ContentAdminApi), &aur); err != nil {
		return nil, err
	} else {
		v := aur.UNode.UValue
		result := &UpstreamResponse{
			Name:        v.Name,
			Description: v.Description,
		}
		result.Base = u.Base
		result.Upstream = Upstream{
			UType:           v.UType,
			Timeout:         v.Timeout,
			Nodes:           v.Nodes,
			EnableWebsocket: v.EnableWebsocket,
		}
		return result, nil
	}
}

type ApisixUpstreamResponse struct {
	Action string `json:"action"`
	UNode  *UNode `json:"node"`
}

type UNode struct {
	UValue        UValue `json:"value"`
	ModifiedIndex uint64 `json:"modifiedIndex"`
}

type UValue struct {
	Id          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"desc,omitempty"`
	Upstream
}

func (u *UValue) toJson() []byte {
	res, _ := json.Marshal(&u)
	return res
}

func (aur *ApisixUpstreamResponse) Parse2Request() (*UpstreamRequest, error) {
	v := aur.UNode.UValue
	result := &UpstreamRequest{
		Id:          v.Id,
		Name:        v.Name,
		Description: v.Description,
		Upstream:    v.Upstream,
	}
	return result, nil
}

func Trans2UpstreamDao(resp *ApisixUpstreamResponse, r *UpstreamRequest) (*UpstreamDao, *errno.ManagerError) {
	ips := make([]string, 0)
	nodes := r.Nodes
	for k, _ := range nodes {
		ips = append(ips, k)
	}
	if nb, err := json.Marshal(ips); err != nil {
		e := errno.FromMessage(errno.DBUpstreamError, err.Error())
		logger.Warn(e.Msg)
		return nil, e
	} else {
		u := &UpstreamDao{
			Name:        r.Name,
			Description: r.Description,
			Nodes:       string(nb),
		}
		// id
		u.ID = uuid.FromStringOrNil(r.Id)
		// content
		if content, err := json.Marshal(r); err != nil {
			e := errno.FromMessage(errno.DBUpstreamError, err.Error())
			return nil, e
		} else {
			u.Content = string(content)
		}
		// content_admin_api
		if respStr, err := json.Marshal(resp); err != nil {
			e := errno.FromMessage(errno.DBUpstreamError, err.Error())
			return nil, e
		} else {
			u.ContentAdminApi = string(respStr)
		}
		return u, nil
	}
}

func (aur *ApisixUpstreamRequest) Create() (*ApisixUpstreamResponse, error) {
	url := fmt.Sprintf("%s/upstreams/%s", conf.BaseUrl, aur.Id)
	if b, err := json.Marshal(aur); err != nil {
		return nil, err
	} else {
		fmt.Println(string(b))
		if resp, err := utils.Put(url, b); err != nil {
			logger.Error(err.Error())
			return nil, err
		} else {
			var arresp ApisixUpstreamResponse
			if err := json.Unmarshal(resp, &arresp); err != nil {
				logger.Error(err.Error())
				return nil, err
			} else {
				return &arresp, nil
			}
		}
	}
}

func (aur *ApisixUpstreamRequest) Update() (*ApisixUpstreamResponse, error) {
	url := fmt.Sprintf("%s/upstreams/%s", conf.BaseUrl, aur.Id)
	if b, err := json.Marshal(aur); err != nil {
		return nil, err
	} else {
		fmt.Println(string(b))
		if resp, err := utils.Put(url, b); err != nil {
			logger.Error(err.Error())
			return nil, err
		} else {
			var arresp ApisixUpstreamResponse
			if err := json.Unmarshal(resp, &arresp); err != nil {
				logger.Error(err.Error())
				return nil, err
			} else {
				return &arresp, nil
			}
		}
	}
}

func (arr *ApisixUpstreamRequest) FindById() (*ApisixUpstreamResponse, error) {
	url := fmt.Sprintf("%s/upstreams/%s", conf.BaseUrl, arr.Id)
	if resp, err := utils.Get(url); err != nil {
		logger.Error(err.Error())
		return nil, err
	} else {
		var arresp ApisixUpstreamResponse
		if err := json.Unmarshal(resp, &arresp); err != nil {
			logger.Error(err.Error())
			return nil, err
		} else {
			return &arresp, nil
		}
	}
}

func (arr *ApisixUpstreamRequest) Delete() (*ApisixUpstreamResponse, error) {
	url := fmt.Sprintf("%s/upstreams/%s", conf.BaseUrl, arr.Id)
	if resp, err := utils.Delete(url); err != nil {
		logger.Error(err.Error())
		return nil, err
	} else {
		var arresp ApisixUpstreamResponse
		if err := json.Unmarshal(resp, &arresp); err != nil {
			logger.Error(err.Error())
			return nil, err
		} else {
			return &arresp, nil
		}
	}
}
