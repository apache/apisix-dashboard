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
import React from 'react';
import { FormInstance } from 'antd/es/form';

import { default as BasicAuth } from './basic-auth'
import { default as LimitConn } from './limit-conn'
import { default as RefererRestriction } from './referer-restriction'
import { default as ProxyMirror } from './proxy-mirror'
import { default as ApiBreaker } from './api-breaker'

type Props = {
  name: string,
  form: FormInstance
}

export const PLUGIN_UI_LIST = ['basic-auth', 'limit-conn', 'referer-restriction', 'proxy-mirror', 'api-breaker'];

export const PLUGIN_UI_FORM: React.FC<Props> = ({ name, form }) => {
  switch (name) {
    case 'limit-conn':
      return <LimitConn form={form} />
    case 'basic-auth':
      return <BasicAuth form={form} />
    case 'referer-restriction':
      return <RefererRestriction form={form} />
    case 'proxy-mirror':
      return <ProxyMirror form={form} />
    case 'api-breaker':
      return <ApiBreaker form={form} />
    default:
      return <></>
  }
}