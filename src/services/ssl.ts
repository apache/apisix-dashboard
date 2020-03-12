import request from '@/utils/request';
import { transformFetchListData, transformFetchItemData } from '@/transforms/global';
import { SSL } from '@/models/ssl';

export const fetchList = () => request('/api/ssl').then(data => transformFetchListData<SSL>(data));

export const fetchItem = (id: number) =>
  request(`/api/ssl/${id}`).then(data => transformFetchItemData<SSL>(data));

export const remove = (id: number) => request.delete(`/api/ssl/${id}`);

export const create = (data: SSL) =>
  request.post('/api/ssl', {
    data,
  });

export const update = (id: number, data: SSL) =>
  request.put(`/api/ssl/${id}`, {
    data,
  });
