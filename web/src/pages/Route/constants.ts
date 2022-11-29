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
  'POST',
  'PUT',
  'DELETE',
  'PATCH',
  'HEAD',
  'OPTIONS',
  'CONNECT',
  'TRACE',
  'PURGE',
];

export const FORM_ITEM_LAYOUT = {
  labelCol: {
    span: 3,
  },
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
  plugin_config_id: '',
};

export const AUTH_LIST = ['basic-auth', 'jwt-auth', 'key-auth'];

export const HEADER_LIST = [
  'A-IM',
  'Accept',
  'Accept-Charset',
  'Accept-Datetime',
  'Accept-Encoding',
  'Accept-Language',
  'Access-Control-Request-Method',
  'Access-Control-Request-Headers',
  'Allow',
  'Authorization',
  'Cache-Control',
  'Connection',
  'Content-Encoding',
  'Content-Length',
  'Content-MD5',
  'Content-Type',
  'Cookie',
  'DNT',
  'Date',
  'Expect',
  'Forwarded',
  'From',
  'Front-End-Https',
  'Host',
  'HTTP2-Settings',
  'If-Match',
  'If-Modified-Since',
  'If-None-Match',
  'If-Range',
  'If-Unmodified-Since',
  'Max-Forwards',
  'Origin',
  'Pragma',
  'Prefer',
  'Proxy-Authorization',
  'Proxy-Connection',
  'Range',
  'Referer',
  'Save-Data',
  'TE',
  'Trailer',
  'Transfer-Encoding',
  'Upgrade',
  'Upgrade-Insecure-Requests',
  'User-Agent',
  'Via',
  'Warning',
  'X-ATT-DeviceId',
  'X-Correlation-ID',
  'X-Csrf-Token',
  'X-Forwarded-For',
  'X-Forwarded-Host',
  'X-Forwarded-Proto',
  'X-Http-Method-Override',
  'X-Request-ID',
  'X-Requested-With',
  'X-UIDH',
  'X-Wap-Profile',
];

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

export const DEBUG_BODY_MODE_SUPPORTED = [
  { name: 'JSON', mode: 'json' },
  { name: 'TEXT', mode: 'text' },
  { name: 'XML', mode: 'xml' },
];

export const DEBUG_RESPONSE_BODY_MODE_SUPPORTED = [
  { name: 'JSON', mode: 'json' },
  { name: 'XML', mode: 'xml' },
  { name: 'HTML', mode: 'html' },
  { name: 'TEXT', mode: 'text' },
];

export const EXPORT_FILE_MIME_TYPE_SUPPORTED = ['application/json', 'application/x-yaml'];

export enum DebugBodyFormDataValueType {
  Text = 'Text',
  File = 'File',
}
