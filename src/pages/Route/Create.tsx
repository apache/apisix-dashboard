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

import { create, fetchItem, update, checkUniqueName, checkHostWithSSL } from './service';
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
    formatMessage({ id: 'page.route.steps.stepTitle.defineApiRequest' }),
    formatMessage({ id: 'component.global.steps.stepTitle.preview' }),
  ];

  const STEP_HEADER_4 = [
    formatMessage({ id: 'page.route.steps.stepTitle.defineApiRequest' }),
    formatMessage({ id: 'page.route.steps.stepTitle.defineApiBackendServe' }),
    formatMessage({ id: 'component.global.steps.stepTitle.pluginConfig' }),
    formatMessage({ id: 'component.global.steps.stepTitle.preview' }),
  ];

  const [advancedMatchingRules, setAdvancedMatchingRules] = useState<RouteModule.MatchingRule[]>(
    [],
  );
  const [upstreamHeaderList, setUpstreamHeaderList] = useState<RouteModule.UpstreamHeader[]>([]);
  const [step3Data, setStep3Data] = useState(DEFAULT_STEP_3_DATA);
  const [redirect, setRedirect] = useState(false);

  const [form1] = Form.useForm();
  const [form2] = Form.useForm();

  const [step, setStep] = useState(1);
  const [stepHeader, setStepHeader] = useState(STEP_HEADER_4);
  const [chart, setChart] = useState(INIT_CHART);

  const setupRoute = (rid: number) =>
    fetchItem(rid).then((data) => {
      form1.setFieldsValue(data.form1Data);
      setAdvancedMatchingRules(data.advancedMatchingRules);
      form2.setFieldsValue(data.form2Data);
      setUpstreamHeaderList(data.upstreamHeaderList);
      setStep3Data(data.step3Data);
    });

  const onReset = () => {
    setAdvancedMatchingRules([]);
    setUpstreamHeaderList([]);
    setStep3Data(DEFAULT_STEP_3_DATA);
    form1.setFieldsValue(DEFAULT_STEP_1_DATA);
    form2.setFieldsValue(DEFAULT_STEP_2_DATA);
    setStep(1);
  };

  useEffect(() => {
    if (props.route.path.indexOf('edit') !== -1) {
      setupRoute(props.match.params.rid);
    } else {
      onReset();
    }
  }, []);

  const renderStep = () => {
    if (step === 1) {
      return (
        <Step1
          form={form1}
          advancedMatchingRules={advancedMatchingRules}
          onChange={({ action, data }) => {
            if (action === 'redirectOptionChange' && data === 'customRedirect') {
              setStepHeader(STEP_HEADER_2);
              setRedirect(true);
            } else {
              setStepHeader(STEP_HEADER_4);
              setRedirect(false);
            }
            if (action === 'advancedMatchingRulesChange') {
              setAdvancedMatchingRules(data);
            }
          }}
          isEdit={props.route.path.indexOf('edit') > 0}
        />
      );
    }

    if (step === 2) {
      if (redirect) {
        return (
          <CreateStep4
            advancedMatchingRules={advancedMatchingRules}
            upstreamHeaderList={upstreamHeaderList}
            form1={form1}
            form2={form2}
            step3Data={step3Data}
            redirect
          />
        );
      }

      return (
        <Step2
          upstreamHeaderList={upstreamHeaderList}
          form={form2}
          onChange={({ action, data }) => {
            if (action === 'upstreamHeaderListChange') {
              setUpstreamHeaderList(data);
            }
          }}
        />
      );
    }

    if (step === 3) {
      return (
        <Step3
          data={step3Data}
          onChange={({ plugins, script = INIT_CHART }) => {
            setStep3Data({ plugins, script });
            setChart(script);
          }}
        />
      );
    }

    if (step === 4) {
      return (
        <CreateStep4
          advancedMatchingRules={advancedMatchingRules}
          upstreamHeaderList={upstreamHeaderList}
          form1={form1}
          form2={form2}
          step3Data={step3Data}
        />
      );
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
    const routeData = {
      form1Data: form1.getFieldsValue(),
      form2Data: form2.getFieldsValue(),
      step3Data,
      upstreamHeaderList,
      advancedMatchingRules,
    } as RouteModule.RequestData;
    const onUpdateOrCreate = () => {
      if (props.route.path.indexOf('edit') !== -1) {
        update((props as any).match.params.rid, routeData).then(() => {
          setStep(5);
        });
      } else {
        create(routeData).then(() => {
          setStep(5);
        });
      }
    };

    const savePlugins = () => {
      if (Object.keys(chart.nodes || {}).length) {
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
          const filterHosts = hosts.filter(Boolean);
          Promise.all([
            redirectOption === 'forceHttps' && filterHosts.length !== 0
              ? checkHostWithSSL(hosts)
              : Promise.resolve(),
            checkUniqueName(value.name, (props as any).match.params.rid || ''),
          ]).then(() => {
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
      form2.validateFields().then(() => {
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
      <PageHeaderWrapper
        title={`${
          (props as any).match.params.rid
            ? formatMessage({ id: 'component.global.edit' })
            : formatMessage({ id: 'component.global.create' })
        } ${formatMessage({ id: 'menu.routes' })}`}
      >
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
