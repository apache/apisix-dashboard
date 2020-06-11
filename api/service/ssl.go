/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package service

import (
	"crypto/tls"
	"crypto/x509"
	"encoding/json"
	"encoding/pem"
	"errors"
	"fmt"

	"github.com/satori/go.uuid"

	"github.com/apisix/manager-api/conf"
	"github.com/apisix/manager-api/errno"
	"github.com/apisix/manager-api/utils"
)

type Ssl struct {
	Base
	ValidityStart uint64 `json:"validity_start"`
	ValidityEnd   uint64 `json:"validity_end"`
	Snis          string `json:"snis"`
	Status        uint64 `json:"status"`
	PublicKey     string `json:"public_key,omitempty"`
}

type SslDto struct {
	Base
	ValidityStart uint64   `json:"validity_start"`
	ValidityEnd   uint64   `json:"validity_end"`
	Snis          []string `json:"snis"`
	Status        uint64   `json:"status"`
	PublicKey     string   `json:"public_key,omitempty"`
}

type SslRequest struct {
	ID         string   `json:"id,omitempty"`
	PublicKey  string   `json:"cert"`
	PrivateKey string   `json:"key"`
	Snis       []string `json:"snis"`
}

// ApisixSslResponse is response from apisix admin api
type ApisixSslResponse struct {
	Action string   `json:"action"`
	Node   *SslNode `json:"node"`
}

type SslNode struct {
	Value         SslRequest `json:"value"`
	ModifiedIndex uint64     `json:"modifiedIndex"`
}

func (req *SslRequest) Parse(body interface{}) {
	if err := json.Unmarshal(body.([]byte), req); err != nil {
		req = nil
		logger.Error(errno.FromMessage(errno.RouteRequestError, err.Error()).Msg)
	}
}

func (sslDto *SslDto) Parse(ssl *Ssl) error {
	sslDto.ID = ssl.ID
	sslDto.ValidityStart = ssl.ValidityStart
	sslDto.ValidityEnd = ssl.ValidityEnd

	var snis []string
	_ = json.Unmarshal([]byte(ssl.Snis), &snis)
	sslDto.Snis = snis

	sslDto.Status = ssl.Status
	sslDto.PublicKey = ssl.PublicKey
	sslDto.CreateTime = ssl.CreateTime
	sslDto.UpdateTime = ssl.UpdateTime

	return nil
}

func SslList(page, size int) ([]byte, error) {
	var count int
	sslList := []Ssl{}
	if err := conf.DB().Table("ssls").Offset((page - 1) * size).Limit(size).Find(&sslList).Count(&count).Error; err != nil {
		return nil, err
	}

	sslDtoList := []SslDto{}

	for _, ssl := range sslList {
		sslDto := SslDto{}
		sslDto.Parse(&ssl)

		sslDtoList = append(sslDtoList, sslDto)
	}

	data := errno.FromMessage(errno.SystemSuccess).ListResponse(count, sslDtoList)

	return json.Marshal(data)
}

func SslItem(id string) ([]byte, error) {
	ssl := &Ssl{}
	if err := conf.DB().Table("ssls").Where("id = ?", id).First(ssl).Error; err != nil {
		return nil, err
	}

	sslDto := &SslDto{}
	sslDto.Parse(ssl)

	data := errno.FromMessage(errno.SystemSuccess).ItemResponse(sslDto)

	return json.Marshal(data)
}

func SslCheck(param interface{}) ([]byte, error) {
	sslReq := &SslRequest{}
	sslReq.Parse(param)

	ssl, err := ParseCert(sslReq.PublicKey, sslReq.PrivateKey)

	if err != nil {
		return nil, err
	}

	ssl.PublicKey = ""

	sslDto := &SslDto{}
	sslDto.Parse(ssl)

	data := errno.FromMessage(errno.SystemSuccess).ItemResponse(sslDto)

	return json.Marshal(data)
}

