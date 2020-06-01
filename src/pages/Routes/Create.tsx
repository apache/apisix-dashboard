import React, { useState } from 'react';
import { Card, Steps } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';

import Step1 from './components/Step1';
import Step2 from './components/Step2';
import styles from './Create.less';
import CreateStep3 from './components/CreateStep3';
import ActionBar from './components/ActionBar';

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

  const [step2Data, setStep2Data] = useState<RouteModule.Step2Data>({
    backendProtocol: 'originalRequest',
    backendAddressList: [{ host: '', port: 0, weight: 0 }],
    upstream_header: [],
    timeout: {
      connect: 30000,
      send: 30000,
      read: 30000,
    },
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

  const [step, setStep] = useState(0);
  const [stepHeader] = useState(['定义 API 请求', '定义 API 后端服务', '插件配置', '预览']);
  const data = {
    step1Data,
    step2Data,
    step3Data,
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <Step1
            data={data}
            onChange={(params: RouteModule.Step1Data) => setStep1Data({ ...step1Data, ...params })}
          />
        );
      case 1:
        return (
          <Step2
            data={data}
            onChange={(params: RouteModule.Step2Data) => setStep2Data({ ...step2Data, ...params })}
          />
        );
      case 2:
        return <CreateStep3 data={data} onChange={setStep3Data} />;
      default:
        return null;
    }
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
      <ActionBar step={step} onChange={setStep} />
    </>
  );
};

export default Create;
