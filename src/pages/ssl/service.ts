import { request } from 'umi';
import { transformFetchListData, transformFetchItemData } from '@/transforms/global';

export const fetchList = () =>
  request('/ssls').then((data) => transformFetchListData<SSLModule.SSL>(data));

export const fetchItem = (key: string) =>
  request(`/ssl/${key}`).then((data) => transformFetchItemData<SSLModule.SSL>(data));

export const remove = (key: string) =>
  request(`/ssl/${key}`, {
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
