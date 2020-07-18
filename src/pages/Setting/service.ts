export const updateMonitorURL = (url = '') =>
  new Promise((resolve) => {
    localStorage.setItem('GLOBAL_SETTING_GRAFANA_URL', url);
    resolve();
  });
