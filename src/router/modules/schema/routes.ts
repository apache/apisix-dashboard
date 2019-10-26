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
  path: '/schema/routes',
  component: Layout,
  name: 'SchemaRoutes',
  meta: {
    title: 'SchemaRoutes',
    icon: 'table'
  },
  redirect: '/schema/routes/list',
  children: [
    {
      path: 'list',
      component: () => import('@/views/schema/routes/list.vue'),
      name: 'SchemaRoutesList',
      meta: { title: 'SchemaRoutesList' }
    }, {
      path: 'edit/:id',
      component: () => import('@/views/schema/routes/edit.vue'),
      name: 'SchemaRoutesEdit',
      meta: {
        title: 'SchemaRoutesEdit',
        hidden: true
      }
    }, {
      path: 'create',
      component: () => import('@/views/schema/routes/edit.vue'),
      name: 'SchemaRoutesCreate',
      meta: {
        title: 'SchemaRoutesCreate',
        hidden: true
      }
    }
  ]
}

export default tableRoutes
