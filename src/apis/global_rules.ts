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

import type { AxiosInstance } from 'axios';

import { API_GLOBAL_RULES } from '@/config/constant';
import type { APISIXType } from '@/types/schema/apisix';

export const getGlobalRuleListReq = (req: AxiosInstance) =>
  req
    .get<unknown, APISIXType['RespGlobalRuleList']>(API_GLOBAL_RULES)
    .then((v) => v.data);

export const getGlobalRuleReq = (req: AxiosInstance, id: string) =>
  req
    .get<unknown, APISIXType['RespGlobalRuleDetail']>(
      `${API_GLOBAL_RULES}/${id}`
    )
    .then((v) => v.data);

export const putGlobalRuleReq = (
  req: AxiosInstance,
  data: APISIXType['GlobalRulePut']
) => {
  const { id, ...rest } = data;
  return req.put<
    APISIXType['GlobalRulePut'],
    APISIXType['RespGlobalRuleDetail']
  >(`${API_GLOBAL_RULES}/${id}`, rest);
};
