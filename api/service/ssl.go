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

	"github.com/apisix/manager-api/conf"
	"github.com/apisix/manager-api/errno"
	"github.com/apisix/manager-api/utils"
	uuid "github.com/satori/go.uuid"
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
	PublicKey  string   `json:"cert,omitempty"`
	PrivateKey string   `json:"key,omitempty"`
	Snis       []string `json:"snis,omitempty"`
	Status     uint64   `json:"status,omitempty"`
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

func SslList(page, size, status, expireStart, expireEnd int, sni string) (int, []SslDto, error) {
	var count int
	sslList := []Ssl{}
	db := conf.DB().Table("ssls")

	if sni != "" {
		db = db.Where("snis like ? ", "%"+sni+"%")
	}
	if status > -1 {
		db = db.Where("status = ? ", status)
	}
	if expireStart > 0 {
		db = db.Where("validity_end >= ? ", expireStart)
	}
	if expireEnd > 0 {
		db = db.Where("validity_end <= ? ", expireEnd)
	}

	if err := db.Order("validity_end desc").Offset((page - 1) * size).Limit(size).Find(&sslList).Error; err != nil {
		e := errno.New(errno.DBReadError, err.Error())
		return 0, nil, e
	}
	if err := db.Count(&count).Error; err != nil {
		e := errno.New(errno.DBReadError, err.Error())
		return 0, nil, e
	}

	sslDtoList := []SslDto{}

	for _, ssl := range sslList {
		sslDto := SslDto{}
		sslDto.Parse(&ssl)

		sslDtoList = append(sslDtoList, sslDto)
	}

	return count, sslDtoList, nil
}

func SslItem(id string) (*SslDto, error) {
	ssl := &Ssl{}
	if err := conf.DB().Table("ssls").Where("id = ?", id).First(ssl).Error; err != nil {
		e := errno.New(errno.DBReadError, err.Error())
		return nil, e
	}

	sslDto := &SslDto{}
	sslDto.Parse(ssl)

	return sslDto, nil
}

func SslCheck(param interface{}) (*SslDto, error) {
	sslReq := &SslRequest{}
	sslReq.Parse(param)

	ssl, err := ParseCert(sslReq.PublicKey, sslReq.PrivateKey)

	if err != nil {
		e := errno.FromMessage(errno.SslParseError, err.Error())
		return nil, e
	}

	ssl.PublicKey = ""

	sslDto := &SslDto{}
	sslDto.Parse(ssl)

	return sslDto, nil
}

func SslCreate(param interface{}, id string) error {
	sslReq := &SslRequest{}
	sslReq.Parse(param)

	ssl, err := ParseCert(sslReq.PublicKey, sslReq.PrivateKey)

	if err != nil {
		e := errno.FromMessage(errno.SslParseError, err.Error())
		return e
	}

	// first admin api
	var snis []string
	_ = json.Unmarshal([]byte(ssl.Snis), &snis)
	sslReq.Snis = snis

	if _, err := sslReq.PutToApisix(id); err != nil {
		if _, ok := err.(*errno.HttpError); ok {
			return err
		}
		e := errno.New(errno.ApisixSslCreateError, err.Error())
		return e
	}
	// then mysql
	ssl.ID = uuid.FromStringOrNil(id)
	ssl.Status = 1

	if err := conf.DB().Create(ssl).Error; err != nil {
		return errno.New(errno.DBWriteError, err.Error())
	}

	return nil
}

func SslUpdate(param interface{}, id string) error {
	sslReq := &SslRequest{}
	sslReq.Parse(param)

	ssl, err := ParseCert(sslReq.PublicKey, sslReq.PrivateKey)

	if err != nil {
		e := errno.FromMessage(errno.SslParseError, err.Error())
		return e
	}

	// first admin api
	var snis []string
	_ = json.Unmarshal([]byte(ssl.Snis), &snis)
	sslReq.Snis = snis

	if _, err := sslReq.PutToApisix(id); err != nil {
		if _, ok := err.(*errno.HttpError); ok {
			return err
		}
		e := errno.New(errno.ApisixSslUpdateError, err.Error())
		return e
	}

	// then mysql
	ssl.ID = uuid.FromStringOrNil(id)
	data := Ssl{PublicKey: ssl.PublicKey, Snis: ssl.Snis, ValidityStart: ssl.ValidityStart, ValidityEnd: ssl.ValidityEnd}
	if err := conf.DB().Model(&ssl).Updates(data).Error; err != nil {
		return errno.New(errno.DBWriteError, err.Error())
	}

	return nil
}

