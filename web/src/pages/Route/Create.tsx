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
import React, { useState, useEffect, useRef } from 'react';
import { Card, Steps, Form } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { history, useIntl } from 'umi';
import { isEmpty } from 'lodash';

import ActionBar from '@/components/ActionBar';
import { DEFAULT_UPSTREAM } from '@/components/Upstream';

import { transformer as chartTransformer } from '@/components/PluginOrchestration';
import { create, fetchItem, update, checkUniqueName, checkHostWithSSL } from './service';
import { transformProxyRewrite2Plugin } from './transform';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import CreateStep4 from './components/CreateStep4';
import { DEFAULT_STEP_1_DATA, DEFAULT_STEP_3_DATA, INIT_CHART } from './constants';
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
  const [step3Data, setStep3Data] = useState(DEFAULT_STEP_3_DATA);
  const [redirect, setRedirect] = useState(false);

  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const upstreamRef = useRef<any>();

  const [step, setStep] = useState(1);
  const [stepHeader, setStepHeader] = useState(STEP_HEADER_4);
  const [chart, setChart] = useState(INIT_CHART);

  const setupRoute = (rid: number) =>
    fetchItem(rid).then((data) => {
      form1.setFieldsValue(data.form1Data);
      setAdvancedMatchingRules(data.advancedMatchingRules);
      form2.setFieldsValue(data.form2Data);
      setStep3Data(data.step3Data);
    });

  const onReset = () => {
    setAdvancedMatchingRules([]);
    setStep3Data(DEFAULT_STEP_3_DATA);
    form1.setFieldsValue(DEFAULT_STEP_1_DATA);
    form2.setFieldsValue(DEFAULT_UPSTREAM);
    setStep(1);
  };

  useEffect(() => {
    if (props.route.path.indexOf('edit') !== -1 || props.route.path.indexOf('duplicate') !== -1) {
      setupRoute(props.match.params.rid);
    } else {
      onReset();
    }
  }, []);

  const getProxyRewriteEnable =() => {
    return !isEmpty(transformProxyRewrite2Plugin(form1.getFieldValue('proxyRewrite')));
  }

  const renderStepList = () => {
    if (step === 1) {
      return (
        <Step1
          form={form1}
          advancedMatchingRules={advancedMatchingRules}
          onChange={({ action, data }) => {
            if (action === 'redirectOptionChange') {
              if (data === 'customRedirect') {
                setStepHeader(STEP_HEADER_2);
                setRedirect(true);
              } else {
                setStepHeader(STEP_HEADER_4);
                setRedirect(false);
              }
            }
            if (action === 'advancedMatchingRulesChange') {
              setAdvancedMatchingRules(data);
            }
            if (action === 'custom_normal_labels') {
              form1.setFieldsValue({ custom_normal_labels: data });
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
            form1={form1}
            form2={form2}
            step3Data={step3Data}
            upstreamRef={upstreamRef}
            redirect
          />
        );
      }

      return (
        <Step2
          form={form2}
          upstreamRef={upstreamRef}
          hasServiceId={form1.getFieldValue('service_id') !== ''}
        />
      );
    }

    if (step === 3) {
      return (
        <Step3
          data={step3Data}
          isForceHttps={form1.getFieldValue('redirectOption') === 'forceHttps'}
          isProxyEnable={getProxyRewriteEnable()}
          onChange={({ plugins, script = INIT_CHART, plugin_config_id }) => {
            setStep3Data({ plugins, script, plugin_config_id });
            setChart(script);
          }}
        />
      );
    }

    if (step === 4) {
      return (
        <CreateStep4
          advancedMatchingRules={advancedMatchingRules}
          form1={form1}
          form2={form2}
          upstreamRef={upstreamRef}
          step3Data={step3Data}
          isEdit={props.route.path.indexOf('edit') > 0}
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
    const onUpdateOrCreate = () => {
      const routeData = {
        form1Data: form1.getFieldsValue(),
        form2Data: upstreamRef.current?.getData(),
        step3Data,
        advancedMatchingRules,
      } as RouteModule.RequestData;
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
            checkUniqueName(value.name, props.route.path.indexOf('edit') > 0 ? (props as any).match.params.rid : ''),
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
          formatMessage({ id: `component.global.${props.route.path.split('/').slice(-1)[0]}`})
        } ${formatMessage({ id: 'menu.routes' })}`}
      >
        <Card bordered={false}>
          <Steps current={step - 1} className={styles.steps}>
            {stepHeader.map((item) => (
              <Step title={item} key={item} />
            ))}
          </Steps>
          {renderStepList()}
          {/* NOTE: PluginOrchestration works unexpected when using <renderStepList/> */}
        </Card>
      </PageHeaderWrapper>
      <ActionBar step={step} lastStep={redirect ? 2 : 4} onChange={onStepChange} withResultView />
    </>
  );
};

export default Page;
