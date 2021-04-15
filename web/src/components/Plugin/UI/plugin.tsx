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
import type { FormInstance } from 'antd/es/form';
import { Empty } from 'antd';
import { useIntl } from 'umi';

import BasicAuth from './basic-auth'
import LimitReq from './limit-req';
import ApiBreaker from './api-breaker';
import ProxyMirror from './proxy-mirror';
import LimitConn from './limit-conn';
import Cors from './cors';

type Props = {
  name: string,
  form: FormInstance,
  renderForm: boolean
}

export const PLUGIN_UI_LIST = ['api-breaker', 'basic-auth', 'limit-conn', 'cors', 'proxy-mirror', 'limit-req'];

export const PluginForm: React.FC<Props> = ({ name, renderForm, form }) => {

  const { formatMessage } = useIntl();

  if (!renderForm) { return <Empty style={{ marginTop: 100 }} description={formatMessage({ id: 'component.plugin.noConfigurationRequired' })} /> };

  switch (name) {
    case 'api-breaker':
      return <ApiBreaker form={form} />
    case 'basic-auth':
      return <BasicAuth form={form} />
    case 'cors':
      return <Cors form={form} />
    case 'limit-req':
      return <LimitReq form={form} />
    case 'proxy-mirror':
      return <ProxyMirror form={form} />
    case 'limit-conn':
      return <LimitConn form={form} />
    default:
      return null;
  }
}
