export const getGrafanaURL = (): Promise<string> =>
  new Promise((resolve) => {
    resolve(localStorage.getItem('GLOBAL_SETTING_GRAFANA_URL') || '');
  });
