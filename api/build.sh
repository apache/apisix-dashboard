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

mkdir -p output

# get dag-to-lua lib
if [[ ! -f "dag-to-lua-1.1/lib/dag-to-lua.lua" ]]; then
    wget https://github.com/api7/dag-to-lua/archive/v1.1.tar.gz -P ./output
    cd ./output
    tar -zxvf v1.1.tar.gz
    rm v1.1.tar.gz
    cd ..
fi

# build
cd ./api && go build -o ../output/manager-api .

echo "Build the Manager API successfully"
