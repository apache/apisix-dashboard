import { request } from 'umi';

export const fetchList = ({ current = 1, pageSize = 10 }, search: string) =>
  request('/upstreams', {
    params: {
      page: current,
      size: pageSize,
      search,
    },
  }).then(({ data, count }) => ({
    data,
    total: count,
  }));

export const fetchOne = (id: string) => request<UpstreamModule.ResEntity>(`/upstreams/${id}`);

export const create = (data: UpstreamModule.Entity) =>
  request('/upstreams', {
    method: 'POST',
    data,
  });

export const update = (id: string, data: UpstreamModule.Entity) =>
  request(`/upstreams/${id}`, {
    method: 'PUT',
    data,
  });

export const remove = (id: string) => request(`/upstreams/${id}`, { method: 'DELETE' });
