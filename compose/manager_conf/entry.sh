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

pwd=`pwd`

# config
cp ${pwd}/api/conf/conf_preview.json ${pwd}/conf.json

export APIX_ETCD_ENDPOINTS="192.17.5.10:2379"

export SYSLOG_HOST=127.0.0.1

if [[ "$unamestr" == 'Darwin' ]]; then
	sed -i '' -e "s%#syslogAddress#%`echo $SYSLOG_HOST`%g" ${pwd}/conf.json
else
	sed -i -e "s%#syslogAddress#%`echo $SYSLOG_HOST`%g" ${pwd}/conf.json
fi

cp ${pwd}/conf.json ${pwd}/api/conf/conf.json

cd /go/manager-api
exec ./manager-api
