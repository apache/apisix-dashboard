import { request } from 'umi';
import { transformFetchListData, transformFetchItemData } from '@/transforms/global';

export const fetchList = () =>
  request('/ssl').then((data) => transformFetchListData<SSL>(data));

export const fetchItem = (key: string) =>
  request(`/ssl/${key}`).then((data) => transformFetchItemData<SSL>(data));

export const remove = (key: string) =>
  request(`/ssl/${key}`, {
    method: 'DELETE',
  });

export const create = (data: SSL) =>
  request('/ssl', {
    method: 'POST',
    data,
  });
