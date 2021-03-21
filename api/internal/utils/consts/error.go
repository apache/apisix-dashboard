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
package consts

import (
	"errors"

	"github.com/shiningrush/droplet/data"
)

const (
	ErrBadRequest = 20001
	ErrForbidden  = 20002
)

const (
	UpstreamIDNotFound = "upstream id: %s not found"
	ServiceIDNotFound  = "service id: %s not found"
)

var (
	ErrorUsernamePassword         = errors.New("username or password error")
	ErrorIDUsername               = errors.New("consumer's id and username must be a same value")
	ErrorParameterID              = errors.New("Parameter IDs cannot be empty")
	ErrorRouteData                = errors.New("Route data is empty, cannot be exported")
	ErrorImportFile               = errors.New("empty or invalid imported file")
	ErrorSSLCertificate           = errors.New("invalid certificate")
	ErrorSSLCertificateResolution = errors.New("Certificate resolution failed")
	ErrorSSLKeyAndCert            = errors.New("key and cert don't match")
)

var (
	// base error please refer to github.com/shiningrush/droplet/data, such as data.ErrNotFound, data.ErrConflicted
	ErrInvalidRequest       = data.BaseError{Code: ErrBadRequest, Message: "invalid request"}
	ErrSchemaValidateFailed = data.BaseError{Code: ErrBadRequest, Message: "JSONSchema validate failed"}
	ErrIPNotAllow           = data.BaseError{Code: ErrForbidden, Message: "IP address not allowed"}
)
