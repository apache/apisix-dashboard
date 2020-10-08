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
package ssl

import (
	"crypto/tls"
	"crypto/x509"
	"encoding/json"
	"encoding/pem"
	"errors"
	"fmt"
	"log"
	"reflect"
	"strings"

	"github.com/api7/go-jsonpatch"
	"github.com/gin-gonic/gin"
	"github.com/shiningrush/droplet"
	"github.com/shiningrush/droplet/data"
	"github.com/shiningrush/droplet/wrapper"
	wgin "github.com/shiningrush/droplet/wrapper/gin"

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/apisix/manager-api/internal/handler"
	"github.com/apisix/manager-api/internal/utils/consts"
)

type Handler struct {
	sslStore store.Interface
}

func NewHandler() (handler.RouteRegister, error) {
	return &Handler{
		sslStore: store.GetStore(store.HubKeySsl),
	}, nil
}

func (h *Handler) ApplyRoute(r *gin.Engine) {
	r.GET("/apisix/admin/ssl/:id", wgin.Wraps(h.Get,
		wrapper.InputType(reflect.TypeOf(GetInput{}))))
	r.GET("/apisix/admin/ssl", wgin.Wraps(h.List,
		wrapper.InputType(reflect.TypeOf(ListInput{}))))
	r.POST("/apisix/admin/ssl", wgin.Wraps(h.Create,
		wrapper.InputType(reflect.TypeOf(entity.SSL{}))))
	r.PUT("/apisix/admin/ssl/:id", wgin.Wraps(h.Update,
		wrapper.InputType(reflect.TypeOf(UpdateInput{}))))
	r.PATCH("/apisix/admin/ssl/:id", wgin.Wraps(h.Patch,
		wrapper.InputType(reflect.TypeOf(UpdateInput{}))))
	r.DELETE("/apisix/admin/ssl/:ids", wgin.Wraps(h.BatchDelete,
		wrapper.InputType(reflect.TypeOf(BatchDelete{}))))
	r.POST("/apisix/admin/check_ssl_cert", wgin.Wraps(h.Validate,
		wrapper.InputType(reflect.TypeOf(entity.SSL{}))))

	r.POST("/apisix/admin/check_ssl_exists", consts.ErrorWrapper(Exist))
}

type GetInput struct {
	ID string `auto_read:"id,path" validate:"required"`
}

func (h *Handler) Get(c droplet.Context) (interface{}, error) {
	input := c.Input().(*GetInput)

	ret, err := h.sslStore.Get(input.ID)
	if err != nil {
		return nil, err
	}

	//format respond
	ssl := ret.(*entity.SSL)
	ssl.Key = ""
	ssl.Keys = nil

	return ssl, nil
}

type ListInput struct {
	ID string `auto_read:"id,query"`
	data.Pager
}

func (h *Handler) List(c droplet.Context) (interface{}, error) {
	input := c.Input().(*ListInput)

	ret, err := h.sslStore.List(store.ListInput{
		Predicate: func(obj interface{}) bool {
			if input.ID != "" {
				return strings.Index(obj.(*entity.SSL).ID, input.ID) > 0
			}
			return true
		},
		PageSize:   input.PageSize,
		PageNumber: input.PageNumber,
	})
	if err != nil {
		return nil, err
	}

	//format respond
	var list []interface{}
	var ssl *entity.SSL
	for _, item := range ret.Rows {
		ssl = item.(*entity.SSL)
		ssl.Key = ""
		ssl.Keys = nil
		list = append(list, ssl)
	}
	if list == nil {
		list = []interface{}{}
	}
	ret.Rows = list

	return ret, nil
}

func (h *Handler) Create(c droplet.Context) (interface{}, error) {
	input := c.Input().(*entity.SSL)
	ssl, err := ParseCert(input.Cert, input.Key)
	if err != nil {
		return nil, err
	}

	ssl.ID = input.ID
	if err := h.sslStore.Create(c.Context(), ssl); err != nil {
		return nil, err
	}

	return nil, nil
}

type UpdateInput struct {
	ID string `auto_read:"id,path"`
	entity.SSL
}

func (h *Handler) Update(c droplet.Context) (interface{}, error) {
	input := c.Input().(*UpdateInput)
	ssl, err := ParseCert(input.Cert, input.Key)
	if err != nil {
		return nil, err
	}

	ssl.ID = input.ID
	log.Println("ssl", ssl)
	if err := h.sslStore.Update(c.Context(), ssl); err != nil {
		return nil, err
	}

	return nil, nil
}

