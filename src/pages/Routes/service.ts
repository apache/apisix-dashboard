import { request } from 'umi';

import { transformStepData, transformRouteData } from './transform';

export const createRoute = (data: Pick<RouteModule.Data, 'data'>) =>
  request('/workspaces/default/routes', {
    method: 'POST',
    data: transformStepData(data),
  });

export const updateRoute = (rid: number, data: Pick<RouteModule.Data, 'data'>, wid: number = 0) =>
  request(`/workspaces/${wid}/routes/${rid}`, {
    method: 'PUT',
    data: transformStepData(data),
  });

export const fetchRoute = (rid: number, wid: number = 0) =>
  request(`/workspaces/${wid}/routes/${rid}`).then((data) => transformRouteData(data));
