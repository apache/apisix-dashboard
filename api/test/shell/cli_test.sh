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

set -ex

clean_up() {
    git checkout conf/conf.yaml
}

logfile="./logs/error.log"

check_logfile() {
    if [[ ! -f $logfile ]]; then
        echo "failed: failed to write log"
        exit 1
    fi
}

clean_logfile() {
    echo > $logfile
}

trap clean_up EXIT

export GO111MODULE=on
go build -o ./manager-api .

#default level: warn, path: logs/error.log

./manager-api &
sleep 3
pkill -f manager-api

check_logfile

if [[ `grep -c "INFO" ${logfile}` -ne '0' ]]; then
    echo "failed: should not write info log when level is warn"
    exit 1
fi

clean_logfile

# change level and test signal

sed -i 's/level: warn/level: info/' conf/conf.yaml

./manager-api &>/dev/null &
sleep 3
pkill -2 -f manager-api
sleep 6

check_logfile

if [[ `ps -ef | grep "[m]anager-api" -c` -eq '1' ]]; then
    echo "failed: the manager server didn't deal with signal in correct way"
    exit 1
fi

if [[ `grep -c "server receive interrupt" ${logfile}` -ne '1' ]]; then
    echo "failed: the manager server didn't deal with signal in correct way"
    exit 1
fi

clean_logfile

#change path

sed -i 's/logs\/error.log/.\/error.log/' conf/conf.yaml

./manager-api &
sleep 3
pkill -f manager-api

check_logfile

if [[ `grep -c "INFO" ./error.log` -eq '0' ]]; then
    echo "failed: failed to write log on right level"
    exit 1
fi


# etcd basic auth
# add root user
curl -L http://localhost:2379/v3/auth/user/add \
  -X POST -d '{"name": "root", "password": "apisix-dashboard"}'

# add root role
curl -L http://localhost:2379/v3/auth/role/add \
  -X POST -d '{"name": "root"}'

# grant root role to root user
curl -L http://localhost:2379/v3/auth/user/grant \
  -X POST -d '{"user": "root", "role": "root"}'

# enable auth
curl -L http://localhost:2379/v3/auth/enable -X POST -d '{}'

./manager-api &
sleep 3
pkill -f manager-api

# make sure it's wrong
if [[ `grep -c "etcdserver: user name is empty" ./error.log` -eq '0']]; then
    echo "failed: failed to validate etcd basic auth"
    exit 1
fi

clean_logfile

# modify etcd auth config
sed -i '1,$s/# username: "root" # ignore this argument if not enable auth/username: "root"/g' conf/conf.yaml
sed -i '1,$s/# password: "123456" # ignore this argument if not enable auth/password: "apisix-dashboard"/g' conf/conf.yaml

./manager-api &

# validate process is right by requesting login api
resp=$(curl http://127.0.0.1:9000/apisix/admin/user/login -X POST -d '{"username":"admin", "password": "admin"}')
token=$(echo "${resp}" | sed 's/{/\n/g' | sed 's/,/\n/g' | grep "token" | sed 's/:/\n/g' | sed '1d' | sed 's/}//g'  | sed 's/"//g')
if [ -z "${token}" ]; then
    echo "login failed"
fi

sleep 3
pkill -f manager-api

check_logfile
