declare namespace SSLModule {
  type SSL = {
    sni: string[];
    cert: string;
    key: string;
  };

  type ResSSL = {
    id: string;
    create_time: number;
    update_time: number;
    validity_start: number;
    validity_end: number;
    status: number;
    snis: string[];
    public_key: string;
  };
}
