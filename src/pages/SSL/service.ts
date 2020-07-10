import { request } from 'umi';
import querystring from 'querystring';
import { identity, pickBy, omit } from 'lodash';

import { transformFetchItemData } from '@/transforms/global';

type FetchListParams = {
  current?: number;
  pageSize?: number;
  sni?: string;
  expire_range?: string;
  expire_start?: number;
  expire_end?: number;
  status?: 0;
};

export const fetchList = ({ current = 1, pageSize = 10, ...props }: FetchListParams) => {
  const [expire_start, expire_end] = (props.expire_range || '').split(':');
  let queryObj = omit(props, 'expire_range', '_timestamp');
  queryObj = pickBy(Object.assign({}, queryObj, { expire_start, expire_end }), identity);
  const query = querystring.encode(queryObj);
  return request<{ count: number; list: SSLModule.ResSSL[] }>(
    `/ssls?page=${current}&size=${pageSize}&${query}`,
  ).then((data) => {
    return {
      count: data.count,
      data: data.list.map((item) => ({
        ...item,
        sni: item.snis.join(';'),
      })),
    };
  });
};

export const fetchItem = (id: string) =>
  request(`/ssls/${id}`).then((data) => transformFetchItemData<SSLModule.SSL>(data));

export const remove = (id: string) =>
  request(`/ssls/${id}`, {
    method: 'DELETE',
  });

export const create = (data: SSLModule.SSL) =>
  request('/ssls', {
    method: 'POST',
    data,
  });

type VerifyKeyPaireProps = {
  code: string;
  msg: string;
  data: {
    id: string;
    create_time: number;
    update_time: number;
    validity_start: number;
    validity_end: number;
    snis: string[];
    status: number;
  };
};

/**
 * 1. 校验证书是否匹配
 * 2. 解析公钥内容
 * */
export const verifyKeyPaire = (cert = '', key = ''): Promise<VerifyKeyPaireProps> =>
  request('/check_ssl_cert', {
    method: 'POST',
    data: { cert, key },
  });

export const update = (id: string, checked: boolean) =>
  request(`/ssls/${id}`, {
    data: {
      status: Number(checked),
    },
  });
