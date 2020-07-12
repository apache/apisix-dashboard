import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Steps, notification } from 'antd';
import { useForm } from 'antd/es/form/util';

import ActionBar from '@/components/ActionBar';
import { history } from 'umi';

import Step1 from './components/Step1';
import Preview from './components/Preview';
import { fetchOne, create, update } from './service';
import { transformCreate, transformFetch } from './transform';

const Page: React.FC = (props) => {
  const [step, setStep] = useState(1);
  const [form1] = useForm();

  useEffect(() => {
    const { id } = (props as any).match.params;

    if (id) {
      fetchOne(id).then((data) => {
        form1.setFieldsValue(transformFetch(data));
      });
    }
  }, []);

  const onSubmit = () => {
    const data = transformCreate(Object.assign({}, form1.getFieldsValue()) as UpstreamModule.Body);
    const { id } = (props as any).match.params;
    (id ? update(id, data) : create(data)).then(() => {
      notification.success({ message: `${id ? '更新' : '创建'} 上游成功` });
      history.replace('/upstream/list');
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
      <PageContainer title="创建上游">
        <Card bordered={false}>
          <Steps current={step - 1} style={{ marginBottom: 30 }}>
            <Steps.Step title="基础信息" />
            <Steps.Step title="预览" />
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
