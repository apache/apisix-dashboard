import React, { useState, useEffect } from 'react';
import { Card, Steps, Form, notification } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';

import Step1 from './components/Step1';
import Step2 from './components/Step2';
import styles from './Create.less';
import CreateStep3 from './components/CreateStep3';
import ActionBar from './components/ActionBar';
import CreateStep4 from './components/CreateStep4';
import { DEFAULT_STEP_1_DATA, DEFAULT_STEP_2_DATA, DEFAULT_STEP_3_DATA } from './constants';
import { createRoute, fetchRoute, updateRoute } from './service';

const { Step } = Steps;

const Create: React.FC = (props) => {
  const [step1Data, setStep1Data] = useState(DEFAULT_STEP_1_DATA);
  const [step2Data, setStep2Data] = useState(DEFAULT_STEP_2_DATA);
  const [step3Data, setStep3Data] = useState(DEFAULT_STEP_3_DATA);

  const [form1] = Form.useForm();
  const [form2] = Form.useForm();

  const [step, setStep] = useState(0);
  const [stepHeader] = useState(['定义 API 请求', '定义 API 后端服务', '插件配置', '预览']);

  const routeData = {
    step1Data,
    step2Data,
    step3Data,
  };

  const initRoute = (rid: number) => {
    fetchRoute(rid).then((data) => {
      form1.setFieldsValue(data.step1Data);
      setStep1Data(data.step1Data as RouteModule.Step1Data);

      form2.setFieldsValue(data.step2Data);
      setStep2Data(data.step2Data);

      setStep3Data(data.step3Data);
    });
  };

  useEffect(() => {
    if ((props as any).route.name === 'edit') {
      initRoute((props as any).match.params.rid);
    }
  }, []);

  const renderStep = () => {
    if (step === 0) {
      return (
        <Step1
          data={routeData}
          form={form1}
          onChange={(params: RouteModule.Step1Data) => {
            requestAnimationFrame(() => {
              setStep1Data(params);
            });
          }}
        />
      );
    }

    if (step === 1) {
      return (
        <Step2
          data={routeData}
          form={form2}
          onChange={(params: RouteModule.Step2Data) => setStep2Data({ ...step2Data, ...params })}
        />
      );
    }

    if (step === 2) {
      return <CreateStep3 data={routeData} onChange={setStep3Data} />;
    }

    if (step === 3) {
      return <CreateStep4 data={routeData} form1={form1} form2={form2} onChange={() => {}} />;
    }

    return null;
  };

  const onStepChange = (nextStep: number) => {
    if (nextStep === 0) {
      setStep(nextStep);
    }
    if (nextStep === 1) {
      form1.validateFields().then((value) => {
        setStep1Data({ ...step1Data, ...value });
        setStep(nextStep);
      });
      return;
    }
    if (nextStep === 2) {
      form2.validateFields().then((value) => {
        setStep2Data({ ...step2Data, ...value });
        setStep(nextStep);
      });
      return;
    }
    if (nextStep === 3) {
      setStep(nextStep);
    }
    if (nextStep === 4) {
      if ((props as any).route.name === 'edit') {
        updateRoute((props as any).match.params.rid, { data: routeData }).then(() => {
          notification.success({ message: '更新路由成功' });
        });
      } else {
        createRoute({ data: routeData }).then(() => {
          notification.success({ message: '创建路由成功' });
        });
      }
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
