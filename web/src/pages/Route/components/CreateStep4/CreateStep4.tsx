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
import { FormInstance } from 'antd/lib/form';
import { useIntl } from 'umi';
import PluginOrchestration from '@api7-dashboard/pluginchart';

import PluginPage from '@/components/Plugin';
import Step1 from '../Step1';
import Step2 from '../Step2';

type Props = {
  form1: FormInstance;
  form2: FormInstance;
  redirect?: boolean;
  step3Data: RouteModule.Step3Data;
  advancedMatchingRules: RouteModule.MatchingRule[];
  upstreamRef: any;
};

const style = {
  marginTop: '40px',
};

const CreateStep4: React.FC<Props> = ({ form1, form2, redirect, upstreamRef, ...rest }) => {
  const { formatMessage } = useIntl();
  const { plugins = {}, script = {} } = rest.step3Data;

  return (
    <>
      <h2>{formatMessage({ id: 'page.route.steps.stepTitle.defineApiRequest' })}</h2>
      <Step1 {...rest} form={form1} disabled />
      {!redirect && (
        <>
          <h2 style={style}>
            {formatMessage({ id: 'page.route.steps.stepTitle.defineApiBackendServe' })}
          </h2>
          <Step2 form={form2} upstreamRef={upstreamRef} disabled />
          <h2 style={style}>
            {formatMessage({ id: 'component.global.steps.stepTitle.pluginConfig' })}
          </h2>
          {Boolean(Object.keys(plugins).length !== 0) && (
            <PluginPage initialData={rest.step3Data.plugins} readonly />
          )}
          {Boolean(Object.keys(script).length !== 0) && (
            <PluginOrchestration data={rest.step3Data.script.chart} readonly onChange={() => {}} />
          )}
        </>
      )}
    </>
  );
};

export default CreateStep4;
