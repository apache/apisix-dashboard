import {
  ADMIN_API_HOST,
  ADMIN_API_SCHEMA,
  ADMIN_API_PATH,
  API_KEY,
  API_REQUEST_PREFIX,
} from './constant';

export const getAdminAPIConfig = (): SettingModule.AdminAPIConfig => {
  return {
    schema: localStorage.getItem('GLOBAL_ADMIN_API_SCHEMA') || ADMIN_API_SCHEMA,
    host: localStorage.getItem('GLOBAL_ADMIN_API_HOST') || ADMIN_API_HOST,
    path: localStorage.getItem('GLOBAL_ADMIN_API_PATH') || ADMIN_API_PATH,
    prefix: API_REQUEST_PREFIX,
    key: localStorage.getItem('GLOBAL_ADMIN_API_KEY') || API_KEY,
  };
};

export const getRequestPrefix = () => {
  if (process.env.NODE_ENV === 'development') {
    return '/api';
  }
  return '';
};