func SslPatch(param interface{}, id string) error {
	sslReq := &SslRequest{}
	sslReq.Parse(param)

	if _, err := sslReq.PatchToApisix(id); err != nil {
		if _, ok := err.(*errno.HttpError); ok {
			return err
		}
		e := errno.New(errno.ApisixSslUpdateError, err.Error())
		return e
	}

	ssl := Ssl{}
	ssl.ID = uuid.FromStringOrNil(id)
	if err := conf.DB().Model(&ssl).Update("status", sslReq.Status).Error; err != nil {
		return errno.New(errno.DBWriteError, err.Error())
	}

	return nil
}

func SslDelete(id string) error {
	// delete from apisix
	request := &SslRequest{}
	request.ID = id
	if _, err := request.DeleteFromApisix(); err != nil {
		if _, ok := err.(*errno.HttpError); ok {
			return err
		}
		e := errno.New(errno.ApisixSslDeleteError, err.Error())
		return e
	}
	// delete from mysql
	ssl := &Ssl{}
	ssl.ID = uuid.FromStringOrNil(id)
	if err := conf.DB().Delete(ssl).Error; err != nil {
		return errno.New(errno.DBDeleteError, err.Error())
	}

	return nil
}

func (req *SslRequest) PatchToApisix(id string) (*ApisixSslResponse, error) {
	url := fmt.Sprintf("%s/ssl/%s", conf.BaseUrl, id)
	if data, err := json.Marshal(req); err != nil {
		return nil, err
	} else {
		if resp, err := utils.Patch(url, data); err != nil {
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
	if crt == "" || key == "" {
		return nil, errors.New("invalid certificate")
	}

	certDERBlock, _ := pem.Decode([]byte(crt))
	if certDERBlock == nil {
		return nil, errors.New("Certificate resolution failed")
	}
	// match
	_, err := tls.X509KeyPair([]byte(crt), []byte(key))
	if err != nil {
		return nil, errors.New("key and cert don't match")
	}

	x509Cert, err := x509.ParseCertificate(certDERBlock.Bytes)

	if err != nil {
		return nil, errors.New("Certificate resolution failed")
	} else {
		ssl := Ssl{}
		//domain
		snis := []byte{}
		if x509Cert.DNSNames != nil && len(x509Cert.DNSNames) > 0 {
			snis, _ = json.Marshal(x509Cert.DNSNames)
		} else if x509Cert.IPAddresses != nil && len(x509Cert.IPAddresses) > 0 {
			snis, _ = json.Marshal(x509Cert.IPAddresses)
		} else {
			tmp := []string{}

			if x509Cert.Subject.Names != nil && len(x509Cert.Subject.Names) > 1 {

				var attributeTypeNames = map[string]string{
					"2.5.4.6":  "C",
					"2.5.4.10": "O",
					"2.5.4.11": "OU",
					"2.5.4.3":  "CN",
					"2.5.4.5":  "SERIALNUMBER",
					"2.5.4.7":  "L",
					"2.5.4.8":  "ST",
					"2.5.4.9":  "STREET",
					"2.5.4.17": "POSTALCODE",
				}

				for _, tv := range x509Cert.Subject.Names {
					oidString := tv.Type.String()
					typeName, ok := attributeTypeNames[oidString]
					if ok && typeName == "CN" {
						valueString := fmt.Sprint(tv.Value)
						tmp = append(tmp, valueString)
					}

				}
			}

			if len(tmp) < 1 && x509Cert.Subject.CommonName != "" {
				tmp = []string{x509Cert.Subject.CommonName}
			}

			snis, _ = json.Marshal(tmp)
		}
		ssl.Snis = string(snis)

		ssl.ValidityStart = uint64(x509Cert.NotBefore.Unix())
		ssl.ValidityEnd = uint64(x509Cert.NotAfter.Unix())
		ssl.PublicKey = crt

		return &ssl, nil
	}
}
