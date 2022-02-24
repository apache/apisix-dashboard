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
import { Divider, Form, notification, Switch } from 'antd';
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useIntl, useLocation } from 'umi';
import type { FormInstance } from 'antd/es/form';

import PanelSection from '@/components/PanelSection';
import PassiveCheck from './components/passive-check';
import ActiveCheck from './components/active-check';
import Scheme from './components/Scheme';
import Timeout from './components/Timeout';
import Type from './components/Type';
import UpstreamSelector from './components/UpstreamSelector';
import Retries from './components/Retries';
import PassHost from './components/PassHost';
import TLSComponent from './components/TLS';
import UpstreamType from './components/UpstreamType';
import { convertToRequestData } from './service';
import RetryTimeout from './components/RetryTimeout';
import KeepalivePool from './components/KeepalivePool';

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
  neverReadonly?: boolean;
};

/**
 * UpstreamForm is used to reuse Upstream Form UI,
 * before using this component, we need to execute the following command:
 * form.setFieldsValue(convertToFormData(VALUE_FROM_API))
 */
const UpstreamForm: React.FC<Props> = forwardRef(
  (
    {
      form,
      disabled = false,
      list = [],
      showSelector = false,
      required = true,
      neverReadonly = false,
    },
    ref,
  ) => {
    const location = useLocation();
    const { formatMessage } = useIntl();
    const [readonly, setReadonly] = useState(false);
    const [hiddenForm, setHiddenForm] = useState(false);

    const timeoutFields = [
      {
        label: formatMessage({ id: 'page.upstream.step.connect.timeout' }),
        name: ['timeout', 'connect'],
        desc: formatMessage({ id: 'page.upstream.step.connect.timeout.desc' }),
      },
      {
        label: formatMessage({ id: 'page.upstream.step.send.timeout' }),
        name: ['timeout', 'send'],
        desc: formatMessage({ id: 'page.upstream.step.send.timeout.desc' }),
      },
      {
        label: formatMessage({ id: 'page.upstream.step.read.timeout' }),
        name: ['timeout', 'read'],
        desc: formatMessage({ id: 'page.upstream.step.read.timeout.desc' }),
      },
    ];

    useImperativeHandle(ref, () => ({
      getData: () => convertToRequestData(form.getFieldsValue()),
    }));

    const resetForm = (upstream_id: string) => {
      if (upstream_id === undefined) {
        setReadonly(disabled);
        return;
      }

      if (!neverReadonly) {
        setReadonly(!['Custom', 'None'].includes(upstream_id) || disabled);
      }

      /**
       * upstream_id === None <==> required === false
       * No need to bind Upstream object.
       * When creating Route and binds with a Service, no need to configure Upstream in Route.
       */
      if (upstream_id === 'None') {
        setHiddenForm(true);
        form.resetFields();
        form.setFieldsValue({ upstream_id: 'None' });
        return;
      }

      setHiddenForm(false);

      // NOTE: Use Ant Design's form object to set data automatically
      if (upstream_id === 'Custom') {
        return;
      }

      // NOTE: Set data from Upstream List (Upstream Selector)
      if (list.length === 0) {
        return;
      }
      form.resetFields();
      const targetData = list.find(
        (item) => item.id === upstream_id,
      ) as UpstreamComponent.ResponseData;
      if (targetData) {
        form.setFieldsValue(targetData);
      }
    };

    /**
     * upstream_id
     * - None: No need to bind Upstream to a resource (e.g Service).
     * - Custom: Users could input values on UpstreamForm
     * - Upstream ID from API
     */
    useEffect(() => {
      const upstream_id = form.getFieldValue('upstream_id');
      resetForm(upstream_id);
    }, [form.getFieldValue('upstream_id'), list]);

    const ActiveHealthCheck = () => (
      <React.Fragment>
        <ActiveCheck.Type readonly={readonly} />
        <Form.Item
          noStyle
          shouldUpdate={(prev, next) => prev.checks.active.type !== next.checks.active.type}
        >
          {() => {
            const type = form.getFieldValue(['checks', 'active', 'type']);
            if (['https'].includes(type)) {
              return <ActiveCheck.HttpsVerifyCertificate readonly={readonly} />;
            }
            return null;
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
          <Form.Item
            label={formatMessage({ id: 'page.upstream.step.healthyCheck.active' })}
            name={['custom', 'checks', 'active']}
            valuePropName="checked"
          >
            <Switch disabled={readonly} />
          </Form.Item>
          <Form.Item shouldUpdate noStyle>
            {() => {
              const active = form.getFieldValue(['custom', 'checks', 'active']);
              if (active) {
                return <ActiveHealthCheck />;
              }
              return null;
            }}
          </Form.Item>
          <Divider orientation="left" plain />
          <Form.Item
            label={formatMessage({ id: 'page.upstream.step.healthyCheck.passive' })}
            name={['custom', 'checks', 'passive']}
            valuePropName="checked"
            tooltip={formatMessage({ id: 'component.upstream.other.health-check.passive-only' })}
          >
            <Switch disabled={readonly} />
          </Form.Item>
          <Form.Item
            shouldUpdate={(prev, next) =>
              prev.custom?.checks?.passive !== next.custom?.checks?.passive
            }
            noStyle
          >
            {() => {
              const passive = form.getFieldValue(['custom', 'checks', 'passive']);
              const active = form.getFieldValue(['custom', 'checks', 'active']);
              if (passive) {
                /*
                 * When enable passive check, we should enable active check, too.
                 * When we use form.setFieldsValue to enable active check, error throws.
                 * We choose to alert users first, and need users to enable active check manually.
                 */
                if (!active) {
                  notification.warn({
                    message: formatMessage({ id: 'component.upstream.other.health-check.invalid' }),
                    description: formatMessage({
                      id: 'component.upstream.other.health-check.passive-only',
                    }),
                  });
                }
                return <PassiveHealthCheck />;
              }
              return null;
            }}
          </Form.Item>
        </PanelSection>
      );
    };

    const KeepalivePoolComponent = () => {
      return (
        <PanelSection title={formatMessage({ id: 'page.upstream.step.keepalive_pool' })}>
          <KeepalivePool readonly={readonly} />
        </PanelSection>
      );
    };

    return (
      <Form
        initialValues={{
          upstream_id: !required && location.pathname === '/routes/create' ? 'None' : 'Custom',
        }}
        form={form}
        labelCol={{ span: 3 }}
      >
        {showSelector && (
          <UpstreamSelector
            list={list}
            disabled={disabled}
            required={required}
            onChange={(nextUpstreamId) => {
              resetForm(nextUpstreamId);
            }}
          />
        )}

        {!hiddenForm && (
          <React.Fragment>
            <Type form={form} readonly={readonly} />

            <UpstreamType form={form} readonly={readonly} />

            <PassHost form={form} readonly={readonly} />
            <Retries readonly={readonly} />
            <RetryTimeout readonly={readonly} />

            <Scheme readonly={readonly} />
            <Form.Item noStyle shouldUpdate={(prev, next) => prev.scheme !== next.scheme}>
              {() => {
                const scheme = form.getFieldValue('scheme') as string;
                if (['https', 'grpcs'].includes(scheme)) {
                  return <TLSComponent form={form} readonly={readonly} />;
                }
                return null;
              }}
            </Form.Item>

            {timeoutFields.map((item, index) => (
              <Timeout key={index} {...item} readonly={readonly} />
            ))}

            <KeepalivePoolComponent />

            <HealthCheckComponent />
          </React.Fragment>
        )}
      </Form>
    );
  },
);

export default UpstreamForm;
