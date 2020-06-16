import React, { useState, useEffect } from 'react';
import { Card, Steps, Form } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';

import { PLUGIN_MAPPER_SOURCE } from '@/components/PluginForm/data';
import { createRoute, fetchRoute, updateRoute, fetchPluginList } from './service';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import CreateStep3 from './components/CreateStep3';
import CreateStep4 from './components/CreateStep4';
import {
  DEFAULT_STEP_1_DATA,
  DEFAULT_STEP_2_DATA,
  DEFAULT_STEP_3_DATA,
  STEP_HEADER_2,
  STEP_HEADER_4,
} from './constants';
import ResultView from './components/ResultView';
import ActionBar from './components/ActionBar';
import styles from './Create.less';

const { Step } = Steps;

type Props = {
  // FIXME
  route: any;
  match: any;
};

const Create: React.FC<Props> = (props) => {
  const [step1Data, setStep1Data] = useState(DEFAULT_STEP_1_DATA);
  const [step2Data, setStep2Data] = useState(DEFAULT_STEP_2_DATA);
  const [step3Data, setStep3Data] = useState(DEFAULT_STEP_3_DATA);

  const [redirect, setRedirect] = useState(false);

  const [form1] = Form.useForm();
  const [form2] = Form.useForm();

  const [step, setStep] = useState(0);
  const [stepHeader, setStepHeader] = useState(STEP_HEADER_4);

  const routeData = {
    step1Data,
    step2Data,
    step3Data,
  };

  const setupPlugin = () => {
    const PLUGIN_BLOCK_LIST = Object.entries(PLUGIN_MAPPER_SOURCE)
      .filter(([, value]) => value.hidden)
      .flat()
      .filter((item) => typeof item === 'string');

    fetchPluginList().then((data: string[]) => {
      const names = data.filter((name) => !PLUGIN_BLOCK_LIST.includes(name));

      const enabledNames = Object.keys(step3Data.plugins);
      const disabledNames = names.filter((name) => !enabledNames.includes(name));

      setStep3Data({
        plugins: step3Data.plugins,
        _disabledPluginList: disabledNames.map((name) => ({
          name,
          ...PLUGIN_MAPPER_SOURCE[name],
        })),
        _enabledPluginList: enabledNames.map((name) => ({
          name,
          ...PLUGIN_MAPPER_SOURCE[name],
        })),
      });
    });
  };

  const setupRoute = (rid: number) =>
    fetchRoute(rid).then((data) => {
      form1.setFieldsValue(data.step1Data);
      setStep1Data(data.step1Data as RouteModule.Step1Data);

      form2.setFieldsValue(data.step2Data);
      setStep2Data(data.step2Data);

      setStep3Data(data.step3Data);
    });

  useEffect(() => {
    if (props.route.name === 'edit') {
      setupRoute(props.match.params.rid).then(() => setupPlugin());
    } else {
      setupPlugin();
    }
  }, []);

  useEffect(() => {
    const { redirectOption } = step1Data;

    if (redirectOption === 'customRedirect') {
      setRedirect(true);
      setStepHeader(STEP_HEADER_2);
      return;
    }
    setRedirect(false);
    setStepHeader(STEP_HEADER_4);
  }, [step1Data]);

  // FIXME
  const onReset = () => {
    setStep1Data(DEFAULT_STEP_1_DATA);
    setStep2Data(DEFAULT_STEP_2_DATA);
    setStep3Data(DEFAULT_STEP_3_DATA);
    form1.resetFields();
    form2.resetFields();
    setStep(0);
  };

  const renderStep = () => {
    if (step === 0) {
      return (
        <Step1
          data={routeData}
          form={form1}
          onChange={(params: RouteModule.Step1Data) => {
            setStep1Data({ ...step1Data, ...params });
          }}
        />
      );
    }

    if (step === 1) {
      if (redirect) {
        return (
          <CreateStep4 data={routeData} form1={form1} form2={form2} onChange={() => {}} redirect />
        );
      }

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

    if (step === 4) {
      return <ResultView onReset={onReset} />;
    }

    return null;
  };

  const onStepChange = (nextStep: number) => {
    const onUpdateOrCreate = () => {
      if ((props as any).route.name === 'edit') {
        updateRoute((props as any).match.params.rid, { data: routeData }).then(() => {
          setStep(4);
        });
      } else {
        createRoute({ data: routeData }).then(() => {
          setStep(4);
        });
      }
    };

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
      if (redirect) {
        onUpdateOrCreate();
        return;
      }
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
      onUpdateOrCreate();
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
      <ActionBar step={step} redirect={redirect} onChange={onStepChange} />
    </>
  );
};

export default Create;
