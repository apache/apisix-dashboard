import request from '@/utils/request';
import { transformFetchListData, transformFetchItemData } from '@/transforms/global';
import { SSL } from '@/models/ssl';

export const fetchList = () => request('/ssl').then(data => transformFetchListData<SSL>(data));

export const fetchItem = (key: string) =>
  request(`/ssl/${key}`).then(data => transformFetchItemData<SSL>(data));

export const remove = (key: string) => request.delete(`/ssl/${key}`);

export const create = (data: SSL) =>
  request.post('/ssl', {
    data,
  });

export const update = (key: string, data: SSL) =>
  request.put(`/ssl/${key}`, {
    data,
  });
