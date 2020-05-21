import { request } from 'umi';
import { transformFetchListData, transformFetchItemData } from '@/transforms/global';

export const fetchList = () =>
  request('/api/ssl').then((data) => transformFetchListData<SSL>(data));

export const fetchItem = (key: string) =>
  request(`/api/ssl/${key}`).then((data) => transformFetchItemData<SSL>(data));

export const remove = (key: string) =>
  request(`/api/ssl/${key}`, {
    method: 'DELETE',
  });

export const create = (data: SSL) =>
  request('/api/ssl', {
    method: 'POST',
    data,
  });
