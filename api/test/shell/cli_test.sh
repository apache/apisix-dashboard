#!/usr/bin/env bash

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

# 'make init' operates scripts and related configuration files in the current directory
# The 'apisix' command is a command in the /usr/local/apisix,
# and the configuration file for the operation is in the /usr/local/apisix/conf

set -ex

clean_up() {
    git checkout conf/conf.json
}

trap clean_up EXIT

export GO111MODULE=on
go build -o ./manager-api .

#default level: warn, path: logs/error.log
./manager-api &
sleep 3
pkill -f manager-api

if [[ ! -f "./logs/error.log" ]]; then
    echo "failed: failed to write log"
    exit 1
fi

if [[ `grep -c "INFO" ./error.log` -neq '0' ]]; then
    echo "failed: should not write info log when level is warn"
    exit 1
fi

#change level and path
sed -i 's/"file_path": ""/"file_path": ".\/error.log"/' conf/conf.json
sed -i 's/warn/info/' conf/conf.json

./manager-api &
sleep 3
pkill -f manager-api

if [[ ! -f "./error.log" ]]; then
    echo "failed: failed to write log"
    exit 1
fi

if [[ `grep -c "INFO" ./error.log` -eq '0' ]]; then
    echo "failed: failed to write log on right level"
    exit 1
fi
