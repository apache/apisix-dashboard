import { z } from 'zod';
import type { APISIX } from '.';
import type { AxiosResponse } from 'axios';

export type APISIXDetailResponse<T> = {
  key: string;
  value: T;
  createdIndex: number;
  modifiedIndex: number;
};
export type APISIXListResponse<T> = {
  list: Array<APISIXDetailResponse<T>>;
  total: number;
};

type RawAPISIXType = {
  [K in keyof typeof APISIX]: z.infer<(typeof APISIX)[K]>;
};

export type APISIXType = RawAPISIXType & {
  RespRouteList: AxiosResponse<APISIXListResponse<APISIXType['Route']>>;
  RespRouteItem: APISIXType['RespRouteList']['data']['list'][number];
  RespRouteDetail: AxiosResponse<APISIXDetailResponse<APISIXType['Route']>>;
  RespStreamRouteList: AxiosResponse<
    APISIXListResponse<APISIXType['StreamRoute']>
  >;
  RespStreamRouteItem: APISIXType['RespRouteList']['data']['list'][number];
  RespStreamRouteDetail: AxiosResponse<
    APISIXDetailResponse<APISIXType['StreamRoute']>
  >;
  RespUpstreamList: AxiosResponse<APISIXListResponse<APISIXType['Upstream']>>;
  RespUpstreamItem: APISIXType['RespUpstreamList']['data']['list'][number];
  RespUpstreamDetail: AxiosResponse<
    APISIXDetailResponse<APISIXType['Upstream']>
  >;
  RespServiceList: AxiosResponse<APISIXListResponse<APISIXType['Service']>>;
  RespServiceItem: APISIXType['RespServiceList']['data']['list'][number];
  RespServiceDetail: AxiosResponse<APISIXDetailResponse<APISIXType['Service']>>;
  RespProtoList: AxiosResponse<APISIXListResponse<APISIXType['Proto']>>;
  RespProtoItem: APISIXType['RespProtoList']['data']['list'][number];
  RespProtoDetail: AxiosResponse<APISIXDetailResponse<APISIXType['Proto']>>;
  RespGlobalRuleList: AxiosResponse<
    APISIXListResponse<APISIXType['GlobalRule']>
  >;
  RespGlobalRuleItem: APISIXType['RespGlobalRuleList']['data']['list'][number];
  RespGlobalRuleDetail: AxiosResponse<
    APISIXDetailResponse<APISIXType['GlobalRule']>
  >;
  RespPluginList: AxiosResponse<string[]>;
  RespPluginSchema: AxiosResponse<APISIXType['PluginSchema']>;
  RespPlugins: AxiosResponse<APISIXType['Plugins']>;
  RespPluginMetadataDetail: AxiosResponse<
    APISIXDetailResponse<APISIXType['PluginMetadata']>
  >;
};
