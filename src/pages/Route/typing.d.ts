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
    status: boolean;
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
    code?: number;
    uri?: string;
    http_to_https?: boolean;
  };

  // Request Body or Response Data for API
  type Body = {
    id?: number;
    route_group_id: string;
    route_group_name: string;
    status: boolean;
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
    upstream_protocol: 'keep' | 'http' | 'https';
    upstream_header: {
      [key: string]: string;
    };
    plugins: {
      [name: string]: any;
    };
    script: Record<string, any>;
    url?: string;
  };

  // for route debug
  type Server = {
    url: string;
  };

  type RouteParamSchema = {
    type: string | integer | boolean | object | array;
  };

  type RouteParam = {
    name: string;
    in: 'query' | 'header' | 'path' | 'cookie';
    description: string;
    required: boolean;
    style?: 'form' | 'simple';
    explode?: boolean;
    schema?: RouteParamSchema;
  };

  type PathSchema = {
    tags: string;
    summary: string;
    description: string;
    operationId: string;
    requestBody?: object;
    parameters?: RouteParam[];
    responses: ResponseScheme;
  };

  type ResponseSchema = {
    [code: string]: {
      description: string;
      content: ResponseItemContent;
    };
  };

  type ResponseItemContent = {
    'application/xml'?: {};
    'application/json'?: {};
  };

  type TagSchema = {
    name: string;
    description: string;
    externalDocs?: object;
  };

  type DebugData = {
    servers: Server[];
    tag: TagSchema[];
    paths: {
      [url: string]: {
        [httpType: string]: {
          tags: string;
          summary: string;
          operationId: string;
          requestBody?: {};
          parameters?: RouteParam[];
          responses: ResponseSchema;
        };
      };
    };
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
    route_group_id: string | null;
    route_group_name: string;
    priority: number;
    protocols: RequestProtocol[];
    websocket: boolean;
    hosts: string[];
    paths: string[];
    methods: HttpMethod[];
    redirectOption: 'forceHttps' | 'customRedirect' | 'disabled';
    redirectURI?: string;
    redirectCode?: number;
    status: boolean;
  };

  type AvancedMatchingRules = {
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
    upstreamHeaderList: UpstreamHeader[] | undefined;
    disabled?: boolean;
    onChange(data: { action: 'upstreamHeaderListChange'; data: T }): void;
  };

  type Form2Data = {
    upstream_protocol: 'http' | 'https' | 'keep';
    type: 'roundrobin' | 'chash';
    hash_on?: string;
    key?: string;
    mappingStrategy?: string;
    rewriteType?: string;
    upstreamPath?: string;
    upstream_id: string | null;
    timeout: {
      connect: number;
      send: number;
      read: number;
    };
    pass_host: 'pass' | 'node' | 'rewrite';
    upstream_host?: string;
    upstreamHostList: UpstreamHost[];
  };

  type RequestData = {
    form1Data: Form1Data;
    form2Data: Form2Data;
    step3Data: Step3Data;
    upstreamHeaderList: UpstreamHeader[];
    advancedMatchingRules: MatchingRule[];
  };
}
