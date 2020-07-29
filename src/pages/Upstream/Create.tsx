import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Steps, notification, Form } from 'antd';

import ActionBar from '@/components/ActionBar';
import { history, useIntl } from 'umi';

import Step1 from './components/Step1';
import Preview from './components/Preview';
import { fetchOne, create, update } from './service';
import { transformCreate, transformFetch } from './transform';

const Page: React.FC = (props) => {
  const [step, setStep] = useState(1);
  const [form1] = Form.useForm();
  const { formatMessage } = useIntl();

  useEffect(() => {
    const { id } = (props as any).match.params;

    if (id) {
      fetchOne(id).then((data) => {
        form1.setFieldsValue(transformFetch(data));
      });
    }
  }, []);

  const onSubmit = () => {
    const data = transformCreate({ ...form1.getFieldsValue() } as UpstreamModule.Body);
    const { id } = (props as any).match.params;
    (id ? update(id, data) : create(data)).then(() => {
      notification.success({ message: `${id ? formatMessage({ id: 'upstream.create.edit' }) : formatMessage({ id: 'upstream.create.create' })} ` + formatMessage({ id: 'upstream.create.upstream.successfully' }) });
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
      <PageContainer title={formatMessage({ id: 'upstream.create.create' })}>
        <Card bordered={false}>
          <Steps current={step - 1} style={{ marginBottom: 30 }}>
            <Steps.Step title={formatMessage({ id: 'upstream.create.basic.info' })} />
            <Steps.Step title={formatMessage({ id: 'upstream.create.preview' })} />
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
