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

const tableRoutes: RouteConfig = {
  path: '/schema/consumers',
  component: Layout,
  name: 'SchemaConsumers',
  meta: {
    title: 'SchemaConsumers',
    icon: 'table'
  },
  redirect: '/schema/consumers/list',
  children: [
    {
      path: 'list',
      component: () => import(/* webpackChunkName: "complex-table" */ '@/views/schema/consumers/list.vue'),
      name: 'SchemaConsumersList',
      meta: { title: 'SchemaConsumersList' }
    }, {
      path: 'edit/:username',
      component: () => import('@/views/schema/consumers/edit.vue'),
      name: 'SchemaConsumersEdit',
      meta: {
        title: 'SchemaConsumersEdit',
        hidden: true
      }
    }, {
      path: 'create',
      component: () => import('@/views/schema/consumers/edit.vue'),
      name: 'SchemaConsumersCreate',
      meta: {
        title: 'SchemaConsumersCreate',
        hidden: true
      }
    }
  ]
}

export default tableRoutes
