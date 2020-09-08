/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { useState, useEffect } from 'react';
import { Card, Steps, Form } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { history, useIntl } from 'umi';
import { transformer as chartTransformer } from '@api7-dashboard/pluginchart';

import ActionBar from '@/components/ActionBar';

import {
  create,
  fetchItem,
  update,
  checkUniqueName,
  fetchUpstreamItem,
  checkHostWithSSL,
} from './service';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';

import CreateStep4 from './components/CreateStep4';
import {
  DEFAULT_STEP_1_DATA,
  DEFAULT_STEP_2_DATA,
  DEFAULT_STEP_3_DATA,
  INIT_CHART,
} from './constants';
import ResultView from './components/ResultView';
import styles from './Create.less';

const { Step } = Steps;

type Props = {
  // FIXME
  route: any;
  match: any;
};

const Page: React.FC<Props> = (props) => {
  const { formatMessage } = useIntl();

  const STEP_HEADER_2 = [
    formatMessage({ id: 'route.constants.define.api.request' }),
    formatMessage({ id: 'route.constants.preview' }),
  ];

  const STEP_HEADER_4 = [
    formatMessage({ id: 'route.constants.define.api.request' }),
    formatMessage({ id: 'route.constants.define.api.backend.serve' }),
    formatMessage({ id: 'route.constants.plugin.configuration' }),
    formatMessage({ id: 'route.constants.preview' }),
  ];

  const [step1Data, setStep1Data] = useState(DEFAULT_STEP_1_DATA);
  const [step2Data, setStep2Data] = useState(DEFAULT_STEP_2_DATA);
  const [step3Data, setStep3Data] = useState(DEFAULT_STEP_3_DATA);

  const [redirect, setRedirect] = useState(false);

  const [form1] = Form.useForm();
  const [form2] = Form.useForm();

  const [step, setStep] = useState(1);
  const [stepHeader, setStepHeader] = useState(STEP_HEADER_4);

  const [chart, setChart] = useState(INIT_CHART);

  const routeData = {
    step1Data,
    step2Data,
    step3Data,
  };
  const setupRoute = (rid: number) =>
    fetchItem(rid).then((data) => {
      form1.setFieldsValue(data.step1Data);
      setStep1Data(data.step1Data as RouteModule.Step1Data);

      form2.setFieldsValue(data.step2Data);
      setStep2Data(data.step2Data);

      setStep3Data(data.step3Data);
    });

  useEffect(() => {
    if (props.route.path.indexOf('edit') !== -1) {
      setupRoute(props.match.params.rid);
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

  const onReset = () => {
    setStep1Data(DEFAULT_STEP_1_DATA);
    setStep2Data(DEFAULT_STEP_2_DATA);
    setStep3Data(DEFAULT_STEP_3_DATA);

    form1.setFieldsValue(DEFAULT_STEP_1_DATA);
    form2.setFieldsValue(DEFAULT_STEP_2_DATA);
    setStep(1);
  };

  const renderStep = () => {
    if (step === 1) {
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

    if (step === 2) {
      if (redirect) {
        return (
          <CreateStep4 data={routeData} form1={form1} form2={form2} onChange={() => {}} redirect />
        );
      }

      return (
        <Step2
          data={routeData}
          form={form2}
          onChange={(params: RouteModule.Step2Data) => {
            if (params.upstream_id) {
              fetchUpstreamItem(params.upstream_id).then((data) => {
                form2.setFieldsValue({
                  ...form2.getFieldsValue(),
                  ...data,
                });
                setStep2Data({
                  ...step2Data,
                  ...form2.getFieldsValue(),
                  ...params,
                } as RouteModule.Step2Data);
              });
              return;
            }
            setStep2Data({
              ...step2Data,
              ...form2.getFieldsValue(),
              ...params,
            } as RouteModule.Step2Data);
          }}
        />
      );
    }

    if (step === 3) {
      return (
        <Step3
          readonly={false}
          data={routeData.step3Data}
          onChange={({ mode, data }) => {
            if (mode === 'NORMAL') {
              setStep3Data({ plugins: data, script: {} });
              setChart(INIT_CHART);
            } else {
              setChart(data);
            }
          }}
        />
      );
    }

    if (step === 4) {
      return <CreateStep4 data={routeData} form1={form1} form2={form2} onChange={() => {}} />;
    }

    if (step === 5) {
      return (
        <ResultView
          createNew={() => {
            if (props.route.path.indexOf('edit') !== -1) {
              return history.replace('/routes/create');
            }
            return onReset();
          }}
        />
      );
    }
    return null;
  };

  const onStepChange = (nextStep: number) => {
    const onUpdateOrCreate = () => {
      if (props.route.path.indexOf('edit') !== -1) {
        update((props as any).match.params.rid, { data: routeData }).then(() => {
          setStep(5);
        });
      } else {
        create({ data: routeData }).then(() => {
          setStep(5);
        });
      }
    };

    const savePlugins = () => {
      if (Object.keys(chart.nodes).length) {
        const transformChart = chartTransformer(chart);
        setStep3Data({ script: { ...transformChart, chart }, plugins: {} });
      } else {
        setStep3Data({ ...step3Data, script: {} });
      }
    };

    if (nextStep === 1) {
      setStep(nextStep);
    }

    if (nextStep === 2) {
      if (step === 1) {
        form1.validateFields().then((value) => {
          const { redirectOption, hosts } = value;
          Promise.all([
            redirectOption === 'forceHttps' ? checkHostWithSSL(hosts) : Promise.resolve(),
            checkUniqueName(value.name, (props as any).match.params.rid || ''),
          ]).then(() => {
            setStep1Data({ ...step1Data, ...value });
            setStep(nextStep);
          });
        });
      } else {
        savePlugins();
        setStep(nextStep);
      }
      return;
    }

    if (nextStep === 3) {
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

    if (nextStep === 4) {
      savePlugins();
      setStep(nextStep);
    }

    if (nextStep === 5) {
      onUpdateOrCreate();
    }
  };

  return (
    <>
      <PageHeaderWrapper title={formatMessage({ id: 'route.create.management' })}>
        <Card bordered={false}>
          <Steps current={step - 1} className={styles.steps}>
            {stepHeader.map((item) => (
              <Step title={item} key={item} />
            ))}
          </Steps>
          {renderStep()}
        </Card>
      </PageHeaderWrapper>
      <ActionBar step={step} lastStep={redirect ? 2 : 4} onChange={onStepChange} withResultView />
    </>
  );
};

export default Page;
