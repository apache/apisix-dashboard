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

FROM node:22-alpine AS base

# install deps
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN \
  if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install; \
  else echo 'Lockfile not found.' && exit 1; \
  fi

# build ui
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# we need git to get commit sha
RUN apk add --no-cache git
RUN corepack enable pnpm && pnpm build

# embed dashboard ui into apisix
FROM apache/apisix:dev
COPY --from=builder /app/dist /usr/local/apisix/ui/
