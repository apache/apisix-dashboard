import React, { useState } from 'react';
import { Card, Steps } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import styles from './Create.less';
import CreateStep3 from './components/CreateStep3';

const { Step } = Steps;

const Create: React.FC = () => {
  const [step1Data, setStep1Data] = useState<RoutesModule.Step1DataProps>({
    name: '',
    protocol: [],
    hosts: [''],
    paths: [],
    httpMethods: [],
    advancedMatchingRules: [],
  });

  const [step2Data, setStep2Data] = useState<RoutesModule.Step2DataProps>({
    backendProtocol: 'originalRequest',
    backendAddressList: [{ host: '', port: 0, weight: 0 }],
    upstream_header: [],
    timeout: {
      connect: 30000,
      send: 30000,
      read: 30000,
    },
  });

  const [currentStep] = useState(1);
  const [stepHeader] = useState(['定义 API 请求', '定义 API 后端服务', '插件配置', '预览']);
  const data = {
    step1Data,
    step2Data,
  };

  const handleChange = (
    step: number,
    params: RoutesModule.Step1DataProps | RoutesModule.Step2DataProps,
  ) => {
    switch (step) {
      case 0:
        setStep1Data({ ...step1Data, ...params });
        break;
      case 1:
        setStep2Data({ ...step2Data, ...params });
        break;
      default:
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Step1
            data={data}
            onChange={(params: RoutesModule.Step1DataProps) => handleChange(currentStep, params)}
          />
        );
      case 1:
        return (
          <Step2
            data={data}
            onChange={(params: RoutesModule.Step2DataProps) => handleChange(currentStep, params)}
          />
        );
      case 2:
        return <CreateStep3 />;
      default:
        return null;
    }
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
