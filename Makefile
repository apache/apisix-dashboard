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

### license-check:    Check apisix-dashboard source codes for Apache License
.PHONY: license-check
license-check:
ifeq ("$(wildcard .actions/openwhisk-utilities/scancode/scanCode.py)", "")
	git clone https://github.com/apache/openwhisk-utilities.git .actions/openwhisk-utilities
	cp .actions/ASF* .actions/openwhisk-utilities/scancode/
endif
	.actions/openwhisk-utilities/scancode/scanCode.py --config .actions/ASF-Release.cfg ./

.PHONY: golangci-lint
golangci-lint: ## Run the golangci-lint application (install if not found)
	@#Brew - MacOS
	@if [ "$(shell command -v golangci-lint)" = "" ] && [ "$(shell command -v brew)" != "" ]; then brew install golangci-lint; fi;
	@#has sudo
	@if [ "$(shell command -v golangci-lint)" = "" ]; then curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s v1.32.0 && sudo cp ./bin/golangci-lint $(go env GOPATH)/bin/; fi;
	@echo "running golangci-lint..."
	@cd api && golangci-lint run ./...
