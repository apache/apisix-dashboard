#!/bin/sh

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

ver=$1

red='\e[0;41m'
RED='\e[1;31m'
green='\e[0;32m'
GREEN='\e[1;32m'
NC='\e[0m'


# doc: apisix $ver

matched=`grep "apisix-dashboard-v[0-9][0-9.]*" -r docs/`
expected=`grep "apisix-dashboard-v$ver" -r docs/`

if [ "$matched" = "$expected" ]; then
    echo -e "${green}passed: (doc) apisix-dashboard $ver ${NC}"
else
    echo -e "${RED}failed: (doc) apisix-dashboard $ver ${NC}" 1>&2
    echo
    echo "-----maybe wrong version-----"
    echo "$matched"
    exit 1
fi

matched=`grep "git clone -b v[0-9][0-9.]*" -r docs/`
expected=`grep "git clone -b v$ver" -r docs/`

if [ "$matched" = "$expected" ]; then
    echo -e "${green}passed: (doc) apisix-dashboard $ver ${NC}"
else
    echo -e "${RED}failed: (doc) apisix-dashboard $ver ${NC}" 1>&2
    echo
    echo "-----maybe wrong version-----"
    echo "$matched"
    exit 1
fi


# api VERSION

apiV=`cat api/VERSION`

if [ "$apiV" != "$ver" ]; then
    echo -e "${RED}failed: api/VERSION = $apiV not \"$ver\" ${NC}" 1>&2
    exit 1
else
    echo -e "${green}passed: api/VERSION = $ver ${NC}"
fi


# rockspec

matched=`cat web/package.json | grep version | grep "$ver"`

if [ -z "$matched" ]; then
    echo "-----please check version \"$ver\" in web/package.json"
    exit 1
else
    echo -e "${green}passed: version in web/package.json = $ver ${NC}"
fi
