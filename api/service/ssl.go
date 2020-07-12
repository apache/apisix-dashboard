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
	"crypto/md5"
	"crypto/tls"
	"crypto/x509"
	"encoding/json"
	"encoding/pem"
	"errors"
	"fmt"
	"regexp"
	"strings"

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
	PublicKeyHash string `json:"public_key_hash,omitempty"`
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
		logger.Info("req:")
		logger.Info(req)
		req = nil
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

func SslList(page, size, status, expireStart, expireEnd int, sni, sortType string) (int, []SslDto, error) {
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

	sortType = strings.ToLower(sortType)
	if sortType != "desc" {
		sortType = "asc"
	}

	if err := db.Order("validity_end " + sortType).Offset((page - 1) * size).Limit(size).Find(&sslList).Error; err != nil {
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
	if id == "" {
		return nil, errno.New(errno.InvalidParam)
	}
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

	if sslReq.PrivateKey == "" {
		return errno.New(errno.InvalidParamDetail, "Key is required")
	}
	if sslReq.PublicKey == "" {
		return errno.New(errno.InvalidParamDetail, "Cert is required")
	}

	sslReq.PublicKey = strings.TrimSpace(sslReq.PublicKey)
	sslReq.PrivateKey = strings.TrimSpace(sslReq.PrivateKey)

	ssl, err := ParseCert(sslReq.PublicKey, sslReq.PrivateKey)
	if err != nil {
		e := errno.FromMessage(errno.SslParseError, err.Error())
		return e
	}

	ssl.ID = uuid.FromStringOrNil(id)
	ssl.Status = 1
	data := []byte(ssl.PublicKey)
	hash := md5.Sum(data)
	ssl.PublicKeyHash = fmt.Sprintf("%x", hash)

	//check hash
	exists := Ssl{}
	conf.DB().Table("ssls").Where("public_key_hash = ?", ssl.PublicKeyHash).First(&exists)
	if exists != (Ssl{}) {
		e := errno.New(errno.DuplicateSslCert)
		return e
	}

	//check sni
	var snis []string
	_ = json.Unmarshal([]byte(ssl.Snis), &snis)
	sslReq.Snis = snis

	// trans
	tx := conf.DB().Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// update mysql
	if err := tx.Create(ssl).Error; err != nil {
		tx.Rollback()
		return errno.New(errno.DBWriteError, err.Error())
	}

	//admin api

	if _, err := sslReq.PutToApisix(id); err != nil {
		tx.Rollback()
		if _, ok := err.(*errno.HttpError); ok {
			return err
		}
		e := errno.New(errno.ApisixSslCreateError, err.Error())
		return e
	}

	tx.Commit()

	return nil
}

func SslUpdate(param interface{}, id string) error {
	if id == "" {
		return errno.New(errno.InvalidParam)
	}

	sslReq := &SslRequest{}
	sslReq.Parse(param)

	if sslReq.PrivateKey == "" {
		return errno.New(errno.InvalidParamDetail, "Key is required")
	}
	if sslReq.PublicKey == "" {
		return errno.New(errno.InvalidParamDetail, "Cert is required")
	}

	ssl, err := ParseCert(sslReq.PublicKey, sslReq.PrivateKey)
	if err != nil {
		return errno.FromMessage(errno.SslParseError, err.Error())
	}

	hash := md5.Sum([]byte(ssl.PublicKey))
	ssl.ID = uuid.FromStringOrNil(id)
	ssl.PublicKeyHash = fmt.Sprintf("%x", hash)

	//check hash
	exists := Ssl{}
	conf.DB().Table("ssls").Where("public_key_hash = ?", ssl.PublicKeyHash).First(&exists)
	if exists != (Ssl{}) && exists.ID != ssl.ID {
		e := errno.New(errno.DuplicateSslCert)
		return e
	}

	// trans
	tx := conf.DB().Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	//sni check
	var snis []string
	_ = json.Unmarshal([]byte(ssl.Snis), &snis)
	sslReq.Snis = snis

	// update mysql
	data := Ssl{PublicKey: ssl.PublicKey, Snis: ssl.Snis, ValidityStart: ssl.ValidityStart, ValidityEnd: ssl.ValidityEnd}
	if err := tx.Model(&ssl).Updates(data).Error; err != nil {
		tx.Rollback()
		return errno.New(errno.DBWriteError, err.Error())
	}

	//admin api
	if _, err := sslReq.PutToApisix(id); err != nil {
		tx.Rollback()
		if _, ok := err.(*errno.HttpError); ok {
			return err
		}
		e := errno.New(errno.ApisixSslUpdateError, err.Error())
		return e
	}

	tx.Commit()

	return nil
}

func SslPatch(param interface{}, id string) error {
	if id == "" {
		return errno.New(errno.InvalidParam)
	}

	sslReq := &SslRequest{}
	sslReq.Parse(param)

	// trans
	tx := conf.DB().Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// update mysql
	ssl := Ssl{}
	ssl.ID = uuid.FromStringOrNil(id)
	if err := tx.Model(&ssl).Update("status", sslReq.Status).Error; err != nil {
		tx.Rollback()
		return errno.New(errno.DBWriteError, err.Error())
	}

	if _, err := sslReq.PatchToApisix(id); err != nil {
		tx.Rollback()
		if _, ok := err.(*errno.HttpError); ok {
			return err
		}
		e := errno.New(errno.ApisixSslUpdateError, err.Error())
		return e
	}

	tx.Commit()

	return nil
}

func SslDelete(id string) error {
	if id == "" {
		return errno.New(errno.InvalidParam)
	}

	// trans
	tx := conf.DB().Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// delete from mysql
	ssl := &Ssl{}
	ssl.ID = uuid.FromStringOrNil(id)
	if err := conf.DB().Delete(ssl).Error; err != nil {
		tx.Rollback()
		return errno.New(errno.DBDeleteError, err.Error())
	}

	// delete from apisix
	request := &SslRequest{}
	request.ID = id
	if _, err := request.DeleteFromApisix(); err != nil {
		tx.Rollback()
		if _, ok := err.(*errno.HttpError); ok {
			return err
		}
		e := errno.New(errno.ApisixSslDeleteError, err.Error())
		return e
	}

	tx.Commit()

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

func CheckSniExists(param interface{}) error {
	var hosts []string
	if err := json.Unmarshal(param.([]byte), &hosts); err != nil {
		return errno.FromMessage(errno.InvalidParam)
	}

	sslList := []Ssl{}
	db := conf.DB().Table("ssls")
	db = db.Where("`status` = ? ", 1)

	condition := ""
	args := []interface{}{}
	first := true
	for _, host := range hosts {
		idx := strings.Index(host, "*")
		keyword := strings.Replace(host, "*.", "", -1)
		if idx == -1 {
			if j := strings.Index(host, "."); j != -1 {
				keyword = host[j:]
				//just one `.`
				if j := strings.Index(host[(j+1):], "."); j == -1 {
					keyword = host
				}
			}
		}
		if first {
			condition = condition + "`snis` like ?"
		} else {
			condition = condition + " or `snis` like ?"
		}
		first = false
		args = append(args, "%"+keyword+"%")
	}
	db = db.Where(condition, args...)

	if err := db.Find(&sslList).Error; err != nil {
		return errno.FromMessage(errno.SslForSniNotExists, hosts[0])
	}

hre:
	for _, host := range hosts {
		for _, ssl := range sslList {
			sslDto := SslDto{}
			sslDto.Parse(&ssl)
			for _, sni := range sslDto.Snis {
				if sni == host {
					continue hre
				}
				regx := strings.Replace(sni, ".", `\.`, -1)
				regx = strings.Replace(regx, "*", `([^\.]+)`, -1)
				regx = "^" + regx + "$"
				if isOk, _ := regexp.MatchString(regx, host); isOk {
					continue hre
				}
			}
		}
		return errno.FromMessage(errno.SslForSniNotExists, host)
	}

	return nil
}

func DeleteTestSslData() {
	db := conf.DB().Table("ssls")
	db.Where("snis LIKE ? OR (snis LIKE ? AND snis LIKE ? )", "%*.route.com%", "%r.com%", "%s.com%").Delete(Ssl{})
}
