import { request } from 'umi';

import { transformStepData } from './transform';

export const createRoute = (data: Pick<RouteModule.Data, 'data'>) => {
  return request('/workspaces/default/routes', { data: transformStepData(data) });
};

export const updateRoute = () => {};