func SslCreate(param interface{}, id string) error {
	sslReq := &SslRequest{}
	sslReq.Parse(param)

	ssl, err := ParseCert(sslReq.PublicKey, sslReq.PrivateKey)

	if err != nil {
		return err
	}

	// first admin api
	var snis []string
	_ = json.Unmarshal([]byte(ssl.Snis), &snis)
	sslReq.Snis = snis

	if _, err := sslReq.PutToApisix(id); err != nil {
		return err
	}
	// then mysql
	ssl.ID = uuid.FromStringOrNil(id)
	if err := conf.DB().Create(ssl).Error; err != nil {
		return err
	}

	return nil
}

func SslUpdate(param interface{}, id string) error {
	sslReq := &SslRequest{}
	sslReq.Parse(param)

	ssl, err := ParseCert(sslReq.PublicKey, sslReq.PrivateKey)

	if err != nil {
		return err
	}

	// first admin api
	var snis []string
	_ = json.Unmarshal([]byte(ssl.Snis), &snis)
	sslReq.Snis = snis

	if _, err := sslReq.PutToApisix(id); err != nil {
		return err
	}

	// then mysql
	ssl.ID = uuid.FromStringOrNil(id)
	data := Ssl{PublicKey: ssl.PublicKey, Snis: ssl.Snis, ValidityStart: ssl.ValidityStart, ValidityEnd: ssl.ValidityEnd}
	if err := conf.DB().Model(&ssl).Updates(data).Error; err != nil {
		return err
	}

	return nil
}

func SslDelete(id string) error {
	// delete from apisix
	request := &SslRequest{}
	request.ID = id
	if _, err := request.DeleteFromApisix(); err != nil {
		return err
	}
	// delete from mysql
	ssl := &Ssl{}
	ssl.ID = uuid.FromStringOrNil(id)
	if err := conf.DB().Delete(ssl).Error; err != nil {
		return err
	}

	return nil
}

func (req *SslRequest) PutToApisix(rid string) (*ApisixSslResponse, error) {
	url := fmt.Sprintf("%s/ssl/%s", conf.BaseUrl, rid)
	if data, err := json.Marshal(req); err != nil {
		return nil, err
	} else {
		if resp, err := utils.Put(url, data); err != nil {
			logger.Error(url)
			logger.Error(string(data))
			logger.Error(err.Error())
			return nil, err
		} else {
			var arresp ApisixSslResponse
			if err := json.Unmarshal(resp, &arresp); err != nil {
				logger.Error(err.Error())
				return nil, err
			} else {
				return &arresp, nil
			}
		}
	}
}

func (req *SslRequest) DeleteFromApisix() (*ApisixSslResponse, error) {
	id := req.ID
	url := fmt.Sprintf("%s/ssl/%s", conf.BaseUrl, id)

	if resp, err := utils.Delete(url); err != nil {
		logger.Error(err.Error())
		return nil, err
	} else {
		var arresp ApisixSslResponse
		if err := json.Unmarshal(resp, &arresp); err != nil {
			logger.Error(err.Error())
			return nil, err
		} else {
			return &arresp, nil
		}
	}
}

func ParseCert(crt, key string) (*Ssl, error) {
	// print private key
	certDERBlock, _ := pem.Decode([]byte(crt))
	if certDERBlock == nil {
		return nil, errors.New("Certificate resolution failed")
	}
	// match
	_, err := tls.X509KeyPair([]byte(crt), []byte(key))
	if err != nil {
		return nil, err
	}

	x509Cert, err := x509.ParseCertificate(certDERBlock.Bytes)

	if err != nil {
		return nil, errors.New("Certificate resolution failed")
	} else {
		ssl := Ssl{}

		//domain
		snis := []byte{}
		if x509Cert.DNSNames == nil || len(x509Cert.DNSNames) < 1 {
			tmp := []string{}
			if x509Cert.Subject.CommonName != "" {
				tmp = []string{x509Cert.Subject.CommonName}
			}
			snis, _ = json.Marshal(tmp)
		} else {
			snis, _ = json.Marshal(x509Cert.DNSNames)
		}
		ssl.Snis = string(snis)

		ssl.ValidityStart = uint64(x509Cert.NotBefore.Unix())
		ssl.ValidityEnd = uint64(x509Cert.NotAfter.Unix())
		ssl.PublicKey = crt

		return &ssl, nil
	}
}
