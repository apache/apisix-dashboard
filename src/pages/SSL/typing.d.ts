/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
