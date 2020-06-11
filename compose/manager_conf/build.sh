#!/bin/sh

pwd=`pwd`

export MYSQL_SERVER_ADDRESS="192.17.5.14:3306"
export MYSQL_USER=root
export MYSQL_PASSWORD=123456
export SYSLOG_HOST=127.0.0.1
export APISIX_BASE_URL="http://192.17.5.11:9080/apisix/admin"
export APISIX_API_KEY="edd1c9f034335f136f87ad84b625c8f1"

sed -i -e "s%#mysqlAddress#%`echo $MYSQL_SERVER_ADDRESS`%g" ${pwd}/conf.json
sed -i -e "s%#mysqlUser#%`echo $MYSQL_USER`%g" ${pwd}/conf.json
sed -i -e "s%#mysqlPWD#%`echo $MYSQL_PASSWORD`%g" ${pwd}/conf.json
sed -i -e "s%#syslogAddress#%`echo $SYSLOG_HOST`%g" ${pwd}/conf.json
sed -i -e "s%#apisixBaseUrl#%`echo $APISIX_BASE_URL`%g" ${pwd}/conf.json
sed -i -e "s%#apisixApiKey#%`echo $APISIX_API_KEY`%g" ${pwd}/conf.json

cd /root/manager-api
exec ./manager-api
