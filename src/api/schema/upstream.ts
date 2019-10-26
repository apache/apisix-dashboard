/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import request from '@/utils/request'

export const updateStream = (id: string, data: any) =>
  request({
    url: `/upstreams/${id}`,
    method: 'PUT',
    data
  })

export const getUpstream = (id: string) =>
  request({
    url: `/upstreams/${id}`,
    method: 'GET'
  })

export const removeUpstream = (id: string) =>
  request({
    url: `/upstreams/${id}`,
    method: 'DELETE'
  })

export const createUpstream = (data: any) =>
  request({
    url: `/upstreams`,
    method: 'POST',
    data
  })

export const getUpstreamList = () =>
  request({
    url: `/upstreams`,
    method: 'GET'
  })
