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

FROM golang:1.13.8 AS build-env

WORKDIR /go/src/github.com/apisix/manager-api

COPY ./ ./

RUN mkdir -p /go/manager-api/conf \
    && mkdir -p /go/manager-api/build-tools \
    && go env -w GOPROXY=https://goproxy.io,direct \
    && export GOPROXY=https://goproxy.io \
    && go build -o /go/manager-api/manager-api \
    && mv /go/src/github.com/apisix/manager-api/entry.sh /go/manager-api/ \
    && mv /go/src/github.com/apisix/manager-api/build-tools/* /go/manager-api/build-tools/ \
    && mv /go/src/github.com/apisix/manager-api/conf/conf.yaml /go/manager-api/conf/conf.yaml \
    && mv /go/src/github.com/apisix/manager-api/conf/schema.json /go/manager-api/conf/schema.json \
    && rm -rf /go/src/github.com/apisix/manager-api \
    && rm -rf /etc/localtime \
    && ln -s  /usr/share/zoneinfo/Hongkong /etc/localtime \
    && dpkg-reconfigure -f noninteractive tzdata

RUN wget https://github.com/api7/dag-to-lua/archive/v1.1.tar.gz \
    && tar -zxvf v1.1.tar.gz \
    && mkdir -p /go/manager-api/dag-to-lua \
    && mv -u ./dag-to-lua-1.1/lib/* /go/manager-api/dag-to-lua/

FROM alpine:3.11

RUN mkdir -p /go/manager-api \
   && apk update  \
   && apk add ca-certificates \
   && update-ca-certificates \
   && apk add --no-cache libc6-compat \
   && echo "hosts: files dns" > /etc/nsswitch.conf \
   && rm -rf /var/cache/apk/*

RUN apk add lua5.1

WORKDIR /go/manager-api
COPY --from=build-env /go/manager-api/ /go/manager-api/
COPY --from=build-env /usr/share/zoneinfo/Hongkong /etc/localtime

RUN mkdir logs

EXPOSE 8080

RUN chmod +x ./entry.sh

CMD ["/bin/ash", "-c", "/go/manager-api/entry.sh"]
