export const getGrafanaConfig = (): string => {
  return localStorage.getItem('GLOBAL_ADMIN_SETTING_GRAFANA_URL') || '';
};
