import {
  API_HEADER_KEY,
  API_PREFIX,
  LOCAL_STORAGE_ADMIN_KEY,
  SKIP_INTERCEPTOR_HEADER,
} from '@/config/constant';
import { readLocalStorageValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import axios, { AxiosError } from 'axios';
import { stringify } from 'qs';

export const req = axios.create();

req.interceptors.request.use((conf) => {
  conf.paramsSerializer = (p) =>
    stringify(p, {
      arrayFormat: 'repeat',
    });
  conf.baseURL = API_PREFIX;
  conf.headers.set(
    API_HEADER_KEY,
    readLocalStorageValue({ key: LOCAL_STORAGE_ADMIN_KEY })
  );
  return conf;
});

type APISIXRespErr = {
  error_msg: string;
};

/**
 * use request header `[SKIP_INTERCEPTOR_HEADER]: ['404', ...]` to skip interceptor for specific status code.
 */
const matchSkipInterceptor = (err: AxiosError) => {
  const interceptors = err.config?.headers?.[SKIP_INTERCEPTOR_HEADER] || [];
  const status = err.response?.status;
  return interceptors.some((v: string) => v === String(status));
};

req.interceptors.response.use(
  (res) => {
    // it's a apisix design
    // when list is empty, it will be a object
    // but we need a array
    if (
      res.data?.list &&
      !Array.isArray(res.data.list) &&
      Object.keys(res.data.list).length === 0
    ) {
      res.data.list = [];
    }
    return res;
  },
  (err) => {
    if (err.response) {
      if (matchSkipInterceptor(err)) return Promise.reject(err);
      const d = err.response.data as APISIXRespErr;
      notifications.show({
        id: d.error_msg,
        message: d.error_msg,
        color: 'red',
      });
    }
    return Promise.reject(err);
  }
);
