/*
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
/* eslint-disable @typescript-eslint/naming-convention */
import { request } from 'umi';
import querystring from 'querystring';
import { identity, pickBy, omit } from 'lodash';

export const fetchList = (
  { current = 1, pageSize = 10, ...props }: SSLModule.FetchListParams,
  search: string,
) => {
  const [expire_start, expire_end] = (props.expire_range || '').split(':');
  let queryObj = omit(props, 'expire_range', '_timestamp');
  queryObj = pickBy({ ...queryObj, expire_start, expire_end, sni: search }, identity);
  const query = querystring.encode(queryObj);
  return request<{ count: number; list: SSLModule.ResSSL[] }>(
    `/ssls?page=${current}&size=${pageSize}&${query}`,
  ).then((data) => {
    return {
      total: data.count,
      data: data.list.map((item) => ({
        ...item,
        sni: item.snis.join(';'),
      })),
    };
  });
};

export const remove = (id: string) =>
  request(`/ssls/${id}`, {
    method: 'DELETE',
  });

export const create = (data: SSLModule.SSL) =>
  request('/ssls', {
    method: 'POST',
    data,
  });

/**
 * 1. 校验证书是否匹配
 * 2. 解析公钥内容
 * */
export const verifyKeyPaire = (cert = '', key = ''): Promise<SSLModule.VerifyKeyPaireProps> =>
  request('/check_ssl_cert', {
    method: 'POST',
    data: { cert, key },
  });

export const switchEnable = (id: string, checked: boolean) =>
  request(`/ssls/${id}`, {
    method: 'PATCH',
    data: {
      status: Number(checked),
    },
  });

export const update = (id: string, data: SSLModule.SSL) =>
  request(`/ssls/${id}`, {
    method: 'PUT',
    data,
  });
