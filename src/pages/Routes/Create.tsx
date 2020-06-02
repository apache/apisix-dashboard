import React, { useState } from 'react';
import { Card, Steps, Form } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';

import Step1 from './components/Step1';
import Step2 from './components/Step2';
import styles from './Create.less';
import CreateStep3 from './components/CreateStep3';
import ActionBar from './components/ActionBar';
import CreateStep4 from './components/CreateStep4';
import { DEFAULT_STEP_1_DATA, DEFAULT_STEP_2_DATA, DEFAULT_STEP_3_DATA } from './constants';

const { Step } = Steps;

const Create: React.FC = () => {
  const [step1Data, setStep1Data] = useState(DEFAULT_STEP_1_DATA);
  const [step2Data, setStep2Data] = useState(DEFAULT_STEP_2_DATA);
  const [step3Data, setStep3Data] = useState(DEFAULT_STEP_3_DATA);

  const [form1] = Form.useForm();
  const [form2] = Form.useForm();

  const [step, setStep] = useState(0);
  const [stepHeader] = useState(['定义 API 请求', '定义 API 后端服务', '插件配置', '预览']);

  const data = {
    step1Data,
    step2Data,
    step3Data,
  };

  const renderStep = () => {
    if (step === 0) {
      return (
        <Step1
          data={data}
          form={form1}
          onChange={(_data: RouteModule.Step1Data) => {
            setStep1Data(_data);
          }}
        />
      );
    }

    if (step === 1) {
      return (
        <Step2
          data={data}
          form={form2}
          onChange={(params: RouteModule.Step2Data) => setStep2Data({ ...step2Data, ...params })}
        />
      );
    }

    if (step === 2) {
      return <CreateStep3 data={data} onChange={setStep3Data} />;
    }

    if (step === 3) {
      return <CreateStep4 data={data} onChange={() => {}} />;
    }

    return null;
  };

  const onStepChange = (nextStep: number) => {
    const nextStepAction = () => {
      setStep(nextStep);
      window.scrollTo({ top: 0 });
    };
    if (nextStep > step && nextStep < 3) {
      // Form Validation
      if (step === 0) {
        form1.validateFields().then((value) => {
          setStep1Data({ ...step1Data, ...value });
          nextStepAction();
        });
        return;
      }
      if (step === 1) {
        form2.validateFields().then((value) => {
          setStep1Data({ ...step1Data, ...value });
          nextStepAction();
        });
        return;
      }
    }
    nextStepAction();
  };
  return (
    <>
      <PageHeaderWrapper>
        <Card bordered={false}>
          <Steps current={step} className={styles.steps}>
            {stepHeader.map((item) => (
              <Step title={item} key={item} />
            ))}
          </Steps>
          {renderStep()}
        </Card>
      </PageHeaderWrapper>
      <ActionBar
        step={step}
        onChange={(nextStep) => {
          onStepChange(nextStep);
        }}
      />
    </>
  );
};

export default Create;
