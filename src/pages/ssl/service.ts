import { request } from 'umi';
import { transformFetchItemData } from '@/transforms/global';

type FetchListParams = {
  current: number;
  pageSize: number;
};

export const fetchList = (params?: Partial<FetchListParams>) =>
  request<{ count: number; list: SSLModule.ResSSL[] }>(
    `/ssls?page=${params?.current || 1}&size=${params?.pageSize || 10}`,
  ).then((data) => {
    return {
      count: data.count,
      data: data.list.map((item) => ({
        ...item,
        sni: item.snis.join(';'),
      })),
    };
  });

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
