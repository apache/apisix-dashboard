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
const routes = [
  {
    path: '/',
    component: './Dashboard',
  },
  {
    path: '/dashboard',
    component: './Dashboard',
  },
  {
    path: '/serverinfo',
    component: './ServerInfo',
  },
  {
    path: '/routes/list',
    component: './Route/List',
  },
  {
    path: '/routes/create',
    component: './Route/Create',
  },
  {
    path: '/routes/:rid/edit',
    component: './Route/Create',
  },
  {
    path: '/routes/:rid/duplicate',
    component: './Route/Create',
  },
  {
    path: '/ssl/:id/edit',
    component: './SSL/Create',
  },
  {
    path: '/ssl/list',
    component: './SSL/List',
  },
  {
    path: '/ssl/create',
    component: './SSL/Create',
  },
  {
    path: '/upstream/list',
    component: './Upstream/List',
  },
  {
    path: '/upstream/create',
    component: './Upstream/Create',
  },
  {
    path: '/upstream/:id/edit',
    component: './Upstream/Create',
  },
  {
    path: '/consumer/list',
    component: './Consumer/List',
  },
  {
    path: '/consumer/create',
    component: './Consumer/Create',
  },
  {
    path: '/consumer/:username/edit',
    component: './Consumer/Create',
  },
  {
    path: '/plugin/list',
    component: './Plugin/List',
  },
  {
    path: '/plugin/market',
    component: './Plugin/PluginMarket',
  },
  {
    path: '/service/list',
    component: './Service/List',
  },
  {
    path: '/service/create',
    component: './Service/Create',
  },
  {
    path: '/service/:serviceId/edit',
    component: './Service/Create',
  },
  {
    path: '/proto/list',
    component: './Proto/List',
  },
  {
    path: '/settings',
    component: './Setting',
  },
  {
    path: '/plugin-template/list',
    component: './PluginTemplate/List',
  },
  {
    path: 'plugin-template/create',
    component: './PluginTemplate/Create',
  },
  {
    path: '/plugin-template/:id/edit',
    component: './PluginTemplate/Create',
  },
  {
    path: '/user/login',
    component: './User/Login',
    layout: false,
  },
  {
    path: '/user/logout',
    component: './User/Logout',
    layout: false,
  },
  {
    component: './404',
  },
];

export default routes;
