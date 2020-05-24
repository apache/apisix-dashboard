export const getRequestPrefix = () => {
  if (process.env.NODE_ENV === 'development') {
    return '/api';
  }
  return '';
};

export const getAdminAPIConfig = (): SettingModule.AdminAPIConfig => {
  return {
    schema: localStorage.getItem('GLOBAL_ADMIN_API_SCHEMA') || 'http',
    host: localStorage.getItem('GLOBAL_ADMIN_API_HOST') || '127.0.0.1:9080',
    path: localStorage.getItem('GLOBAL_ADMIN_API_PATH') || '/apisix/admin',
    prefix: getRequestPrefix(),
    key: localStorage.getItem('GLOBAL_ADMIN_API_KEY') || '',
  };
};
