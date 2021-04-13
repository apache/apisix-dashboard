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
import { Divider, Form, Switch } from 'antd';
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useIntl } from 'umi';
import type { FormInstance } from 'antd/es/form';

import { PanelSection } from '@api7-dashboard/ui';
import { transformRequest } from '@/pages/Upstream/transform';
import { DEFAULT_UPSTREAM } from './constant';
import PassiveCheck from './components/passive-check';
import ActiveCheck from './components/active-check'
import Nodes from './components/Nodes'
import Scheme from './components/Scheme';
import Timeout from './components/Timeout';
import Type from './components/Type';
import UpstreamSelector from './components/UpstreamSelector';
import Retries from './components/Retries';
import PassHost from './components/PassHost';

type Upstream = {
  name?: string;
  id?: string;
};

type Props = {
  form: FormInstance;
  disabled?: boolean;
  list?: Upstream[];
  showSelector?: boolean;
  // FIXME: use proper typing
  ref?: any;
  required?: boolean;
};

const UpstreamForm: React.FC<Props> = forwardRef(
  ({ form, disabled, list = [], showSelector, required = true }, ref) => {
    const { formatMessage } = useIntl();
    const [readonly, setReadonly] = useState(
      Boolean(form.getFieldValue('upstream_id')) || disabled,
    );
    const [hiddenForm, setHiddenForm] = useState(false);

    const timeoutFields = [
      {
        label: formatMessage({ id: 'page.upstream.step.connect.timeout' }),
        name: ['timeout', 'connect'],
        desc: formatMessage({ id: 'page.upstream.step.connect.timeout.desc' })
      },
      {
        label: formatMessage({ id: 'page.upstream.step.send.timeout' }),
        name: ['timeout', 'send'],
        desc: formatMessage({ id: 'page.upstream.step.send.timeout.desc' })
      },
      {
        label: formatMessage({ id: 'page.upstream.step.read.timeout' }),
        name: ['timeout', 'read'],
        desc: formatMessage({ id: 'page.upstream.step.read.timeout.desc' })
      },
    ];

    useImperativeHandle(ref, () => ({
      getData: () => transformRequest(form.getFieldsValue()),
    }));

    useEffect(() => {
      const formData = transformRequest(form.getFieldsValue()) || {};
      const { upstream_id } = form.getFieldsValue();

      if (upstream_id === 'None') {
        setHiddenForm(true);
        if (required) {
          requestAnimationFrame(() => {
            form.resetFields();
            form.setFieldsValue(DEFAULT_UPSTREAM);
            setHiddenForm(false);
          });
        }
      } else {
        if (upstream_id) {
          requestAnimationFrame(() => {
            form.setFieldsValue(list.find((item) => item.id === upstream_id));
          });
        }
        if (!required && !Object.keys(formData).length) {
          requestAnimationFrame(() => {
            form.setFieldsValue({ upstream_id: 'None' });
            setHiddenForm(true);
          });
        }
      }
      setReadonly(Boolean(upstream_id) || disabled);
    }, [list]);



    const ActiveHealthCheck = () => (
      <React.Fragment>
        <ActiveCheck.Type readonly={readonly} />
        <ActiveCheck.Timeout readonly={readonly} />
        <ActiveCheck.Host readonly={readonly} />
        <ActiveCheck.Port readonly={readonly} />
        <ActiveCheck.HttpPath readonly={readonly} />

        <Divider orientation="left" plain>
          {formatMessage({ id: 'page.upstream.step.healthyCheck.healthy.status' })}
        </Divider>

        <ActiveCheck.Healthy.Interval readonly={readonly} />
        <ActiveCheck.Healthy.Successes readonly={readonly} />

        <Divider orientation="left" plain>
          {formatMessage({ id: 'page.upstream.step.healthyCheck.unhealthyStatus' })}
        </Divider>

        <ActiveCheck.Unhealthy.Timeouts readonly={readonly} />
        <ActiveCheck.Unhealthy.Interval readonly={readonly} />
        <ActiveCheck.Unhealthy.HttpStatuses readonly={readonly} />
        <ActiveCheck.Unhealthy.HttpFailures readonly={readonly} />

        <Divider orientation="left" plain>Others</Divider>

        <ActiveCheck.ReqHeaders readonly={readonly} />
      </React.Fragment>
    );

    const InActiveHealthCheck = () => (
      <React.Fragment>
        <PassiveCheck.Type readonly={readonly} />

        <Divider orientation="left" plain>
          {formatMessage({ id: 'page.upstream.step.healthyCheck.healthy.status' })}
        </Divider>

        <PassiveCheck.Healthy.HttpStatuses readonly={readonly} />
        <PassiveCheck.Healthy.Successes readonly={readonly} />

        <Divider orientation="left" plain>
          {formatMessage({ id: 'page.upstream.step.healthyCheck.unhealthyStatus' })}
        </Divider>

        <PassiveCheck.Unhealthy.Timeouts readonly={readonly} />
        <PassiveCheck.Unhealthy.TcpFailures readonly={readonly} />
        <PassiveCheck.Unhealthy.HttpFailures readonly={readonly} />
        <PassiveCheck.Unhealthy.HttpStatuses readonly={readonly} />
      </React.Fragment>
    );

    const HealthCheckComponent = () => {
      const options = [
        {
          label: formatMessage({ id: 'page.upstream.step.healthyCheck.active' }),
          name: ['checks', 'active'],
          component: (
            <>
              <ActiveHealthCheck />
              <Divider orientation="left" plain />
            </>
          ),
        },
        {
          label: formatMessage({ id: 'page.upstream.step.healthyCheck.passive' }),
          name: ['checks', 'passive'],
          component: <InActiveHealthCheck />,
        },
      ]

      return (
        <PanelSection
          title={formatMessage({ id: 'page.upstream.step.healthyCheck.healthy.check' })}
        >
          {options.map(({ label, name, component }) => (
            <div key={label}>
              <Form.Item label={label} name={name} valuePropName="checked" key={label}>
                <Switch disabled={readonly} />
              </Form.Item>
              <Form.Item shouldUpdate noStyle>
                {() => {
                  if (form.getFieldValue(name)) {
                    return component;
                  }
                  return null;
                }}
              </Form.Item>
            </div>
          ))}
        </PanelSection>
      )
    }


    return (
      <Form
        form={form}
        labelCol={{ span: 3 }}
        initialValues={{
          pass_host: 'pass',
        }}
      >
        {showSelector && (
          <UpstreamSelector
            list={list}
            disabled={disabled}
            required={required}
            shouldUpdate={(prev, next) => {
              setReadonly(Boolean(next.upstream_id));
              if (prev.upstream_id !== next.upstream_id) {
                const id = next.upstream_id;
                if (id) {
                  form.setFieldsValue(list.find((item) => item.id === id));
                  form.setFieldsValue({
                    upstream_id: id,
                  });
                }
              }
              return prev.upstream_id !== next.upstream_id;
            }}
            onChange={(upstream_id) => {
              setReadonly(Boolean(upstream_id));
              setHiddenForm(Boolean(upstream_id === 'None'));
              form.setFieldsValue(list.find((item) => item.id === upstream_id));
              if (upstream_id === '') {
                form.resetFields();
                form.setFieldsValue(DEFAULT_UPSTREAM);
              }
            }}
          />
        )}

        {!hiddenForm && (
          <React.Fragment>
            <Type form={form} readonly={readonly} />
            <Nodes readonly={readonly} />

            <PassHost form={form} readonly={readonly} />
            <Retries readonly={readonly} />
            <Scheme readonly={readonly} />
            {timeoutFields.map((item, index) => (
              <Timeout key={index} {...item} readonly={readonly} />
            ))}

            <HealthCheckComponent />
          </React.Fragment>
        )}
      </Form>
    );
  },
);

export default UpstreamForm;
