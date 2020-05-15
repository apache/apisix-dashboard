import React, { useState } from 'react';
import { Card, Steps } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import Step4 from './components/Step4';
import styles from './style.less';

const { Step } = Steps;

export interface FormData {
  createType: 'INPUT' | 'UPLOAD';
}

export interface StepProps {
  data: FormData;
  onStepChange(step: number): void;
  onFormChange(data: FormData): void;
}

const Create: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    createType: 'INPUT',
  });
  const setpProps = {
    data: formData,
    onStepChange: setCurrentStep,
    onFormChange: setFormData,
  };

  const renderStep = () => {
    return (
      <>
        {Boolean(currentStep === 0) && <Step1 {...setpProps} />}
        {Boolean(currentStep === 1) && <Step2 {...setpProps} />}
        {Boolean(currentStep === 2) && <Step3 {...setpProps} />}
        {Boolean(currentStep === 3) && <Step4 {...setpProps} />}
      </>
    );
  };

  return (
    <PageHeaderWrapper content="">
      <Card bordered={false}>
        <>
          <Steps current={currentStep} className={styles.steps}>
            {['选择创建类型', '编辑上传信息', '预览', '完成'].map((item) => (
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