func (h *Handler) Patch(c droplet.Context) (interface{}, error) {
	input := c.Input().(*UpdateInput)
	arr := strings.Split(input.ID, "/")
	var subPath string
	if len(arr) > 1 {
		input.ID = arr[0]
		subPath = arr[1]
	}

	stored, err := h.sslStore.Get(input.ID)
	if err != nil {
		return nil, err
	}

	var patch jsonpatch.Patch
	if subPath != "" {
		patch = jsonpatch.Patch{
			Operations: []jsonpatch.PatchOperation{
				{Op: jsonpatch.Replace, Path: subPath, Value: c.Input()},
			},
		}
	} else {
		patch, err = jsonpatch.MakePatch(stored, input.SSL)
		if err != nil {
			panic(err)
		}
	}

	err = patch.Apply(&stored)
	if err != nil {
		panic(err)
	}

	if err := h.sslStore.Update(c.Context(), &stored); err != nil {
		return nil, err
	}

	return nil, nil
}

type BatchDelete struct {
	Ids string `auto_read:"ids,path"`
}

func (h *Handler) BatchDelete(c droplet.Context) (interface{}, error) {
	input := c.Input().(*BatchDelete)

	if err := h.sslStore.BatchDelete(c.Context(), strings.Split(input.Ids, ",")); err != nil {
		return nil, err
	}

	return nil, nil
}

func ParseCert(crt, key string) (*entity.SSL, error) {
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
	}

	ssl := entity.SSL{}
	//domain
	snis := []string{}
	if x509Cert.DNSNames != nil && len(x509Cert.DNSNames) > 0 {
		snis = x509Cert.DNSNames
	} else if x509Cert.IPAddresses != nil && len(x509Cert.IPAddresses) > 0 {
		for _, ip := range x509Cert.IPAddresses {
			snis = append(snis, ip.String())
		}
	} else {
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
					snis = append(snis, valueString)
				}
			}
		}
	}

	ssl.Snis = snis
	ssl.Key = key
	ssl.ValidityStart = x509Cert.NotBefore.Unix()
	ssl.ValidityEnd = x509Cert.NotAfter.Unix()
	ssl.Cert = crt

	return &ssl, nil
}

func (h *Handler) Validate(c droplet.Context) (interface{}, error) {
	input := c.Input().(*entity.SSL)
	ssl, err := ParseCert(input.Cert, input.Key)
	if err != nil {
		return nil, err
	}

	return ssl, nil
}

type ExistInput struct {
	Name string `auto_read:"name,query"`
}

func toRows(list *store.ListOutput) []store.Row {
	rows := make([]store.Row, list.TotalSize)
	for i := range list.Rows {
		rows[i] = list.Rows[i].(*entity.SSL)
	}
	return rows
}

func checkValueExists(rows []store.Row, field, value string) bool {
	selector := store.Selector{
		List:  rows,
		Query: &store.Query{Filter: store.NewFilter([]string{field, value})},
	}

	list := selector.Filter().List

	return len(list) > 0
}

func checkSniExists(rows []store.Row, sni string) bool {
	if res := checkValueExists(rows, "sni", sni); res {
		return true
	}
	if res := checkValueExists(rows, "snis", sni); res {
		return true
	}
	//extensive domain
	firstDot := strings.Index(sni, ".")
	if firstDot > 0 && sni[0:1] != "*" {
		sni = "*" + sni[firstDot:]
		if res := checkValueExists(rows, "sni", sni); res {
			return true
		}
		if res := checkValueExists(rows, "snis", sni); res {
			return true
		}
	}

	return false
}

func Exist(c *gin.Context) (interface{}, error) {
	//input := c.Input().(*ExistInput)
	//temporary
	reqBody, _ := c.GetRawData()
	var hosts []string
	if err := json.Unmarshal(reqBody, &hosts); err != nil {
		return nil, err
	}

	routeStore := store.GetStore(store.HubKeySsl)
	ret, err := routeStore.List(store.ListInput{
		Predicate:  nil,
		PageSize:   0,
		PageNumber: 0,
	})

	if err != nil {
		return nil, err
	}

	for _, host := range hosts {
		res := checkSniExists(toRows(ret), host)
		if !res {
			return nil, consts.InvalidParam("SSL cert not exists for sni：" + host)
		}
	}

	return nil, nil
}
