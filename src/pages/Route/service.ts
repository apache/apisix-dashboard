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
