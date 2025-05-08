/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import type { AxiosResponse } from 'axios';
import { z } from 'zod';

import type { APISIX } from '.';

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
  RespSecretList: AxiosResponse<APISIXListResponse<APISIXType['Secret']>>;
  RespSecretItem: APISIXType['RespSecretList']['data']['list'][number];
  RespSecretDetail: AxiosResponse<APISIXDetailResponse<APISIXType['Secret']>>;
  RespConsumerList: AxiosResponse<APISIXListResponse<APISIXType['Consumer']>>;
  RespConsumerItem: APISIXType['RespConsumerList']['data']['list'][number];
  RespConsumerDetail: AxiosResponse<
    APISIXDetailResponse<APISIXType['Consumer']>
  >;
  RespConsumerGroupList: AxiosResponse<
    APISIXListResponse<APISIXType['ConsumerGroup']>
  >;
  RespConsumerGroupItem: APISIXType['RespConsumerGroupList']['data']['list'][number];
  RespConsumerGroupDetail: AxiosResponse<
    APISIXDetailResponse<APISIXType['ConsumerGroup']>
  >;
  RespCredentialList: AxiosResponse<
    APISIXListResponse<APISIXType['Credential']>
  >;
  RespCredentialItem: APISIXType['RespCredentialList']['data']['list'][number];
  RespCredentialDetail: AxiosResponse<
    APISIXDetailResponse<APISIXType['Credential']>
  >;
  RespPluginConfigList: AxiosResponse<
    APISIXListResponse<APISIXType['PluginConfig']>
  >;
  RespPluginConfigItem: APISIXType['RespPluginConfigList']['data']['list'][number];
  RespPluginConfigDetail: AxiosResponse<
    APISIXDetailResponse<APISIXType['PluginConfig']>
  >;
  RespPluginList: AxiosResponse<string[]>;
  RespPluginSchema: AxiosResponse<APISIXType['PluginSchema']>;
  RespPlugins: AxiosResponse<APISIXType['Plugins']>;
  RespPluginMetadataDetail: AxiosResponse<
    APISIXDetailResponse<APISIXType['PluginMetadata']>
  >;
  RespSSLList: AxiosResponse<APISIXListResponse<APISIXType['SSL']>>;
  RespSSLItem: APISIXType['RespSSLList']['data']['list'][number];
  RespSSLDetail: AxiosResponse<APISIXDetailResponse<APISIXType['SSL']>>;
};
