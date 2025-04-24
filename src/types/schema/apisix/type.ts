import { z } from 'zod';
import type { A6 } from '.';
import type { AxiosResponse } from 'axios';

export type A6ListResponse<T> = {
  list: Array<{
    key: string;
    value: T;
    createdIndex: number;
    modifiedIndex: number;
  }>;
  total: number;
};

type RawA6Type = {
  [K in keyof typeof A6]: z.infer<(typeof A6)[K]>;
};

export type A6Type = RawA6Type & {
  RespRouteList: AxiosResponse<A6ListResponse<A6Type['Route']>>;
  RespUpstreamList: AxiosResponse<A6ListResponse<A6Type['Upstream']>>;
};
