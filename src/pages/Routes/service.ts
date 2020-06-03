import { request } from 'umi';

import { transformStepData } from './transform';

export const createRoute = (data: Pick<RouteModule.Data, 'data'>) => {
  return request('/workspaces/default/routes', {
    method: 'POST',
    data: transformStepData(data),
  });
};

export const updateRoute = () => {};
