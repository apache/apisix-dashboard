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

  type RequestProtocol = 'https' | 'http' | 'websocket';

  type BaseData = {
    id?: number;
    name: string;
    desc: string;
    uris: string[];
    hosts: string[];
    status: number;
  };

  type Step3Data = {
    plugins: PluginPage.PluginData;
    //  TEMP
    script: any;
  };

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

  type ModalType = 'CREATE' | 'EDIT';

  type Redirect = {
    ret_code?: number;
    uri?: string;
    http_to_https?: boolean;
  };

  // Request Body or Response Data for API
  type Body = {
    id?: number;
    status: number;
    name: string;
    desc: string;
    priority?: number;
    methods: HttpMethod[];
    uri?: string;
    uris: string[];
    host?: string;
    hosts: string[];
    remote_addrs: string[];
    vars: [string, Operator, string][];
    upstream: {
      type: 'roundrobin' | 'chash';
      hash_on?: string;
      key?: string;
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
    plugins: {
      [name: string]: any;
    };
    script: Record<string, any>;
    url?: string;
    enable_websocket?: boolean;
    service_id?: string;
  };

  // step1
  interface MatchingRule {
    position: VarPosition;
    name: string;
    operator: Operator;
    value: string;
    key: string;
  }

  type Step1PassProps = {
    form: FormInstance;
    advancedMatchingRules: MatchingRule[];
    disabled?: boolean;
    isEdit?: boolean;
    onChange?(data: {
      action: 'redirectOptionChange' | 'advancedMatchingRulesChange';
      data: T;
    }): void;
  };

  type Form1Data = {
    name: string;
    desc: string;
    priority: number;
    websocket: boolean;
    hosts: string[];
    uris: string[];
    remote_addrs: string[];
    methods: HttpMethod[];
    redirectOption: 'forceHttps' | 'customRedirect' | 'disabled';
    redirectURI?: string;
    ret_code?: number;
    status: number;
    enable_websocket?: boolean;
    service_id: string;
  };

  type AdvancedMatchingRules = {
    advancedMatchingRules: MatchingRule[];
  };

  // step2
  type UpstreamHeader = {
    key: string;
    header_name: string;
    header_value: string;
  };

  type Step2PassProps = {
    form: FormInstance;
    disabled?: boolean;
    upstreamRef: any;
  };

  type Form2Data = {
    type: 'roundrobin' | 'chash';
    hash_on?: string;
    key?: string;
    upstreamPath?: string;
    upstream_id?: string | null;
    timeout: {
      connect: number;
      send: number;
      read: number;
    };
    nodes: {
      [key: string]: number;
    };
  };

  type RequestData = {
    form1Data: Form1Data;
    form2Data: Form2Data;
    step3Data: Step3Data;
    advancedMatchingRules: MatchingRule[];
  };

  type RequestBody = {
    name?: string;
    desc?: string;
    uri: string;
    host?: string;
    hosts?: string[];
    remote_addr?: string;
    remote_addrs?: string[];
    methods?: HttpMethod[];
    priority?: number;
    vars?: [string, Operator, string][];
    filter_func?: string;
    plugins?: Record<string, any>;
    script?: Record<string, any>;
    // TODO:
    upstream?: any;
    upstream_id?: string;
    service_id?: string;
    service_protocol?: 'grpc' | 'http';
  };

  type ResponseBody = {
    hosts: string[];
    id: string;
    methods: HttpMethod[];
    name: string;
    remote_addrs: string[];
    script: any;
    desc?: string;
    upstream: {
      checks: UpstreamModule.HealthCheck;
      create_time: number;
      k8s_deployment_info: UpstreamModule.K8SDeploymentInfo;
      id: string;
      nodes: {
        port: number;
      }[];
      timeout: UpstreamModule.Timeout;
      type: UpstreamModule.Type;
    };
    uri: string;
    uris?: string[];
    host: string;
    hosts?: string[];
    create_time: number;
    update_time: number;
    status: number;
  };

  type RouteStatus = 0 | 1;

  // TODO： grpc and websocket
  type debugRequest = {
    url: string;
    request_protocol: 'http' | 'grpc' | 'websocket';
    method: string;
    body_params?: any;
    header_params?: any;
  };
  type authData = {
    authType: string;
    username?: string;
    password?: string;
    Authorization?: string;
    apikey?: string;
  };
  type debugRequestParamsFormData = {
    check: boolean;
    key: string;
    value: string;
  };
  type DebugViewProps = {
    form: FormInstance;
  };
  type DebugDrawProps = {
    visible: boolean;
    onClose(): void;
  };
}
