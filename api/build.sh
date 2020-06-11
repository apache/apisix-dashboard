#!/bin/sh

pwd=`pwd`

sed -i -e "s%#mysqlAddress#%`echo $MYSQL_SERVER_ADDRESS`%g" ${pwd}/conf.json
sed -i -e "s%#mysqlUser#%`echo $MYSQL_USER`%g" ${pwd}/conf.json
sed -i -e "s%#mysqlPWD#%`echo $MYSQL_PASSWORD`%g" ${pwd}/conf.json
sed -i -e "s%#syslogAddress#%`echo $SYSLOG_HOST`%g" ${pwd}/conf.json
sed -i -e "s%#apisixBaseUrl#%`echo $APISIX_BASE_URL`%g" ${pwd}/conf.json
sed -i -e "s%#apisixApiKey#%`echo $APISIX_API_KEY`%g" ${pwd}/conf.json

cd /root/api7-manager-api
exec ./api7-manager-api

