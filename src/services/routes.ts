import request from '@/utils/request';
import { transformFetchListData, transformFetchItemData } from '@/transforms/global';
import { Routes } from "@/models/routes";

export const fetchList = () => request('/api/routes').then(data => transformFetchListData<Routes>(data));

export const fetchItem = (key: string) =>
  request(`/api/routes/${key}`).then(data => transformFetchItemData<Routes>(data));

export const remove = (key: string) => request.delete(`/api/routes/${key}`);

export const create = (data: Routes) =>
  request.post('/api/routes', {
    data,
  });

export const update = (key: string, data: Routes) =>
  request.put(`/api/routes/${key}`, {
    data,
  });
