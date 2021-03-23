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
export const HTTP_METHOD_OPTION_LIST: HttpMethod[] = [
  'GET',
  'HEAD',
  'POST',
  'PUT',
  'DELETE',
  'OPTIONS',
  'PATCH',
];

export const FORM_ITEM_LAYOUT = {
  labelCol: {
    span: 3,
  }
};

export const FORM_ITEM_WITHOUT_LABEL = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 20, offset: 3 },
  },
};

export enum SCHEME_REWRITE {
  KEEP = 'keep',
  HTTP = 'http',
  HTTPS = 'https',
}
export enum URI_REWRITE_TYPE {
  KEEP = 0,
  STATIC,
  REGEXP,
}
export enum HOST_REWRITE_TYPE {
  KEEP = 0,
  REWRITE,
}

export const DEFAULT_STEP_1_DATA: RouteModule.Form1Data = {
  name: '',
  desc: '',
  labels: [],
  status: 1,
  priority: 0,
  websocket: false,
  hosts: [''],
  uris: ['/*'],
  remote_addrs: [''],
  redirectOption: 'disabled',
  redirectURI: '',
  ret_code: 302,
  methods: HTTP_METHOD_OPTION_LIST,
  service_id: '',
  proxyRewrite: {
    scheme: 'keep',
  },
  URIRewriteType: URI_REWRITE_TYPE.KEEP,
  hostRewriteType: HOST_REWRITE_TYPE.KEEP,

};

export const DEFAULT_STEP_3_DATA: RouteModule.Step3Data = {
  plugins: {},
  script: {},
  plugin_config_id: ""
};

export const INIT_CHART = {
  offset: { x: 55.71, y: 21.69 },
  scale: 0.329,
  nodes: {},
  links: {},
  selected: {},
  hovered: {},
};

export const HASH_KEY_LIST = [
  'remote_addr',
  'host',
  'uri',
  'server_name',
  'server_addr',
  'request_uri',
  'query_string',
  'remote_port',
  'hostname',
  'arg_id',
];

export const HASH_ON_LIST = ['vars', 'header', 'cookie', 'consumer'];

export const AUTH_LIST = ['basic-auth', 'jwt-auth', 'key-auth'];

export const PROTOCOL_SUPPORTED: RouteModule.debugRequest['request_protocol'][] = ['http', 'https'];

export const DEFAULT_DEBUG_PARAM_FORM_DATA = {
  params: [
    {
      check: false,
      key: '',
      type: 'text',
      value: '',
    },
  ],
  type: 'json',
};

export const DEFAULT_DEBUG_AUTH_FORM_DATA = {
  authType: 'none',
};

export const DEBUG_BODY_TYPE_SUPPORTED: RouteModule.DebugBodyType[] = [
  'none',
  'x-www-form-urlencoded',
  'form-data',
  'raw input',
];

// Note: codemirror mode: apl for text; javascript for json(need to format); xml for xml;
export const DEBUG_BODY_CODEMIRROR_MODE_SUPPORTED = [
  { name: 'Json', mode: 'javascript' },
  { name: 'Text', mode: 'apl' },
  { name: 'XML', mode: 'xml' },
];

export const EXPORT_FILE_MIME_TYPE_SUPPORTED = ['application/json', 'application/x-yaml'];

export enum DebugBodyFormDataValueType {
  Text = 'Text',
  File = 'File'
}
