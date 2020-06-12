import { request } from 'umi';

import { transformStepData, transformRouteData } from './transform';

export const createRoute = (data: Pick<RouteModule.Data, 'data'>) =>
  request(`/routes`, {
    method: 'POST',
    data: transformStepData(data),
  });

export const updateRoute = (rid: number, data: Pick<RouteModule.Data, 'data'>) =>
  request(`/routes/${rid}`, {
    method: 'PUT',
    data: transformStepData(data),
  });

export const fetchRoute = (rid: number) =>
  request(`/routes/${rid}`).then((data) => transformRouteData(data));

export const fetchRouteList = () => request(`/routes?page=1&size=100000`);

export const removeRoute = (rid: number) => request(`/routes/${rid}`, { method: 'DELETE' });

export const fetchPluginList = () => request('/plugins');
