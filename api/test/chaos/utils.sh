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

apply_sed() {
    sed -i -z 's$"http://172.16.238.10:2379"\n    - "http://172.16.238.11:2379"\n    - "http://172.16.238.12:2379"$"http://etcd.default.svc.cluster.local:2379"$g' ./*.*
    sed -i -e 's$http://172.16.238.50$http://skywalking.default.svc.cluster.local$g' ./*.*
    sed -i -e 's$127.0.0.1:2379$etcd.default.svc.cluster.local:2379$g' ../../conf/conf.yaml
}

port_forward() {
    nohup kubectl port-forward svc/apisix 9080:9080 >/tmp/pf1 2>&1 &
    nohup kubectl port-forward svc/apisix 9091:9091 >/tmp/pf2 2>&1 &
    nohup kubectl port-forward svc/apisix 9443:9443 >/tmp/pf3 2>&1 &
    nohup kubectl port-forward svc/apisix2 9081:9081 >/tmp/pf4 2>&1 &
    nohup kubectl port-forward svc/etcd 2379:2379 >/tmp/pf5 2>&1 &
    nohup kubectl port-forward svc/managerapi 9000:9000 >/tmp/pf6 2>&1 &
    nohup kubectl port-forward svc/upstream 1980:1980 >/tmp/pf7 2>&1 &
    nohup kubectl port-forward svc/upstream 1981:1981 >/tmp/pf8 2>&1 &
    nohup kubectl port-forward svc/upstream 1982:1982 >/tmp/pf9 2>&1 &
    nohup kubectl port-forward svc/upstream 1983:1983 >/tmp/pf10 2>&1 &
    nohup kubectl port-forward svc/upstream 1984:1984 >/tmp/pf11 2>&1 &
}

kill_port_forward() {
    for proc in $(pgrep -f port-forward); do kill $proc; done
}

"$@"
