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
declare namespace RouteModule {
  type Operator = '==' | '~=' | '>' | '<' | '~~';

  type VarPosition = 'arg' | 'http' | 'cookie';

  interface MatchingRule {
    position: VarPosition;
    name: string;
    operator: Operator;
    value: string;
    key: string;
  }

  type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATCH';
  type RequestProtocol = 'https' | 'http' | 'websocket';

  type BaseData = {
    id?: number;
    name: string;
    desc: string;
    uris: string[];
    hosts: string[];
  };

  type Step1Data = {
    name: string;
    desc: string;
    priority: number;
    protocols: RequestProtocol[];
    websocket: boolean;
    hosts: string[];
    paths: string[];
    methods: HttpMethod[];
    redirectOption: 'forceHttps' | 'customRedirect' | 'disabled';
    redirectURI?: string;
    redirectCode?: number;
    advancedMatchingRules: MatchingRule[];
  };

  type Step3Data = {
    plugins: PluginPage.PluginData;
  };

  interface Data {
    disabled?: boolean;
    data: {
      step1Data: Step1Data;
      step2Data: Step2Data;
      step3Data: Step3Data;
    };
    onChange(data: T): void;
  }

  type UpstreamHost = {
    host: string;
    port: number;
    weight: number;
  };

  interface UpstreamHeader {
    header_name: string;
    header_value: string;
  }

  interface UpstreamHeader {
    key: string;
  }

  type Step2Data = {
    upstream_protocol: 'http' | 'https' | 'keep';
    upstreamHostList: UpstreamHost[];
    mappingStrategy: string | undefined;
    rewriteType: string | undefined;
    upstreamPath: string | undefined;
    upstreamHeaderList: UpstreamHeader[];
    upstream_id?: string;
    timeout: {
      connect: number;
      send: number;
      read: number;
    };
  };

  type ModalType = 'CREATE' | 'EDIT';

  type Redirect = {
    code?: number;
    uri?: string;
    http_to_https?: boolean;
  };

  // Request Body or Response Data for API
  type Body = {
    id?: number;
    name: string;
    desc: string;
    priority?: number;
    methods: HttpMethod[];
    uris: string[];
    hosts: string[];
    protocols: RequestProtocol[];
    redirect?: Redirect;
    vars: [string, Operator, string][];
    upstream: {
      type: 'roundrobin' | 'chash';
      nodes: {
        [key: string]: number;
      };
      timeout: {
        connect: number;
        send: number;
        read: number;
      };
    };
    upstream_path?: {
      type?: string;
      from?: string;
      to: string;
    };
    upstream_id?: string;
    upstream_protocol: 'keep' | 'http' | 'https';
    upstream_header: {
      [key: string]: string;
    };
    plugins: {
      [name: string]: any;
    };
  };
}
