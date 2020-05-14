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

const Create: React.FC<FormStepFormProps> = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [formData, setFormData] = useState<FormData>({
    createType: 'INPUT',
  });
  let step;

  if (currentStep === 0) {
    step = <Step1 data={formData} setCurrentStep={setCurrentStep} setFormData={setFormData} />;
  } else if (currentStep === 1) {
    step = <Step2 data={formData} setFormData={setFormData} setCurrentStep={setCurrentStep} />;
  } else if (currentStep === 2) {
    step = <Step3 data={formData} setFormData={setFormData} setCurrentStep={setCurrentStep} />;
  } else {
    step = <Step4 data={formData} setFormData={setFormData} setCurrentStep={setCurrentStep} />;
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
