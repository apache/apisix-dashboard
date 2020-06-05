import { request } from 'umi';

import { transformStepData, transformRouteData } from './transform';

export const createRoute = (data: Pick<RouteModule.Data, 'data'>, wid = 0) =>
  request(`/workspaces/${wid}/routes`, {
    method: 'POST',
    data: transformStepData(data),
  });

export const updateRoute = (rid: number, data: Pick<RouteModule.Data, 'data'>, wid = 0) =>
  request(`/workspaces/${wid}/routes/${rid}`, {
    method: 'PUT',
    data: transformStepData(data),
  });

export const fetchRoute = (rid: number, wid = 0) =>
  request(`/workspaces/${wid}/routes/${rid}`).then((data) => transformRouteData(data));

export const fetchRouteList = (wid = 0) => request(`/workspaces/${wid}/routes?page=1&size=100000`);

export const removeRoute = (rid: number, wid = 0) =>
  request(`/workspaces/${wid}/routes/${rid}`, { method: 'DELETE' });
