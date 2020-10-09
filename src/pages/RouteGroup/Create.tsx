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
import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Form, notification, Steps } from 'antd';

import ActionBar from '@/components/ActionBar';
import { history, useIntl } from 'umi';

import Step1 from './components/Step1';
import Preview from './components/Preview';
import { create, fetchOne, update } from './service';

const Page: React.FC = (props) => {
  const [step, setStep] = useState(1);
  const [form1] = Form.useForm();
  const { formatMessage } = useIntl();

  useEffect(() => {
    const { gid } = (props as any).match.params;

    if (gid) {
      fetchOne(gid).then((data) => {
        form1.setFieldsValue(data);
      });
    }
  }, []);

  const onSubmit = () => {
    const data = { ...form1.getFieldsValue() } as RouteGroupModule.RouteGroupEntity;
    const { gid } = (props as any).match.params;
    (gid ? update(gid, data) : create(data)).then(() => {
      notification.success({
        message: `${
          gid
            ? formatMessage({ id: 'component.global.edit' })
            : formatMessage({ id: 'component.global.create' })
        }${formatMessage({ id: 'menu.routegroup' })}${formatMessage({
          id: 'component.status.success',
        })}`,
      });
      history.replace('/routegroup/list');
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
      <PageContainer
        title={`${
          (props as any).match.params.gid
            ? formatMessage({ id: 'component.global.edit' })
            : formatMessage({ id: 'component.global.create' })
        }${formatMessage({ id: 'menu.routegroup' })}`}
      >
        <Card bordered={false}>
          <Steps current={step - 1} style={{ marginBottom: 30 }}>
            <Steps.Step
              title={formatMessage({ id: 'component.global.steps.stepTitle.basicInformation' })}
            />
            <Steps.Step title={formatMessage({ id: 'component.global.steps.stepTitle.preview' })} />
          </Steps>

          {step === 1 && <Step1 form={form1} />}
          {step === 2 && <Preview form1={form1} />}
        </Card>
      </PageContainer>
      <ActionBar step={step} lastStep={2} onChange={onStepChange} />
    </>
  );
};

export default Page;
