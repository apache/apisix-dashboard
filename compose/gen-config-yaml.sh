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

#!/bin/sh

export etcd_url='http://192.17.5.10:2379'

unamestr=`uname`

wget https://raw.githubusercontent.com/apache/apisix/master/conf/config-default.yaml  -O config.yaml

if [[ "$unamestr" == 'Darwin' ]]; then
   sed -i '' -e ':a' -e 'N' -e '$!ba' -e "s/allow_admin[a-z: #\/._]*\n\( *- [0-9a-zA-Z: #\/._',]*\n*\)*//g" config.yaml
   sed -i '' -e "s%http://[0-9.]*:2379%`echo $etcd_url`%g" config.yaml
else
	sed -i -e ':a' -e 'N' -e '$!ba' -e "s/allow_admin[a-z: #\/._]*\n\( *- [0-9a-zA-Z: #\/._',]*\n*\)*//g" config.yaml
	sed -i -e "s%http://[0-9.]*:2379%`echo $etcd_url`%g" config.yaml
fi



mv config.yaml ./apisix_conf/config.yaml
