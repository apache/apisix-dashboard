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
import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Steps, notification, Form } from 'antd';
import { history, useIntl } from 'umi';
import { PluginPage, PluginPageType, PLUGIN_MAPPER_SOURCE } from '@api7-dashboard/plugin';

import ActionBar from '@/components/ActionBar';

import Step1 from './components/Step1';
import Preview from './components/Preview';
import { fetchItem, create, update } from './service';

const Page: React.FC = (props) => {
  const [step, setStep] = useState(1);
  const [plugins, setPlugins] = useState<PluginPageType.FinalData>({});
  const [form1] = Form.useForm();
  const { formatMessage } = useIntl();

  useEffect(() => {
    const { id } = (props as any).match.params;
    if (id) {
      fetchItem(id).then(({ data }) => {
        const { username, desc, ...rest } = data;
        form1.setFieldsValue({ username, desc });
        setPlugins(rest.plugins);
      });
    }
  }, []);

  const onSubmit = () => {
    const data = { ...form1.getFieldsValue(), plugins } as ConsumerModule.Entity;
    const { id } = (props as any).match.params;
    (id ? update(id, data) : create(data))
      .then(() => {
        notification.success({
          message: `${
            id
              ? formatMessage({ id: 'component.global.edit' })
              : formatMessage({ id: 'component.global.create' })
          } ${formatMessage({ id: 'menu.consumer' })} ${formatMessage({
            id: 'component.status.success',
          })}`,
        });
        history.push('/consumer/list');
      })
      .catch(() => {
        setStep(3);
      });
  };

  const onStepChange = (nextStep: number) => {
    if (step === 1) {
      form1.validateFields().then(() => {
        setStep(nextStep);
      });
    } else if (nextStep === 3) {
      const authPluginNames = Object.keys(PLUGIN_MAPPER_SOURCE).filter(
        (pluginName) => PLUGIN_MAPPER_SOURCE[pluginName].category === 'Authentication',
      );
      const currentAuthPlugin = Object.keys(plugins).filter((plugin) =>
        authPluginNames.includes(plugin),
      );
      const currentAuthPluginLen = currentAuthPlugin.length;
      if (currentAuthPluginLen > 1 || currentAuthPluginLen === 0) {
        notification.warning({
          message: formatMessage({
            id: 'page.consumer.notification.warning.enableAuthenticationPlugin',
          }),
        });
        return;
      }
      setStep(3);
    } else if (nextStep === 4) {
      onSubmit();
    } else {
      setStep(nextStep);
    }
  };

  return (
    <>
      <PageContainer
        title={`${
          (props as any).match.params.id
            ? formatMessage({ id: 'component.global.edit' })
            : formatMessage({ id: 'component.global.create' })
        } ${formatMessage({ id: 'menu.consumer' })}`}
      >
        <Card bordered={false}>
          <Steps current={step - 1} style={{ marginBottom: 30 }}>
            <Steps.Step
              title={formatMessage({ id: 'component.global.steps.stepTitle.basicInformation' })}
            />
            <Steps.Step
              title={formatMessage({ id: 'component.global.steps.stepTitle.pluginConfig' })}
            />
            <Steps.Step title={formatMessage({ id: 'component.global.steps.stepTitle.preview' })} />
          </Steps>

          {step === 1 && <Step1 form={form1} />}
          {step === 2 && <PluginPage initialData={plugins} onChange={setPlugins} />}
          {step === 3 && <Preview form1={form1} plugins={plugins} />}
        </Card>
      </PageContainer>
      <ActionBar step={step} lastStep={3} onChange={onStepChange} />
    </>
  );
};

export default Page;
