import { request } from 'umi';
import { transformFetchListData, transformFetchItemData } from '@/transforms/global';

export const fetchList = () =>
import { request } from 'umi';
import { transformFetchListData, transformFetchItemData } from '@/transforms/global';

export const fetchList = () =>
  request('/ssl').then((data) => transformFetchListData<SSL>(data));
  request('/api/ssl').then((data) => transformFetchListData<SSLModule.SSL>(data));

export const fetchItem = (key: string) =>

export const fetchItem = (key: string) =>
  request(`/ssl/${key}`).then((data) => transformFetchItemData<SSL>(data));
  request(`/api/ssl/${key}`).then((data) => transformFetchItemData<SSLModule.SSL>(data));

export const remove = (key: string) =>
  request(`/ssl/${key}`, {
    method: 'DELETE',
  });

export const create = (data: SSLModule.SSL) =>
  request('/api/ssl', {
  request('/ssl', {
    method: 'POST',
    data,
  });
