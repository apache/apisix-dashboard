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
FROM alpine:latest as pre-build

ARG APISIX_DASHBOARD_VERSION=master

RUN set -x \
    && apk add --no-cache --virtual .builddeps git \
    && git clone https://github.com/FangSen9000/apisix-dashboard.git -b chore-move-yarn-to-pnpm(try1.5) /usr/local/apisix-dashboard \
    && cd /usr/local/apisix-dashboard && git clean -Xdf \
    && rm -f ./.githash && git log --pretty=format:"%h" -1 > ./.githash

FROM golang:1.15 as api-builder

ARG ENABLE_PROXY=false

WORKDIR /usr/local/apisix-dashboard

COPY --from=pre-build /usr/local/apisix-dashboard .

RUN if [ "$ENABLE_PROXY" = "true" ] ; then go env -w GOPROXY=https://goproxy.io,direct ; fi \
    && go env -w GO111MODULE=on \
    && CGO_ENABLED=0 ./api/build.sh

FROM node:14-alpine as fe-builder

ARG ENABLE_PROXY=false

WORKDIR /usr/local/apisix-dashboard

COPY --from=pre-build /usr/local/apisix-dashboard .

WORKDIR /usr/local/apisix-dashboard/web

RUN npm i pnpm -g

RUN npm config set strict-peer-dependencies=false

RUN npm config set auto-install-peers=true

RUN if [ "$ENABLE_PROXY" = "true" ] ; then pnpm config set registry https://registry.npmmirror.com/ ; fi \
    && pnpm install \
    && pnpm build

FROM alpine:latest as prod

ARG ENABLE_PROXY=false

RUN if [ "$ENABLE_PROXY" = "true" ] ; then sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories ; fi

WORKDIR /usr/local/apisix-dashboard

COPY --from=api-builder /usr/local/apisix-dashboard/output/ ./

COPY --from=fe-builder /usr/local/apisix-dashboard/output/ ./

RUN mkdir logs

EXPOSE 9000

CMD [ "/usr/local/apisix-dashboard/manager-api" ]
