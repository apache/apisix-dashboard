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

pwd=`pwd`

if [[ -n $1 && -d "$1" ]]; then
  path=$1
  if [[ -d "${path}/apisix" ]]; then
    cp -R ${path}/apisix/ ./api/build-tools/apisix/
  else
    cp -R ${path}/ ./api/build-tools/apisix/
  fi
else
  version="master"
  if [[ -n $1 ]]; then
  version=$1
  fi
  wget -O $version.zip https://github.com/apache/apisix/archive/$version.zip

  unzip $version.zip
  mkdir -p ./api/build-tools/apisix/
  cp -a ./apisix-$version/apisix/. ./api/build-tools/apisix/
  ls -l ./api/build-tools/apisix/
  rm -rf ./apisix-$version
fi

cd ./api/build-tools/ && lua schema-sync.lua > ${pwd}/api/conf/schema.json && cd ../../

rm -rf ./api/build-tools/apisix/

echo "sync success:"
echo "${pwd}/api/conf/schema.json"
