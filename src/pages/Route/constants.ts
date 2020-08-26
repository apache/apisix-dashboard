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
export const HTTP_METHOD_OPTION_LIST: RouteModule.HttpMethod[] = [
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

export const DEFAULT_STEP_1_DATA: RouteModule.Step1Data = {
  name: '',
  desc: '',
  priority: 0,
  protocols: ['http', 'https'],
  websocket: false,
  hosts: [''],
  paths: ['/*'],
  redirectOption: 'disabled',
  redirectURI: '',
  redirectCode: 302,
  methods: HTTP_METHOD_OPTION_LIST,
  advancedMatchingRules: [],
};

export const DEFAULT_STEP_2_DATA: RouteModule.Step2Data = {
  upstream_protocol: 'keep',
  upstreamHostList: [{} as RouteModule.UpstreamHost],
  upstreamHeaderList: [],
  upstreamPath: undefined,
  mappingStrategy: undefined,
  rewriteType: 'keep',
  timeout: {
    connect: 6000,
    send: 6000,
    read: 6000,
  },
};

export const DEFAULT_STEP_3_DATA: RouteModule.Step3Data = {
  plugins: {},
};
