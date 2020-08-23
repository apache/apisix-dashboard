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

export ENV=prod
pwd=`pwd`

sed -i -e "s%#mysqlAddress#%`echo $MYSQL_SERVER_ADDRESS`%g" ${pwd}/conf.json
sed -i -e "s%#mysqlUser#%`echo $MYSQL_USER`%g" ${pwd}/conf.json
sed -i -e "s%#mysqlPWD#%`echo $MYSQL_PASSWORD`%g" ${pwd}/conf.json
sed -i -e "s%#syslogAddress#%`echo $SYSLOG_HOST`%g" ${pwd}/conf.json
sed -i -e "s%#apisixBaseUrl#%`echo $APISIX_BASE_URL`%g" ${pwd}/conf.json
sed -i -e "s%#apisixApiKey#%`echo $APISIX_API_KEY`%g" ${pwd}/conf.json

cd /root/manager-api
exec ./manager-api

