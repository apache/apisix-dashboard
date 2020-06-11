export const getGrafanaConfig = (): Setting.GrafanaConfig => {
  return {
    grafanaURL: localStorage.getItem('GLOBAL_ADMIN_SETTING_GRAFANA_URL') || '',
  };
};
