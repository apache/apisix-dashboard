export const getSetting = (): Setting.AdminAPI & Setting.GrafanaConfig => {
  return {
    baseURL:
      localStorage.getItem('GLOBAL_SETTING_API_BASE_URL') || 'http://127.0.0.1:8080/apisix/admin',
    grafanaURL: localStorage.getItem('GLOBAL_SETTING_GRAFANA_URL') || '',
  };
};
