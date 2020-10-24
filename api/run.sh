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

export ENV=local
pwd=`pwd`

# config
cp ${pwd}/api/conf/conf_preview.json ${pwd}/conf.json
export APIX_DAG_LIB_PATH="${pwd}/dag-to-lua-1.1/lib/"
export APIX_ETCD_ENDPOINTS="127.0.0.1:2379"
export SYSLOG_HOST=127.0.0.1

if [[ "$unamestr" == 'Darwin' ]]; then
	sed -i '' -e "s%#syslogAddress#%`echo $SYSLOG_HOST`%g" ${pwd}/conf.json
else
	sed -i -e "s%#syslogAddress#%`echo $SYSLOG_HOST`%g" ${pwd}/conf.json
fi

cp ${pwd}/conf.json ${pwd}/api/conf/conf.json


# get dag-to-lua lib
if [[ ! -f "dag-to-lua-1.1/lib/dag-to-lua.lua" ]]; then
    wget https://github.com/api7/dag-to-lua/archive/v1.1.tar.gz
    tar -zxvf v1.1.tar.gz
fi


# generate json schema if need a new one
if [[ ! -f "${pwd}/api/conf/schema.json" ]]; then
    rm master.zip
    rm -rf ./api/build-tools/apisix/
    wget https://github.com/apache/apisix/archive/master.zip
    unzip master.zip
    mkdir -p ./api/build-tools/apisix/
    mv ./apisix-master/apisix/* ./api/build-tools/apisix/
    rm -rf ./apisix-master
    cd ./api/build-tools/ && lua schema-sync.lua > ${pwd}/api/conf/schema.json
    cd ../../    
fi

# build
if [[ ! -f "${pwd}/manager-api" ]]; then
    cd ./api && go build -o ../manager-api .
    cd ../
fi

exec ./manager-api
