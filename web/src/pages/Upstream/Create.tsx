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
import React, { useState, useEffect, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Steps, notification, Form } from 'antd';
import { history, useIntl } from 'umi';

import ActionBar from '@/components/ActionBar';

import Step1 from './components/Step1';
import { fetchOne, create, update } from './service';

const Page: React.FC = (props) => {
  const [step, setStep] = useState(1);
  const [form1] = Form.useForm();
  const { formatMessage } = useIntl();
  const upstreamRef = useRef<any>();

  useEffect(() => {
    const { id } = (props as any).match.params;

    if (id) {
      fetchOne(id).then((data) => {
        form1.setFieldsValue(data.data);
      });
    }
  }, []);

  const onSubmit = () => {
    form1.validateFields().then(() => {
      const data = upstreamRef.current?.getData();
      if (!data) {
        // TODO: i18n
        notification.error({ message: '请检查配置' });
        return;
      }

      const { id } = (props as any).match.params;
      (id ? update(id, data) : create(data)).then(() => {
        notification.success({
          message: `${
            id
              ? formatMessage({ id: 'page.upstream.create.edit' })
              : formatMessage({ id: 'page.upstream.create.create' })
          } ${formatMessage({ id: 'page.upstream.create.upstream.successfully' })}`,
        });
        history.replace('/upstream/list');
      });
    });
  };

  const onStepChange = (nextStep: number) => {
    if (step === 1) {
      form1.validateFields().then(() => {
        setStep(nextStep);
      });
    } else if (nextStep === 3) {
      onSubmit();
    } else {
      setStep(nextStep);
    }
  };

  return (
    <>
      <PageContainer title={formatMessage({ id: 'page.upstream.create.create' })}>
        <Card bordered={false}>
          <Steps current={step - 1} style={{ marginBottom: 30 }}>
            <Steps.Step title={formatMessage({ id: 'page.upstream.create.basic.info' })} />
            <Steps.Step title={formatMessage({ id: 'page.upstream.create.preview' })} />
          </Steps>

          {step === 1 && <Step1 form={form1} upstreamRef={upstreamRef} />}
          {step === 2 && <Step1 form={form1} upstreamRef={upstreamRef} disabled />}
        </Card>
      </PageContainer>
      <ActionBar step={step} lastStep={2} onChange={onStepChange} />
    </>
  );
};

export default Page;
