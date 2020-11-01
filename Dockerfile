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

FROM golang:1.14 as api-builder

WORKDIR /go/src/app

COPY ./api .

RUN mkdir -p /go/output/conf \
    && cp ./conf/*.json /go/output/conf

RUN wget https://github.com/api7/dag-to-lua/archive/v1.1.tar.gz \
    && tar -zxvf v1.1.tar.gz \
    && mkdir -p /go/output/dag-to-lua \
    && mv -u ./dag-to-lua-1.1/lib/* /go/output/dag-to-lua/

RUN go build -o /go/output/manager-api .

FROM node:14-alpine as fe-builder

WORKDIR /frontend/app

COPY ./frontend/package.json .

COPY ./frontend/yarn.lock .

RUN yarn install

COPY ./frontend .

RUN yarn build

FROM alpine:latest as prod

RUN apk update \
    && apk add lua5.1

WORKDIR /app

COPY --from=api-builder /go/output .
COPY --from=fe-builder /frontend/output .

EXPOSE 8080

RUN chmod +x ./manager-api

CMD [ "/bin/ash", "-c", "./manager-api" ]