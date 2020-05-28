import React, { useState } from 'react';
import { Card, Steps } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import Step1 from './components/Step1';
import styles from './Create.less';

const { Step } = Steps;

const Create: React.FC = () => {
  const [step1Data, setStep1Data] = useState<RoutesModule.Step1DataProps>({
    name: '',
    protocol: [],
    hosts: [{ host: '' }],
    paths: [],
    httpMethods: [],
    advancedMatchingRules: [],
  });

  const [currentStep] = useState(0);
  const [stepHeader] = useState(['定义 API 请求', '定义 API 后端服务', '插件配置', '预览']);
  const data = {
    step1Data,
  };

  const handleChange = (step: number, params: RoutesModule.Step1DataProps) => {
    switch (step) {
      case 0:
        setStep1Data({ ...step1Data, ...params });
        break;
      default:
    }
  };

  const renderStep = () => {
    return (
      <>
        {Boolean(currentStep === 0) && (
          <Step1
            data={data}
            onChange={(params: RoutesModule.Step1DataProps) => handleChange(currentStep, params)}
          />
        )}
      </>
    );
  };

  return (
    <PageHeaderWrapper>
      <Card bordered={false}>
        <Steps current={currentStep} className={styles.steps}>
          {stepHeader.map((item) => (
            <Step title={item} key={item} />
          ))}
        </Steps>
        {renderStep()}
      </Card>
    </PageHeaderWrapper>
  );
};

export default Create;
