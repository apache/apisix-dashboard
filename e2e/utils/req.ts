import { type APIRequestContext, request } from '@playwright/test';
import {
  API_HEADER_KEY,
  API_PREFIX,
  API_UPSTREAMS,
} from '@src/config/constant';
import axios, { type AxiosAdapter, type AxiosInstance } from 'axios';
import { stringify } from 'qs';
import { getAPISIXConf } from './common';
import type { APISIXType } from '@src/types/schema/apisix';

export const getPlaywrightRequestAdapter = (
  ctx: APIRequestContext
): AxiosAdapter => {
  return async (config) => {
    const { url, data } = config;
    if (typeof url === 'undefined') {
      throw new Error('Need to provide a url');
    }

    type Payload = Parameters<APIRequestContext['fetch']>[1];
    const payload: Payload = {
      headers: config.headers,
      method: config.method,
      failOnStatusCode: true,
      data,
    };
    const res = await ctx.fetch(config.url, payload);

    try {
      return {
        ...res,
        data: await res.json(),
        config,
        status: res.status(),
        statusText: res.statusText(),
        headers: res.headers(),
      };
    } finally {
      await res.dispose();
    }
  };
};

export const getE2eReq = async (ctx: APIRequestContext) => {
  const { adminKey } = await getAPISIXConf();
  return axios.create({
    adapter: getPlaywrightRequestAdapter(ctx),
    baseURL: API_PREFIX,
    headers: {
      [API_HEADER_KEY]: adminKey,
    },
    paramsSerializer: (p) =>
      stringify(p, {
        arrayFormat: 'repeat',
      }),
  });
};

export const e2eReq = await getE2eReq(await request.newContext());

/**
 * TODO: below methods need to be merged with the one in src
 */
export const putUpstreamReq = (
  req: AxiosInstance,
  data: APISIXType['Upstream']
) => {
  const { id, ...rest } = data;
  return req.put<APISIXType['Upstream'], APISIXType['RespUpstreamDetail']>(
    `${API_UPSTREAMS}/${id}`,
    rest
  );
};
