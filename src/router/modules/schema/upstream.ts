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

import { RouteConfig } from 'vue-router'
import Layout from '@/layout/index.vue'

const tableUpstream: RouteConfig = {
  path: '/schema/upstream',
  component: Layout,
  name: 'SchemaUpstream',
  meta: {
    title: 'SchemaUpstream',
    icon: 'table'
  },
  redirect: '/schema/upstream/list',
  children: [
    {
      path: 'list',
      component: () => import('@/views/schema/upstream/list.vue'),
      name: 'SchemaUpstreamList',
      meta: { title: 'SchemaUpstreamList' }
    }, {
      path: 'edit/:id',
      component: () => import('@/views/schema/upstream/edit.vue'),
      name: 'SchemaUpstreamEdit',
      meta: {
        title: 'SchemaUpstreamEdit',
        hidden: true
      }
    }, {
      path: 'create',
      component: () => import('@/views/schema/upstream/edit.vue'),
      name: 'SchemaUpstreamCreate',
      meta: {
        title: 'SchemaUpstreamCreate',
        hidden: true
      }
    }
  ]
}

export default tableUpstream
