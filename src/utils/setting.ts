export const getAdminAPIConfig = (): AdminAPIConfig => {
  return {
    schema: localStorage.getItem('GLOBAL_ADMIN_API_SCHEMA') || ADMIN_API_SCHEMA,
    host: localStorage.getItem('GLOBAL_ADMIN_API_HOST') || ADMIN_API_HOST,
    path: localStorage.getItem('GLOBAL_ADMIN_API_PATH') || ADMIN_API_PATH,
    key: localStorage.getItem('GLOBAL_ADMIN_API_KEY') || API_KEY
  };
}
