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

import PanelSection from '@/components/PanelSection';
import { transformRequest } from '@/pages/Upstream/transform';
import PassiveCheck from './components/passive-check';
import ActiveCheck from './components/active-check'
import Nodes from './components/Nodes'
import Scheme from './components/Scheme';
import Timeout from './components/Timeout';
import Type from './components/Type';
import UpstreamSelector from './components/UpstreamSelector';
import Retries from './components/Retries';
import PassHost from './components/PassHost';
import TLSComponent from './components/TLS';
import { transformUpstreamDataFromRequest } from './service';

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
            setHiddenForm(false);
          });
        }
      } else {
        if (upstream_id) {
          requestAnimationFrame(() => {
            const targetData = list.find((item) => item.id === upstream_id) as UpstreamComponent.ResponseData
            if (targetData) {
              form.setFieldsValue(transformUpstreamDataFromRequest(targetData));
            }
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
        <Form.Item noStyle shouldUpdate={(prev, next) => prev.checks.active.type !== next.checks.active.type}>
          {() => {
            const type = form.getFieldValue(['checks', 'active', 'type'])
            if (['https'].includes(type)) {
              return <ActiveCheck.HttpsVerifyCertificate readonly={readonly} />
            }
            return null
          }}
        </Form.Item>
        <ActiveCheck.Timeout readonly={readonly} />
        <ActiveCheck.Concurrency readonly={readonly} />
        <ActiveCheck.Host readonly={readonly} />
        <ActiveCheck.Port readonly={readonly} />
        <ActiveCheck.HttpPath readonly={readonly} />
        <ActiveCheck.ReqHeaders readonly={readonly} />

        <Divider orientation="left" plain>
          {formatMessage({ id: 'page.upstream.step.healthyCheck.healthy.status' })}
        </Divider>

        <ActiveCheck.Healthy.Interval readonly={readonly} />
        <ActiveCheck.Healthy.Successes readonly={readonly} />
        <ActiveCheck.Healthy.HttpStatuses readonly={readonly} />

        <Divider orientation="left" plain>
          {formatMessage({ id: 'page.upstream.step.healthyCheck.unhealthyStatus' })}
        </Divider>

        <ActiveCheck.Unhealthy.Timeouts readonly={readonly} />
        <ActiveCheck.Unhealthy.Interval readonly={readonly} />
        <ActiveCheck.Unhealthy.HttpStatuses readonly={readonly} />
        <ActiveCheck.Unhealthy.HttpFailures readonly={readonly} />
        <ActiveCheck.Unhealthy.TCPFailures readonly={readonly} />
      </React.Fragment>
    );

    const PassiveHealthCheck = () => (
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
      return (
        <PanelSection
          title={formatMessage({ id: 'page.upstream.step.healthyCheck.healthy.check' })}
        >
          <Form.Item label={formatMessage({ id: 'page.upstream.step.healthyCheck.active' })} name={['custom', 'checks', 'active']} valuePropName="checked">
            <Switch disabled={readonly} />
          </Form.Item>
          <Form.Item shouldUpdate noStyle>
            {
              () => {
                const active = form.getFieldValue(['custom', 'checks', 'active'])
                if (active) {
                  return (
                    <ActiveHealthCheck />
                  )
                }
                return null
              }
            }
          </Form.Item>
          <Divider orientation="left" plain />
          <Form.Item label={formatMessage({ id: 'page.upstream.step.healthyCheck.passive' })} name={['custom', 'checks', 'passive']} valuePropName="checked">
            <Switch disabled={readonly} />
          </Form.Item>
          <Form.Item shouldUpdate noStyle>
            {
              () => {
                const passive = form.getFieldValue(['custom', 'checks', 'passive'])
                if (passive) {
                  /*
                  * When enable passive check, we should enable active check, too.
                  * When we use form.setFieldsValue to enable active check, error throws.
                  * We choose to alert users first, and need users to enable active check manually.
                  */
                  return <PassiveHealthCheck />
                }
                return null
              }
            }
          </Form.Item>
        </PanelSection>
      )
    }

    return (
      <Form
        form={form}
        labelCol={{ span: 3 }}
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
                  const targetData = list.find((item) => item.id === id) as UpstreamComponent.ResponseData
                  if (targetData) {
                    form.setFieldsValue(transformUpstreamDataFromRequest(targetData));
                  }
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
              const targetData = list.find((item) => item.id === upstream_id) as UpstreamComponent.ResponseData
              if (targetData) {
                form.setFieldsValue(transformUpstreamDataFromRequest(targetData));
              }
              if (upstream_id === '') {
                form.resetFields();
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
            <Form.Item noStyle shouldUpdate={(prev, next) => prev.scheme !== next.scheme}>
              {
                () => {
                  const scheme = form.getFieldValue("scheme") as string
                  if (["https", "grpcs"].includes(scheme)) {
                    return <TLSComponent form={form} readonly={readonly} />
                  }
                  return null
                }
              }
            </Form.Item>

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
