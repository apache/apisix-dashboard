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
import React, { useState, useRef, useEffect } from 'react';
import { useIntl, history } from 'umi';
import { Card, Steps, Form, notification } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { omit } from 'lodash';

import ActionBar from '@/components/ActionBar';
import PluginPage from '@/components/Plugin';
import { convertToFormData } from '@/components/Upstream/service';
import Preview from './components/Preview';
import Step1 from './components/Step1';
import { create, update, fetchItem } from './service';

const { Step } = Steps;

const Page: React.FC = (props) => {
  const { formatMessage } = useIntl();
  const [form] = Form.useForm();
  const [upstreamForm] = Form.useForm();
  const upstreamRef = useRef<any>();
  const [plugins, setPlugins] = useState<PluginComponent.Data>({});

  const STEP_HEADER = [
    formatMessage({ id: 'page.service.steps.stepTitle.basicInformation' }),
    formatMessage({ id: 'page.service.steps.stepTitle.pluginConfig' }),
    formatMessage({ id: 'component.global.steps.stepTitle.preview' }),
  ];

  const [stepHeader] = useState(STEP_HEADER);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const { serviceId } = (props as any).match.params;
    if (serviceId) {
      fetchItem(serviceId).then(({ data }) => {
        if (data.upstream_id) {
          upstreamForm.setFieldsValue({ upstream_id: data.upstream_id })
        }
        if (data.upstream) {
          upstreamForm.setFieldsValue(convertToFormData(data.upstream))
        }
        form.setFieldsValue(omit(data, ['upstream_id', 'upstream', 'plugins']));
        setPlugins(data.plugins || {});
      });
    }
  }, []);

  const onSubmit = () => {
    const data = {
      ...form.getFieldsValue(),
      plugins,
    };

    const upstreamFormData = upstreamRef.current?.getData();
    if (!upstreamFormData) {
      return
    }
    if (!upstreamFormData.upstream_id) {
      data.upstream = upstreamFormData;
    } else {
      data.upstream_id = upstreamFormData.upstream_id;
    }

    const { serviceId } = (props as any).match.params;
    (serviceId ? update(serviceId, data) : create(data))
      .then(() => {
        notification.success({
          message: `${serviceId
            ? formatMessage({ id: 'component.global.edit' })
            : formatMessage({ id: 'component.global.create' })
            } ${formatMessage({ id: 'menu.service' })} ${formatMessage({
              id: 'component.status.success',
            })}`,
        });
        history.push('/service/list');
      })
      .catch(() => {
        setStep(3);
      });
  };

  const onStepChange = (nextStep: number) => {
    if (step === 1 && nextStep === 2) {
      form.validateFields().then(() => {
        upstreamForm.validateFields().then(() => {
          setStep(nextStep);
        });
      });
      return;
    }
    if (nextStep === 4) {
      onSubmit();
      return;
    }
    setStep(nextStep);
  };

  return (
    <>
      <PageHeaderWrapper
        title={(props as any).match.params.serviceId
          ? formatMessage({ id: 'page.service.configure' })
          : formatMessage({ id: 'page.service.create' })}
      >
        <Card bordered={false}>
          <Steps current={step - 1} style={{ marginBottom: '25px' }}>
            {stepHeader.map((item) => (
              <Step title={item} key={item} />
            ))}
          </Steps>
          {step === 1 && (
            <Step1 form={form} upstreamForm={upstreamForm} upstreamRef={upstreamRef} />
          )}
          {step === 2 && (
            <PluginPage initialData={plugins} onChange={setPlugins} schemaType="route" />
          )}
          {step === 3 && (
            <Preview
              upstreamForm={upstreamForm}
              upstreamRef={upstreamRef}
              form={form}
              plugins={plugins}
            />
          )}
        </Card>
      </PageHeaderWrapper>
      <ActionBar step={step} lastStep={3} onChange={onStepChange} withResultView />
    </>
  );
};

export default Page;
