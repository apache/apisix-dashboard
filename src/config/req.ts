import {
  API_HEADER_KEY,
  API_PREFIX,
  LOCAL_STORAGE_ADMIN_KEY,
} from '@/config/constant';
import { readLocalStorageValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
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

type A6RespErr = {
  error_msg: string;
};

req.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response) {
      const d = err.response.data as A6RespErr;
      notifications.show({
        id: d.error_msg,
        message: d.error_msg,
        color: 'red',
      });
      console.log(d);
    }
    return Promise.reject(err);
  }
);
