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

  type UploadPublicSuccessData = {
    cert: string;
    publicKeyList: UploadFile[];
  };

  type UploadPrivateSuccessData = {
    key: string;
    privateKeyList: UploadFile[];
  };

  type VerifyKeyPaireProps = {
    code: string;
    msg: string;
    data: {
      id: string;
      create_time: number;
      update_time: number;
      validity_start: number;
      validity_end: number;
      snis: string[];
      status: number;
    };
  };

  type FetchListParams = {
    current?: number;
    pageSize?: number;
    sni?: string;
    expire_range?: string;
    expire_start?: number;
    expire_end?: number;
    status?: 0;
  };
}
