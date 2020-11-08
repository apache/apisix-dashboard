#
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

SHELL := /bin/bash -o pipefail
UNAME ?= $(shell uname)
YARN_EXEC ?= $(shell which yarn)
GO_EXEC ?= $(shell which go)

export GO111MODULE=on

### help:             Show Makefile rules
.PHONY: help
help:
	@echo Makefile rules:
	@echo
	@grep -E '^### [-A-Za-z0-9_]+:' Makefile | sed 's/###/   /'


### dashboard-build:   build dashboard, it contains frontend and manager-api
.PHONY: dashboard-build
dashboard-build: frontend-default api-default
	api/build.sh; \
	cd /web; \
	yarn install; \
	yarn build

### dashboard-run:   run dashboard, it contains frontend and manager-api
.PHONY: dashboard-run
dashboard-run:
	api/run.sh &


.PHONY: frontend-default
frontend-default:
ifeq ("$(wildcard $(YARN_EXEC))", "")
	@echo "ERROR: Need to install yarn first"
	exit 1
endif


### frontend-install:   yarn install dashboard frontend 
.PHONY: frontend-install
frontend-install: frontend-default
	cd ./web; \
	yarn install


### frontend-run:   run dashboard frontend 
.PHONY: frontend-run
frontend-run: frontend-install
	cd ./web; \
	yarn start
	@echo "If we want to modify the API, please refer to the config/proxy.ts file."

.PHONY: api-default
api-default:
ifeq ("$(wildcard $(GO_EXEC))", "")
	@echo "ERROR: Need to install golang 1.13+ first"
	exit 1
endif


### golang-lint:             Lint Go source code
.PHONY: golang-lint
golang-lint: ## Run the golangci-lint application (install if not found)
	@#Brew - MacOS
	@if [ "$(shell command -v golangci-lint)" = "" ] && [ "$(shell command -v brew)" != "" ] && [ "$(UNAME)" = "Darwin" ]; then brew install golangci-lint; fi;
	@#has sudo
	@if [ "$(shell command -v golangci-lint)" = "" ]; then curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s v1.32.0 && sudo cp ./bin/golangci-lint $(go env GOPATH)/bin/; fi;
	@echo "running golangci-lint..."
	@cd api && golangci-lint run --tests=false ./...

### api-test:         Run the tests of manager-api 
.PHONY: api-test
api-test: api-default
	cd api/ && APISIX_API_WORKDIR=$$PWD go test -v -race -cover -coverprofile=coverage.txt -covermode=atomic ./...


### api-run:         Run the manager-api
.PHONY: api-run
api-run: api-default
	cd api/ && go run .

### license-check:    Check apisix-dashboard source codes for Apache License
.PHONY: license-check
license-check:
ifeq ("$(wildcard .actions/openwhisk-utilities/scancode/scanCode.py)", "")
	git clone https://github.com/apache/openwhisk-utilities.git .actions/openwhisk-utilities
	cp .actions/ASF* .actions/openwhisk-utilities/scancode/
endif
	.actions/openwhisk-utilities/scancode/scanCode.py --config .actions/ASF-Release.cfg ./




