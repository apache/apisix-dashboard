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

RUN mkdir -p /usr/local/apisix-dashboard/api

WORKDIR /usr/local/apisix-dashboard/api

COPY . .

RUN mkdir -p ../output/conf \
    && cp ./conf/* ../output/conf

RUN wget https://github.com/api7/dag-to-lua/archive/v1.1.tar.gz -O /tmp/v1.1.tar.gz \
    && mkdir /tmp/dag-to-lua \
    && tar -xvf /tmp/v1.1.tar.gz -C /tmp/dag-to-lua --strip 1 \
    && mkdir -p ../output/dag-to-lua \
    && mv /tmp/dag-to-lua/lib/* ../output/dag-to-lua/

RUN go env -w GO111MODULE=on \
    && go env -w GOPROXY=https://goproxy.io,direct \
    && CGO_ENABLED=0 go build -o ../output/manager-api .


FROM alpine:latest as prod

RUN apk add lua5.1

WORKDIR /usr/local/apisix-dashboard

COPY --from=build-env /usr/local/apisix-dashboard/output/ ./

EXPOSE 8080

CMD [ "/usr/local/apisix-dashboard/manager-api" ]
