import {
  API_HEADER_KEY,
  API_PREFIX,
  LOCAL_STORAGE_ADMIN_KEY,
} from '@/config/constant';
import { readLocalStorageValue } from '@mantine/hooks';
import axios from 'axios';
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

req.interceptors.response.use(
  (res) => res,
  (err) => {
    return Promise.reject(err);
  }
);
