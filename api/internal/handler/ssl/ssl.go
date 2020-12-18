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
	"net/http"
	"reflect"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/shiningrush/droplet"
	"github.com/shiningrush/droplet/data"
	"github.com/shiningrush/droplet/wrapper"
	wgin "github.com/shiningrush/droplet/wrapper/gin"

	"github.com/apisix/manager-api/conf"
	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/apisix/manager-api/internal/handler"
	"github.com/apisix/manager-api/internal/utils"
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
	r.PUT("/apisix/admin/ssl", wgin.Wraps(h.Update,
		wrapper.InputType(reflect.TypeOf(UpdateInput{}))))
	r.PUT("/apisix/admin/ssl/:id", wgin.Wraps(h.Update,
		wrapper.InputType(reflect.TypeOf(UpdateInput{}))))
	r.DELETE("/apisix/admin/ssl/:ids", wgin.Wraps(h.BatchDelete,
		wrapper.InputType(reflect.TypeOf(BatchDelete{}))))
	r.POST("/apisix/admin/check_ssl_cert", wgin.Wraps(h.Validate,
		wrapper.InputType(reflect.TypeOf(entity.SSL{}))))

	r.PATCH("/apisix/admin/ssl/:id", consts.ErrorWrapper(Patch))
	r.PATCH("/apisix/admin/ssl/:id/*path", consts.ErrorWrapper(Patch))

	r.POST("/apisix/admin/check_ssl_exists", consts.ErrorWrapper(Exist))
}

type GetInput struct {
	ID string `auto_read:"id,path" validate:"required"`
}

func (h *Handler) Get(c droplet.Context) (interface{}, error) {
	input := c.Input().(*GetInput)

	ret, err := h.sslStore.Get(input.ID)
	if err != nil {
		return handler.SpecCodeResponse(err), err
	}

	//format respond
	ssl := &entity.SSL{}
	err = utils.ObjectClone(ret, ssl)
	if err != nil {
		return handler.SpecCodeResponse(err), err
	}
	ssl.Key = ""
	ssl.Keys = nil

	return ssl, nil
}

type ListInput struct {
	SNI string `auto_read:"sni,query"`
	store.Pagination
}

// swagger:operation GET /apisix/admin/ssl getSSLList
//
// Return the SSL list according to the specified page number and page size, and can SSLs search by sni.
//
// ---
// produces:
// - application/json
// parameters:
// - name: page
//   in: query
//   description: page number
//   required: false
//   type: integer
// - name: page_size
//   in: query
//   description: page size
//   required: false
//   type: integer
// - name: sni
//   in: query
//   description: sni of SSL
//   required: false
//   type: string
// responses:
//   '0':
//     description: list response
//     schema:
//       type: array
//       items:
//         "$ref": "#/definitions/ssl"
//   default:
//     description: unexpected error
//     schema:
//       "$ref": "#/definitions/ApiError"
func (h *Handler) List(c droplet.Context) (interface{}, error) {
	input := c.Input().(*ListInput)

	ret, err := h.sslStore.List(store.ListInput{
		Predicate: func(obj interface{}) bool {
			if input.SNI != "" {
				if strings.Contains(obj.(*entity.SSL).Sni, input.SNI) {
					return true
				}
				for _, str := range obj.(*entity.SSL).Snis {
					result := strings.Contains(str, input.SNI)
					if result {
						return true
					}
				}
				return false
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
	for _, item := range ret.Rows {
		ssl := &entity.SSL{}
		_ = utils.ObjectClone(item, ssl)
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
		return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest}, err
	}

	ssl.ID = input.ID
	//set default value for SSL status, if not set, it will be 0 which means disable.
	ssl.Status = conf.SSLDefaultStatus
	if err := h.sslStore.Create(c.Context(), ssl); err != nil {
		return handler.SpecCodeResponse(err), err
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
		return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest}, err
	}

	if input.ID != "" {
		ssl.ID = input.ID
	}

	//set default value for SSL status, if not set, it will be 0 which means disable.
	ssl.Status = conf.SSLDefaultStatus
	if err := h.sslStore.Update(c.Context(), ssl, true); err != nil {
		return handler.SpecCodeResponse(err), err
	}

	return nil, nil
}

func Patch(c *gin.Context) (interface{}, error) {
	reqBody, _ := c.GetRawData()
	ID := c.Param("id")
	subPath := c.Param("path")

	sslStore := store.GetStore(store.HubKeySsl)
	stored, err := sslStore.Get(ID)
	if err != nil {
		return handler.SpecCodeResponse(err), err
	}

	res, err := utils.MergePatch(stored, subPath, reqBody)
	if err != nil {
		return handler.SpecCodeResponse(err), err
	}

	var ssl entity.SSL
	err = json.Unmarshal(res, &ssl)
	if err != nil {
		return handler.SpecCodeResponse(err), err
	}

	if err := sslStore.Update(c, &ssl, false); err != nil {
		return handler.SpecCodeResponse(err), err
	}

	return nil, nil
}

type BatchDelete struct {
	Ids string `auto_read:"ids,path"`
}

func (h *Handler) BatchDelete(c droplet.Context) (interface{}, error) {
	input := c.Input().(*BatchDelete)

	if err := h.sslStore.BatchDelete(c.Context(), strings.Split(input.Ids, ",")); err != nil {
		return handler.SpecCodeResponse(err), err
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

// swagger:operation POST /apisix/admin/check_ssl_cert checkSSL
//
// verify SSL cert and key.
//
// ---
// produces:
// - application/json
// parameters:
// - name: cert
//   in: body
//   description: cert of SSL
//   required: true
//   type: string
// - name: key
//   in: body
//   description: key of SSL
//   required: true
//   type: string
// responses:
//   '0':
//     description: SSL verify passed
//     schema:
//       "$ref": "#/definitions/ApiError"
//   default:
//     description: unexpected error
//     schema:
//       "$ref": "#/definitions/ApiError"
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

// swagger:operation POST /apisix/admin/check_ssl_exists checkSSLExist
//
// Check whether the SSL exists.
//
// ---
// produces:
// - application/json
// parameters:
// - name: cert
//   in: body
//   description: cert of SSL
//   required: true
//   type: string
// - name: key
//   in: body
//   description: key of SSL
//   required: true
//   type: string
// responses:
//   '0':
//     description: SSL exists
//     schema:
//       "$ref": "#/definitions/ApiError"
//   default:
//     description: unexpected error
//     schema:
//       "$ref": "#/definitions/ApiError"
func Exist(c *gin.Context) (interface{}, error) {
	//input := c.Input().(*ExistInput)
	//temporary
	reqBody, _ := c.GetRawData()
	var hosts []string
	if err := json.Unmarshal(reqBody, &hosts); err != nil {
		return &data.SpecCodeResponse{StatusCode: http.StatusBadRequest}, err
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
			return &data.SpecCodeResponse{StatusCode: http.StatusNotFound},
				consts.InvalidParam("SSL cert not exists for sni：" + host)
		}
	}

	return nil, nil
}
