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
import { request } from 'umi';
import { pickBy, identity } from 'lodash';

import { transformStepData, transformRouteData, transformUpstreamNodes } from './transform';

export const create = (data: Pick<RouteModule.Data, 'data'>) =>
  request(`/routes`, {
    method: 'POST',
    data: transformStepData(data),
  });

export const update = (rid: number, data: Pick<RouteModule.Data, 'data'>) =>
  request(`/routes/${rid}`, {
    method: 'PUT',
    data: transformStepData(data),
  });

export const fetchItem = (rid: number) =>
  request(`/routes/${rid}`).then((data) => transformRouteData(data));

export const fetchList = ({ current = 1, pageSize = 10 }, search: string) => {
  return request('/routes', {
    params: {
      page: current,
      size: pageSize,
      search,
    },
  }).then(({ data, count }) => {
    return {
      data,
      total: count,
    };
  });
};

export const remove = (rid: number) => request(`/routes/${rid}`, { method: 'DELETE' });

export const checkUniqueName = (name = '', exclude = '') =>
  request('/notexist/routes', {
    params: pickBy(
      {
        name,
        exclude,
      },
      identity,
    ),
  });

export const fetchRouteGroupList = () => request(`/names/routegroups`);

export const fetchRouteGroupItem = (gid: string) => {
  return request(`/routegroups/${gid}`).then((data) => {
    return {
      route_group_name: data.name,
      route_group_id: data.id,
    };
  });
};

export const fetchUpstreamList = () => request(`/names/upstreams`);

export const fetchUpstreamItem = (sid: string) => {
  return request(`/upstreams/${sid}`).then(({ nodes, timeout, id }) => {
    return {
      upstreamHostList: transformUpstreamNodes(nodes),
      timeout,
      upstream_id: id,
    };
  });
};

export const checkHostWithSSL = (hosts: string[]) =>
  request('/check_ssl_exists', {
    method: 'POST',
    data: hosts,
  });
