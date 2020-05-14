import React, { useState } from 'react';
import { Card, Steps } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import Step4 from './components/Step4';
import styles from './style.less';

const { Step } = Steps;
interface FormStepFormProps {
  current?: string;
}

export interface FormData {
  createType: 'INPUT' | 'UPLOAD';
}

export interface StepProps {
  data: any;
  setStep: any;
  setData: any;
}

const Create: React.FC<FormStepFormProps> = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [formData, setFormData] = useState<FormData>({
    createType: 'INPUT',
  });
  let step;
  const setStep = (params: React.SetStateAction<number>) => {
    setCurrentStep(params);
  };
  const setData = (params: React.SetStateAction<FormData>) => {
    setFormData(params);
  };
  const setpProps = {
    data: formData,
    setStep,
    setData,
  };
  if (currentStep === 0) {
    step = <Step1 {...setpProps} />;
  } else if (currentStep === 1) {
    step = <Step2 {...setpProps} />;
  } else if (currentStep === 2) {
    step = <Step3 {...setpProps} />;
  } else {
    step = <Step4 {...setpProps} />;
  }

  return (
    <PageHeaderWrapper content="">
      <Card bordered={false}>
        <>
          <Steps current={currentStep} className={styles.steps}>
            <Step title="选择创建类型" />
            <Step title="编辑上传信息" />
            <Step title="预览" />
            <Step title="完成" />
          </Steps>
          <div className="step-container">{step}</div>
        </>
      </Card>
    </PageHeaderWrapper>
  );
};

export default Create;
