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
VERSION=$(cat ./VERSION)
KERNEL=$(uname -s)

# test content in .githash
if [[ -f ../.githash ]]; then
    GITHASH=$(cat ../.githash)
    if [[ ! $GITHASH =~ ^[a-z0-9]{7}$ ]]; then
        echo "failed: verify .githash content failed"
        exit 1
    fi
else
    GITHASH=$(HASH="ref: HEAD"; while [[ $HASH == ref\:* ]]; do HASH="$(cat "../.git/$(echo $HASH | cut -d \  -f 2)")"; done; echo ${HASH:0:7})
fi

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
go build -o ./manager-api -ldflags "-X github.com/apisix/manager-api/internal/utils.version=${VERSION} -X github.com/apisix/manager-api/internal/utils.gitHash=${GITHASH}" ./main.go

# default level: warn, path: logs/error.log

./manager-api &
sleep 3
./manager-api stop
sleep 6

check_logfile

if [[ `grep -c "INFO" ${logfile}` -ne '0' ]]; then
    echo "failed: should not write info log when level is warn"
    exit 1
fi

clean_logfile

# change level and test signal

if [[ $KERNEL = "Darwin" ]]; then
  sed -i "" 's/level: warn/level: info/' conf/conf.yaml
else
  sed -i 's/level: warn/level: info/' conf/conf.yaml
fi

./manager-api &>/dev/null &
sleep 3
./manager-api stop
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

# change path

if [[ $KERNEL = "Darwin" ]]; then
  sed -i "" 's/logs\/error.log/.\/error.log/' conf/conf.yaml
else
  sed -i 's/logs\/error.log/.\/error.log/' conf/conf.yaml
fi

./manager-api &
sleep 3
./manager-api stop
sleep 6

check_logfile

if [[ `grep -c "INFO" ./error.log` -eq '0' ]]; then
    echo "failed: failed to write log on right level"
    exit 1
fi

# run on a different path
workDir=$(pwd)
rm -rf html
mkdir html
cd html
echo "hi~" >> index.html
APISIX_API_WORKDIR=$workDir $workDir/manager-api &
sleep 5

