import { z } from 'zod';
import type { A6 } from '.';
import type { AxiosResponse } from 'axios';

export type A6DetailResponse<T> = {
  key: string;
  value: T;
  createdIndex: number;
  modifiedIndex: number;
};
export type A6ListResponse<T> = {
  list: Array<A6DetailResponse<T>>;
  total: number;
};

type RawA6Type = {
  [K in keyof typeof A6]: z.infer<(typeof A6)[K]>;
};

export type A6Type = RawA6Type & {
  RespRouteList: AxiosResponse<A6ListResponse<A6Type['Route']>>;
  RespUpstreamList: AxiosResponse<A6ListResponse<A6Type['Upstream']>>;
  RespUpstreamItem: A6Type['RespUpstreamList']['data']['list'][number];
  RespProtoList: AxiosResponse<A6ListResponse<A6Type['Proto']>>;
  RespProtoItem: A6Type['RespProtoList']['data']['list'][number];
  RespProtoDetail: AxiosResponse<A6DetailResponse<A6Type['Proto']>>;
};
