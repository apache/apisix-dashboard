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
    span: 6,
  },
  wrapperCol: {
    span: 18,
  },
};

export const FORM_ITEM_WITHOUT_LABEL = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 20, offset: 6 },
  },
};

export const DEFAULT_STEP_1_DATA: RouteModule.Form1Data = {
  name: '',
  desc: '',
  status: false,
  priority: 0,
  websocket: false,
  hosts: [''],
  uris: ['/*'],
  remote_addrs: [''],
  redirectOption: 'disabled',
  redirectURI: '',
  ret_code: 302,
  methods: HTTP_METHOD_OPTION_LIST,
};

export const DEFAULT_STEP_3_DATA: RouteModule.Step3Data = {
  plugins: {},
  script: {},
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
