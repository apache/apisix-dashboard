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
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { useRequest } from 'ahooks';
import { Card, Form, Modal, Steps } from 'antd';
import { isEmpty } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { history, useIntl } from 'umi';

import ActionBar from '@/components/ActionBar';
import FlowGraph from '@/components/PluginFlow/components/FlowGraph';

import CreateStep4 from './components/CreateStep4';
import ResultView from './components/ResultView';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import { DEFAULT_STEP_1_DATA, DEFAULT_STEP_3_DATA } from './constants';
import styles from './Create.less';
import { checkHostWithSSL, checkUniqueName, create, fetchItem, update } from './service';
import { transformProxyRewrite2Plugin } from './transform';

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

  const setupRoute = (rid: number) =>
    fetchItem(rid).then((data) => {
      const routeData = { ...data };
      if (props.route.path.indexOf('duplicate') !== -1) {
        routeData.form1Data.name = '';
      }
      form1.setFieldsValue(routeData.form1Data);
      setAdvancedMatchingRules(routeData.advancedMatchingRules);
      form2.setFieldsValue(routeData.form2Data);
      setStep3Data(routeData.step3Data);
    });

  const onReset = () => {
    setAdvancedMatchingRules([]);
    setStep3Data(DEFAULT_STEP_3_DATA);
    form1.setFieldsValue(DEFAULT_STEP_1_DATA);
    setStep(1);
  };

  useEffect(() => {
    if (props.route.path.indexOf('edit') !== -1 || props.route.path.indexOf('duplicate') !== -1) {
      setupRoute(props.match.params.rid);
    } else {
      onReset();
    }
  }, []);

  const getProxyRewriteEnable = () => {
    return !isEmpty(transformProxyRewrite2Plugin(form1.getFieldValue('proxyRewrite')));
  };

  const renderStepList = () => {
    if (step === 1) {
      return (
        <Step1
          form={form1}
          upstreamForm={form2}
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
          onChange={({ plugins, script = {}, plugin_config_id }) => {
            setStep3Data({ plugins, script, plugin_config_id });
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

  const savePlugins = (): boolean => {
    const isScriptConfigured = FlowGraph.graph?.toJSON().cells.length;
    const isPluginsConfigured = Object.keys(step3Data.plugins || {}).length;

    if (step === 3 && isScriptConfigured && isPluginsConfigured) {
      Modal.confirm({
        title: formatMessage({ id: 'component.plugin-flow.text.both-modes-exist.title' }),
        content: formatMessage({ id: 'component.plugin-flow.text.both-modes-exist' }),
        onOk: () => {
          const data = FlowGraph.convertToData();
          if (data) {
            setStep3Data({ script: data, plugins: {} });
            setStep(4);
          }
        },
        okText: formatMessage({ id: 'component.global.confirm' }),
        cancelText: formatMessage({ id: 'component.global.cancel' }),
      });
      return false;
    }

    if (isScriptConfigured) {
      const data = FlowGraph.convertToData();
      if (!data) {
        return false;
      }
      setStep3Data({ script: data, plugins: {} });
    } else {
      setStep3Data({ ...step3Data, script: {} });
    }
    return true;
  };

  const { runAsync: createRoutes, loading: submitLoading } = useRequest(create, { manual: true });

  const onStepChange = (nextStep: number) => {
    const onUpdateOrCreate = () => {
      const routeData = {
        form1Data: form1.getFieldsValue(),
        form2Data: upstreamRef.current?.getData(),
        step3Data,
        advancedMatchingRules,
      } as RouteModule.RequestData;
      const { path } = props.route;

      if (path.indexOf('edit') !== -1) {
        update((props as any).match.params.rid, routeData).then(() => {
          setStep(5);
        });
      } else {
        if (path.indexOf('duplicate') !== -1) {
          delete routeData.form1Data.id;
        }
        createRoutes(routeData).then(() => {
          setStep(5);
        });
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
            checkUniqueName(
              value.name,
              props.route.path.indexOf('edit') > 0 ? (props as any).match.params.rid : '',
            ),
          ]).then(() => {
            setStep(nextStep);
          });
        });
      } else {
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
      const result = savePlugins();
      if (!result) {
        return;
      }
      setStep(nextStep);
    }

    if (nextStep === 5) {
      onUpdateOrCreate();
    }
  };

  return (
    <>
      <PageHeaderWrapper
        title={`${formatMessage({
          id: `component.global.${props.route.path.split('/').slice(-1)[0]}`,
        })} ${formatMessage({ id: 'menu.routes' })}`}
      >
        <Card bordered={false}>
          <Steps current={step - 1} className={styles.steps}>
            {stepHeader.map((item) => (
              <Step title={item} key={item} />
            ))}
          </Steps>
          {renderStepList()}
        </Card>
      </PageHeaderWrapper>
      <ActionBar
        step={step}
        loading={submitLoading}
        lastStep={redirect ? 2 : 4}
        onChange={onStepChange}
        withResultView
      />
    </>
  );
};

export default Page;
