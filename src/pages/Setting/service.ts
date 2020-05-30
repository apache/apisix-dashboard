export const getAdminAPIConfig = (): Setting.AdminAPI => {
  return {
    schema: localStorage.getItem('GLOBAL_ADMIN_API_SCHEMA') || 'http',
    host: localStorage.getItem('GLOBAL_ADMIN_API_HOST') || '127.0.0.1:9080',
    path: localStorage.getItem('GLOBAL_ADMIN_API_PATH') || '/apisix/admin',
    key: localStorage.getItem('GLOBAL_ADMIN_API_KEY') || '',
  };
};