res=$(curl http://127.0.0.1:9000)
$workDir/manager-api stop
sleep 6
cd -
rm -rf html

if [[ $res != "hi~" ]]; then
    echo "failed: manager-api can't run on a different path"
    exit 1
fi
clean_up

# run with -p flag out of the default directory
workDir=$(pwd)
distDir=/tmp/manager-api
cp -r $workDir $distDir
cd $distDir && rm -rf bin && mkdir bin && mv ./manager-api ./bin/
cd $distDir && rm -rf html && mkdir html && echo "hi~" >> html/index.html
cd $distDir/bin && ./manager-api -p $distDir &
sleep 5

res=$(curl http://127.0.0.1:9000)
$distDir/bin/manager-api stop
sleep 6
rm -fr $distDir

if [[ $res != "hi~" ]]; then
    echo "failed: manager-api can't run with -p flag out of the default directory"
    exit 1
fi
cd $workDir && git checkout conf/conf.yaml

# test start info

LOGLEVEL=$(cat conf/conf.yaml | awk '$1=="level:"{print $2}')
HOST=$(cat conf/conf.yaml | awk '$1=="host:"{print $2}')
PORT=$(cat conf/conf.yaml | awk '$1=="port:"{print $2}')
STDOUT=/tmp/manager-api
./manager-api &> ${STDOUT} &
sleep 3
./manager-api stop
sleep 6

if [[ `grep -c "The manager-api is running successfully\!" ${STDOUT}` -ne '1' ]]; then
    echo "failed: the manager server didn't show started info"
    exit 1
fi

if [[ `grep -c -w "${VERSION}" ${STDOUT}` -ne '1' ]]; then
    echo "failed: the manager server didn't show started info"
    exit 1
fi

if [[ `grep -c "${GITHASH}" ${STDOUT}` -ne '1' ]]; then
    echo "failed: the manager server didn't show started info"
    exit 1
fi

if [[ `grep -c "${LOGLEVEL}" ${STDOUT}` -ne '1' ]]; then
    echo "failed: the manager server didn't show started info"
    exit 1
fi

if [[ `grep -c "0.0.0.0:${PORT}" ${STDOUT}` -ne '1' ]]; then
    echo "failed: the manager server didn't show started info"
    exit 1
fi

# test version command
out=$(./manager-api version 2>&1 || true)
if [[ `echo $out | grep -c $VERSION` -ne '1' ]]; then
    echo "failed: the manager server didn't show version info"
    exit 1
fi

if [[ `echo $out | grep -c $GITHASH` -ne '1' ]]; then
    echo "failed: the manager server didn't show git hash info"
    exit 1
fi


# set an invalid etcd endpoint

clean_up

if [[ $KERNEL = "Darwin" ]]; then
  sed -i "" 's/127.0.0.1:2379/127.0.0.0:2379/' conf/conf.yaml
else
  sed -i 's/127.0.0.1:2379/127.0.0.0:2379/' conf/conf.yaml
fi


./manager-api > output.log 2>&1 &
sleep 6

cat ${logfile}

if [[ `grep -c "server/store.go" ${logfile}` -ne '1' ]]; then
    echo "failed: failed to write the correct caller"
    exit 1
fi

./manager-api stop
sleep 6
# clean config
clean_up

# access log test
./manager-api &
sleep 3

curl http://127.0.0.1:9000/apisix/admin/user/login -H "Content-Type: application/json" -d '{"username":"admin", "password": "admin"}'

./manager-api stop
sleep 6

if [[ `grep -c "/apisix/admin/user/login" ./logs/access.log` -eq '0' ]]; then
    echo "failed: failed to write access log"
    exit 1
fi

# clean config
clean_up

# set ip allowed list
if [[ $KERNEL = "Darwin" ]]; then
  sed -i "" 's@- 127.0.0.1 @- 10.0.0.1 @' conf/conf.yaml
else
  sed -i 's@- 127.0.0.1 @- 10.0.0.1 @' conf/conf.yaml
fi

./manager-api &
sleep 3

# should be forbidden
curl http://127.0.0.1:9000
code=$(curl -k -i -m 20 -o /dev/null -s -w %{http_code} http://127.0.0.1:9000)
if [ ! $code -eq 403 ]; then
    echo "failed: verify IP allowed list failed"
    exit 1
fi

./manager-api stop
sleep 6
clean_up


# HTTPS test
currentDir=$(pwd)
if [[ $KERNEL = "Darwin" ]]; then
  sed -i "" 's@# ssl:@ssl:@' conf/conf.yaml
  sed -i "" 's@#   port: 9001@  port: 9001@' conf/conf.yaml
  sed -i "" "s@#   cert: \"/tmp/cert/example.crt\"@  cert: \"$currentDir/test/certs/test2.crt\"@" conf/conf.yaml
  sed -i "" "s@#   key:  \"/tmp/cert/example.key\"@  cert: \"$currentDir/test/certs/test2.key\"@" conf/conf.yaml
else
  sed -i 's@# ssl:@ssl:@' conf/conf.yaml
  sed -i 's@#   port: 9001@  port: 9001@' conf/conf.yaml
  sed -i "s@#   cert: \"/tmp/cert/example.crt\"@  cert: \"$currentDir/test/certs/test2.crt\"@" conf/conf.yaml
  sed -i "s@#   key:  \"/tmp/cert/example.key\"@  key: \"$currentDir/test/certs/test2.key\"@" conf/conf.yaml
fi

./manager-api &
sleep 3

# access by HTTPS
code=$(curl -k -i -m 20 -o /dev/null -s -w %{http_code} --resolve 'www.test2.com:9001:127.0.0.1' https://www.test2.com:9001/apisix/admin/tool/version)
if [ ! $code -eq 200 ]; then
    echo "failed: verify HTTPS failed"
    exit 1
fi

./manager-api stop
sleep 6
clean_up


# etcd basic auth
# add root user
curl -L http://localhost:2379/v3/auth/user/add -d '{"name": "root", "password": "root"}'

# add root role
curl -L http://localhost:2379/v3/auth/role/add -d '{"name": "root"}'

# grant root role to root user
curl -L http://localhost:2379/v3/auth/user/grant -d '{"user": "root", "role": "root"}'

# enable auth
curl -L http://localhost:2379/v3/auth/enable -d '{}'

./manager-api &
sleep 3

# make sure it's wrong
if [[ `grep -c "etcdserver: user name is empty" ${logfile}` -eq '0' ]]; then
    echo "failed: failed to validate etcd basic auth"
    exit 1
fi

./manager-api stop
sleep 6

# modify etcd auth config
if [[ $KERNEL = "Darwin" ]]; then
  sed -i "" '1,$s/# username: "root"    # ignore etcd username if not enable etcd auth/username: "root"/g' conf/conf.yaml
  sed -i "" '1,$s/# password: "123456"  # ignore etcd password if not enable etcd auth/password: "root"/g' conf/conf.yaml
else
  sed -i '1,$s/# username: "root"    # ignore etcd username if not enable etcd auth/username: "root"/g' conf/conf.yaml
  sed -i '1,$s/# password: "123456"  # ignore etcd password if not enable etcd auth/password: "root"/g' conf/conf.yaml
fi

./manager-api &
sleep 3

# validate process is right by requesting login api
resp=$(curl http://127.0.0.1:9000/apisix/admin/user/login -H "Content-Type: application/json" -d '{"username":"admin", "password": "admin"}')
token=$(echo "${resp}" | sed 's/{/\n/g' | sed 's/,/\n/g' | grep "token" | sed 's/:/\n/g' | sed '1d' | sed 's/}//g'  | sed 's/"//g')
if [ -z "${token}" ]; then
    echo "login failed"
    exit 1
fi

# more validation to make sure it's ok to access etcd
resp=$(curl -ig -XPUT http://127.0.0.1:9000/apisix/admin/consumers -i -H "Content-Type: application/json" -H "Authorization: $token" -d '{"username":"etcd_basic_auth_test"}')
respCode=$(echo "${resp}" | sed 's/{/\n/g'| sed 's/,/\n/g' | grep "code" | sed 's/:/\n/g' | sed '1d')
respMessage=$(echo "${resp}" | sed 's/{/\n/g'| sed 's/,/\n/g' | grep "message" | sed 's/:/\n/g' | sed '1d')
if [ "$respCode" != "0" ] || [ $respMessage != "\"\"" ]; then
    echo "verify access etcd failed"
    exit 1
fi

# check the version api
resp=$(curl http://127.0.0.1:9000/apisix/admin/tool/version)
if [[ `echo ${resp} | grep -c "${VERSION}"` -ne '1' ]]; then
    echo "failed: can't through api to get version info"
    exit 1
fi

if [[ `echo ${resp} | grep -c "${GITHASH}"` -ne '1' ]]; then
    echo "failed: can't through api to get githash info"
    exit 1
fi

check_logfile

./manager-api stop
sleep 6
clean_up

# etcd prefix test
# disable etcd authentication
resp=$(curl -L http://localhost:2379/v3/auth/authenticate -X POST -d '{"name": "root", "password": "root"}')
etcd_token=$(echo ${resp}|grep -oE "token\".*\"(.*)\""|awk -F[:\"] '{print $4}')
if [ -z "${etcd_token}" ]; then
    echo "authenticate failed"
    exit 1
fi
curl -L http://localhost:2379/v3/auth/disable -H "Authorization: ${etcd_token}" -X POST -d ''

./manager-api &
sleep 3

resp=$(curl http://127.0.0.1:9000/apisix/admin/user/login -H "Content-Type: application/json" -d '{"username":"admin", "password": "admin"}')
token=$(echo "${resp}" | sed 's/{/\n/g' | sed 's/,/\n/g' | grep "token" | sed 's/:/\n/g' | sed '1d' | sed 's/}//g'  | sed 's/"//g')
if [ -z "${token}" ]; then
    echo "login failed"
    exit 1
fi
# default etcd prefix value /apisix
prefix=/apisix
# add consumer by manager-api
resp=$(curl -ig -XPUT http://127.0.0.1:9000/apisix/admin/consumers -i -H "Content-Type: application/json" -H "Authorization: $token" -d '{"username":"etcd_prefix_test"}')
# get consumer by etcd v3 api
key_base64=`echo -n $prefix/consumers/etcd_prefix_test | base64`
resp=$(curl -L http://localhost:2379/v3/kv/range -X POST -d '{"key": "'"${key_base64}"'"}')
count=`echo $resp | grep -oE "count.*([0-9]+)" | awk -F\" '{print $3}'`
if [ ! $count ] || [ $count -ne 1 ]; then
    echo "consumer failed"
    exit 1
fi

./manager-api stop
sleep 6

clean_up

# modify etcd prefix config to /apisix-test
if [[ $KERNEL = "Darwin" ]]; then
  sed -i "" '1,$s/# prefix: \/apisix.*/prefix: \/apisix-test/g' conf/conf.yaml
else
  sed -i '1,$s/# prefix: \/apisix.*/prefix: \/apisix-test/g' conf/conf.yaml
fi

./manager-api &
sleep 3

resp=$(curl http://127.0.0.1:9000/apisix/admin/user/login -H "Content-Type: application/json" -d '{"username":"admin", "password": "admin"}')
token=$(echo "${resp}" | sed 's/{/\n/g' | sed 's/,/\n/g' | grep "token" | sed 's/:/\n/g' | sed '1d' | sed 's/}//g'  | sed 's/"//g')
if [ -z "${token}" ]; then
    echo "login failed"
    exit 1
fi
# modified etcd prefix value /apisix-test
prefix=/apisix-test
# add consumer by manager-api
resp=$(curl -ig -XPUT http://127.0.0.1:9000/apisix/admin/consumers -i -H "Content-Type: application/json" -H "Authorization: $token" -d '{"username":"etcd_prefix_test"}')
# get consumer by etcd v3 api
key_base64=`echo -n $prefix/consumers/etcd_prefix_test | base64`
resp=$(curl -L http://localhost:2379/v3/kv/range -X POST -d '{"key": "'"${key_base64}"'"}')
count=`echo $resp | grep -oE "count.*([0-9]+)" | awk -F\" '{print $3}'`
if [ ! $count ] || [ $count -ne 1 ]; then
    echo "consumer failed"
    exit 1
fi

./manager-api stop
sleep 6
clean_up

# mtls test
./etcd-v3.4.14-linux-amd64/etcd --name infra0 --data-dir infra0 \
  --client-cert-auth --trusted-ca-file=$(pwd)/test/certs/mtls_ca.pem --cert-file=$(pwd)/test/certs/mtls_server.pem --key-file=$(pwd)/test/certs/mtls_server-key.pem \
  --advertise-client-urls https://127.0.0.1:3379 --listen-client-urls https://127.0.0.1:3379 --listen-peer-urls http://127.0.0.1:3380 &

currentDir=$(pwd)

if [[ $KERNEL = "Darwin" ]]; then
  sed -i "" "s@key_file: \"\"@key_file: \"$currentDir/test/certs/mtls_client-key.pem\"@g" conf/conf.yaml
  sed -i "" "s@cert_file: \"\"@cert_file: \"$currentDir/test/certs/mtls_client.pem\"@g" conf/conf.yaml
  sed -i "" "s@ca_file: \"\"@ca_file: \"$currentDir/test/certs/mtls_ca.pem\"@g" conf/conf.yaml
  sed -i "" 's/127.0.0.1:2379/127.0.0.1:3379/' conf/conf.yaml
else
  sed -i "s@key_file: \"\"@key_file: \"$currentDir/test/certs/mtls_client-key.pem\"@g" conf/conf.yaml
  sed -i "s@cert_file: \"\"@cert_file: \"$currentDir/test/certs/mtls_client.pem\"@g" conf/conf.yaml
  sed -i "s@ca_file: \"\"@ca_file: \"$currentDir/test/certs/mtls_ca.pem\"@g" conf/conf.yaml
  sed -i 's/127.0.0.1:2379/127.0.0.1:3379/' conf/conf.yaml
fi

./manager-api &
sleep 3

# validate process is right by requesting login api
resp=$(curl http://127.0.0.1:9000/apisix/admin/user/login -H "Content-Type: application/json" -d '{"username":"admin", "password": "admin"}')
token=$(echo "${resp}" | sed 's/{/\n/g' | sed 's/,/\n/g' | grep "token" | sed 's/:/\n/g' | sed '1d' | sed 's/}//g'  | sed 's/"//g')
if [ -z "${token}" ]; then
    echo "login failed(mTLS connect to ETCD)"
    exit 1
fi

# more validation to make sure it's ok to access etcd
resp=$(curl -ig -XPUT http://127.0.0.1:9000/apisix/admin/consumers -i -H "Content-Type: application/json" -H "Authorization: $token" -d '{"username":"etcd_basic_auth_test"}')
respCode=$(echo "${resp}" | sed 's/{/\n/g'| sed 's/,/\n/g' | grep "code" | sed 's/:/\n/g' | sed '1d')
respMessage=$(echo "${resp}" | sed 's/{/\n/g'| sed 's/,/\n/g' | grep "message" | sed 's/:/\n/g' | sed '1d')
if [ "$respCode" != "0" ] || [ $respMessage != "\"\"" ]; then
    echo "verify writing data failed(mTLS connect to ETCD)"
    exit 1
fi

./manager-api stop
sleep 6
clean_up

# run manager api as os service
# 2 times OK for installing and starting
if [[ `echo $(sudo ./manager-api start) | grep -o "OK" | wc -l` -ne "2" ]]; then
  echo "error while initializing the service"
  exit 1
fi
# check running status
if [[ `echo $(sudo ./manager-api status) | grep -c "running..."` -ne "1" ]]; then
  echo "error while starting the service"
  exit 1
fi
# stop the service
sudo ./manager-api stop
sleep 2
# recheck running status
if [[ `echo $(sudo ./manager-api status) | grep -c "Service is stopped"` -ne "1" ]]; then
  echo "error while stopping the service"
  exit 1
fi
# restart the service
# 1 time OK for just for starting
if [[ `echo $(sudo ./manager-api start) | grep -c "OK"` -ne "1" ]]; then
  echo "error while restarting the service"
  exit 1
fi
# stop the service
sudo ./manager-api stop
sleep 2
# remove the service
if [[ `echo $(sudo ./manager-api remove) | grep -c "OK"` -ne "1" ]]; then
  echo "error while removing the service"
  exit 1
fi
# test manager-api output for bad data on etcd
# make a dummy entry
./etcd-v3.4.14-linux-amd64/etcdctl put /apisix/routes/unique1 "{\"id\":}"
sleep 2

./manager-api 2>man-api.err &
sleep 4

if [[ `cat man-api.err | grep -c "Error occurred while initializing logical store:  /apisix/routes"` -ne '1' ||
`cat man-api.err | grep -c "Error: json unmarshal failed"` -ne '1' ]];then
  echo "manager api failed to stream error on stderr for bad data"
  exit 1
fi
# delete dummy entry
./etcd-v3.4.14-linux-amd64/etcdctl del /apisix/routes/unique1
# just to make sure
./manager-api stop
sleep 6
clean_up

# run manager api as os service
# 2 times OK for installing and starting
if [[ `echo $(sudo ./manager-api start) | grep -o "OK" | wc -l` -ne "2" ]]; then
  echo "error while initializing the service"
  exit 1
fi
# check running status
if [[ `echo $(sudo ./manager-api status) | grep -c "running..."` -ne "1" ]]; then
  echo "error while starting the service"
  exit 1
fi
# stop the service
sudo ./manager-api stop
sleep 2
# recheck running status
if [[ `echo $(sudo ./manager-api status) | grep -c "Service is stopped"` -ne "1" ]]; then
  echo "error while stopping the service"
  exit 1
fi
# restart the service
# 1 time OK for just for starting
if [[ `echo $(sudo ./manager-api start) | grep -c "OK"` -ne "1" ]]; then
  echo "error while restarting the service"
  exit 1
fi
# stop the service
sudo ./manager-api stop
sleep 2
# remove the service
if [[ `echo $(sudo ./manager-api remove) | grep -c "OK"` -ne "1" ]]; then
  echo "error while removing the service"
  exit 1
fi

pkill -f etcd

clean_up
