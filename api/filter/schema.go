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
package filter

import (
	"bytes"
	"crypto/tls"
	"crypto/x509"
	"encoding/json"
	"encoding/pem"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/apisix/manager-api/internal/core/store"
	"github.com/apisix/manager-api/internal/utils/consts"
	"github.com/apisix/manager-api/log"
)

var resources = map[string]string{
	"routes":    "route",
	"upstreams": "upstream",
	"services":  "service",
	"consumers": "consumer",
	"ssl":       "ssl",
}

func parseCert(crt, key string) ([]string, error) {
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

	//domain
	snis := []string{}
	if x509Cert.DNSNames != nil && len(x509Cert.DNSNames) > 0 {
		snis = x509Cert.DNSNames
	} else if x509Cert.IPAddresses != nil && len(x509Cert.IPAddresses) > 0 {
		for _, ip := range x509Cert.IPAddresses {
			snis = append(snis, ip.String())
		}
	} else {
		if x509Cert.Subject.Names != nil && len(x509Cert.Subject.Names) > 0 {
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

	return snis, nil
}

func handleSpecialField(resource string, reqBody []byte) ([]byte, error) {
	// remove script, because it's a map, and need to be parsed into lua code
	if resource == "routes" {
		var route map[string]interface{}
		err := json.Unmarshal(reqBody, &route)
		if err != nil {
			return nil, fmt.Errorf("read request body failed: %s", err)
		}
		if _, ok := route["script"]; ok {
			delete(route, "script")
			reqBody, err = json.Marshal(route)
			if err != nil {
				return nil, fmt.Errorf("read request body failed: %s", err)
			}
		}
	}

	// SSL does not need to pass sni, we need to parse the SSL to get sni
	if resource == "ssl" {
		var ssl map[string]interface{}
		err := json.Unmarshal(reqBody, &ssl)
		if err != nil {
			return nil, fmt.Errorf("read request body failed: %s", err)
		}
		ssl["snis"], err = parseCert(ssl["cert"].(string), ssl["key"].(string))
		if err != nil {
			return nil, fmt.Errorf("SSL parse failed: %s", err)
		}
		reqBody, err = json.Marshal(ssl)
		if err != nil {
			return nil, fmt.Errorf("read request body failed: %s", err)
		}
	}

	return reqBody, nil
}

func SchemaCheck() gin.HandlerFunc {
	return func(c *gin.Context) {
		pathPrefix := "/apisix/admin/"
		resource := strings.TrimPrefix(c.Request.URL.Path, pathPrefix)

		idx := strings.LastIndex(resource, "/")
		if idx > 1 {
			resource = resource[:idx]
		}
		method := strings.ToUpper(c.Request.Method)

		if method != "PUT" && method != "POST" {
			c.Next()
			return
		}
		schemaKey, ok := resources[resource]
		if !ok {
			c.Next()
			return
		}

		reqBody, err := c.GetRawData()
		if err != nil {
			log.Errorf("read request body failed: %s", err)
			c.AbortWithStatusJSON(http.StatusBadRequest, consts.ErrInvalidRequest)
			return
		}

		// other filter need it
		c.Request.Body = ioutil.NopCloser(bytes.NewBuffer(reqBody))

		validator, err := store.NewAPISIXSchemaValidator("main." + schemaKey)
		if err != nil {
			errMsg := err.Error()
			c.AbortWithStatusJSON(http.StatusBadRequest, consts.InvalidParam(errMsg))
			log.Error(errMsg)
			return
		}

		reqBody, err = handleSpecialField(resource, reqBody)
		if err != nil {
			errMsg := err.Error()
			c.AbortWithStatusJSON(http.StatusBadRequest, consts.InvalidParam(errMsg))
			log.Error(errMsg)
			return
		}

		if err := validator.Validate(reqBody); err != nil {
			errMsg := err.Error()
			c.AbortWithStatusJSON(http.StatusBadRequest, consts.InvalidParam(errMsg))
			log.Warn(errMsg)
			return
		}

		c.Next()
	}
}
