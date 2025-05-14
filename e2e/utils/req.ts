import { type APIRequestContext, request } from '@playwright/test';
import {
  API_HEADER_KEY,
  API_PREFIX,
  API_UPSTREAMS,
  BASE_PATH,
} from '@src/config/constant';
import axios, { type AxiosAdapter, type AxiosInstance } from 'axios';
import { stringify } from 'qs';
import { getAPISIXConf } from './common';
import type { APISIXType } from '@src/types/schema/apisix';
import { env } from './env';
import type { PageSearchType } from '@src/types/schema/pageSearch';

export const getPlaywrightRequestAdapter = (
  ctx: APIRequestContext
): AxiosAdapter => {
  return async (config) => {
    const { url, data, baseURL } = config;
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
    const urlWithBase = `${baseURL}${url}`;
    const res = await ctx.fetch(urlWithBase, payload);

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
  const API_URL = env.E2E_TARGET_URL.slice(0, -BASE_PATH.length - 1);

  return axios.create({
    adapter: getPlaywrightRequestAdapter(ctx),
    baseURL: `${API_URL}${API_PREFIX}`,
    paramsSerializer: (p) =>
      stringify(p, {
        arrayFormat: 'repeat',
      }),
    headers: { [API_HEADER_KEY]: adminKey },
  });
};

export const e2eReq = await getE2eReq(await request.newContext());

