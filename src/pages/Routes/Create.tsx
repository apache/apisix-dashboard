import React, { useState } from 'react';
import { Card, Steps } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import Step1 from './components/Step1';
import styles from './Create.less';

const { Step } = Steps;

const Create: React.FC = () => {
  const [step1PageData, setStep1PageData] = useState<RoutesModule.Step1PageDataProps>({
    apiName: '',
    protocol: '',
    hosts: [],
    requestPath: '',
    httpMethods: [],
    advancedConfig: [],
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [stepHeader, setStepHeader] = useState(['定义API请求', '定义API后端服务', '插件', '预览']);
  const pageData = {
    step1PageData,
  };

  const handleChange = (step: number, data: RoutesModule.Step1PageDataProps) => {
    switch (step) {
      case 0:
        setStep1PageData({ ...step1PageData, ...data });
        break;
      case 1:
        // TODO: base on data show different step
        setCurrentStep(1);
        setStepHeader(['定义API请求', '定义API后端服务', '预览']);
        break;
      default:
    }
  };

  const renderStep = () => {
    return (
      <>
        {Boolean(currentStep === 0) && (
          <Step1
            key={Math.random().toString(36).slice(2)}
            pageData={pageData}
            onChange={(data: RoutesModule.Step1PageDataProps) => handleChange(currentStep, data)}
          />
        )}
      </>
    );
  };

  return (
    <PageHeaderWrapper content="">
      <Card bordered={false}>
        <>
          <Steps current={currentStep} className={styles.steps}>
            {stepHeader.map((item) => (
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
