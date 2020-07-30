#!/bin/sh

export etcd_url='http://192.17.5.10:2379'

unamestr=`uname`

wget https://raw.githubusercontent.com/apache/incubator-apisix/master/conf/config.yaml

if [[ "$unamestr" == 'Darwin' ]]; then
   sed -i '' -e ':a' -e 'N' -e '$!ba' -e "s/allow_admin[a-z: #\/._]*\n\( *- [0-9a-zA-Z: #\/._',]*\n*\)*//g" config.yaml
   sed -i '' -e "s%http://[0-9.]*:2379%`echo $etcd_url`%g" config.yaml
else
	sed -i -e ':a' -e 'N' -e '$!ba' -e "s/allow_admin[a-z: #\/._]*\n\( *- [0-9a-zA-Z: #\/._',]*\n*\)*//g" config.yaml
	sed -i -e "s%http://[0-9.]*:2379%`echo $etcd_url`%g" config.yaml
fi



mv config.yaml ./apisix_conf/config.yaml
