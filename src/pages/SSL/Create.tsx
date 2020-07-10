import React, { useState } from 'react';
import { Card, Steps } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import styles from './Create.less';

const { Step } = Steps;

export interface FormData {
  sni?: string;
  cert?: string;
  key?: string;
  expireTime?: Date | string;
}

export interface StepProps {
  data: FormData;
  onStepChange(step: number): void;
  onFormChange(data: FormData, reset?: boolean): void;
}

const Create: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const setpProps = {
    data: formData,
    onStepChange: setCurrentStep,
    onFormChange: (params: FormData, reset?: boolean) => {
      if (reset) {
        setFormData({});
      } else {
        setFormData({ ...formData, ...params });
      }
    },
  };

  const renderStep = () => {
    return (
      <>
        {Boolean(currentStep === 0) && <Step1 {...setpProps} />}
        {Boolean(currentStep === 1) && <Step2 {...setpProps} />}
        {Boolean(currentStep === 2) && <Step3 {...setpProps} />}
      </>
    );
  };

  return (
    <PageHeaderWrapper content="">
      <Card bordered={false}>
        <>
          <Steps current={currentStep} className={styles.steps}>
            {['完善证书信息', '预览', '完成'].map((item) => (
              <Step title={item} key={item} />
            ))}
          </Steps>
          {renderStep()}
        </>
      </Card>
    </PageHeaderWrapper>
  );
};

export default Create;
