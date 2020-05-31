import React, { useState } from 'react';
import { Card, Steps } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import Step1 from './components/Step1';
import styles from './Create.less';
import CreateStep3 from './components/CreateStep3';

const { Step } = Steps;

const Create: React.FC = () => {
  const [step1Data, setStep1Data] = useState<RouteModule.Step1Data>({
    name: '',
    protocol: [],
    hosts: [''],
    paths: [],
    httpMethods: [],
    advancedMatchingRules: [],
  });

  const [step3Data, setStep3Data] = useState<RouteModule.Step3Data>({
    plugins: {
      'limit-count': {
        count: 2,
        time_window: 60,
        rejected_code: 503,
        key: 'remote_addr',
      },
    },
  });

  const [currentStep] = useState(2);
  const [stepHeader] = useState(['定义 API 请求', '定义 API 后端服务', '插件配置', '预览']);
  const data = {
    step1Data,
    step3Data,
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Step1
            data={data}
            onChange={(params: RouteModule.Step1Data) => setStep1Data({ ...step1Data, ...params })}
          />
        );
      case 2:
        return (
          <CreateStep3
            data={data}
            onChange={(params: RouteModule.Step3Data) => setStep3Data({ ...step3Data, ...params })}
          />
        );
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
