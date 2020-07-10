import { request } from 'umi';

export const fetchList = ({ current = 1, pageSize = 10 }, search: string) =>
  request('/consumers', {
    params: {
      page: current,
      size: pageSize,
      search,
    },
  }).then(({ list, count }) => ({
    data: list,
    total: count,
  }));

export const fetchItem = (id: string) =>
  request<{ data: ConsumerModule.ResEntity }>(`/consumers/${id}`);

export const create = (data: ConsumerModule.Entity) =>
  request('/consumers', {
    method: 'POST',
    data,
  });

export const update = (id: string, data: ConsumerModule.Entity) =>
  request(`/consumers/${id}`, {
    method: 'PUT',
    data,
  });

export const remove = (id: string) => request(`/consumers/${id}`, { method: 'DELETE' });
