declare namespace Setting {
  interface AdminAPI {
    schema: string;
    host: string;
    path: string;
    key: string;
  }

  interface GrafanaURL {
    grafanaURL: string;
  }
}
