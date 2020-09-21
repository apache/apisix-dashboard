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
import React from 'react';
import { Form, Input, Row, Col, InputNumber, Select, Switch, notification } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { useIntl } from 'umi';

import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import Button from 'antd/es/button';
import {
  FORM_ITEM_WITHOUT_LABEL,
  FORM_ITEM_LAYOUT,
  HASH_KEY_LIST,
  HASH_ON_LIST,
} from '@/pages/Upstream/constants';
import { PanelSection } from '@api7-dashboard/ui';

type Props = {
  form: FormInstance;
  disabled?: boolean;
  isActive: boolean;
  isPassive: boolean;
  onChange(checkActive: boolean, checkPassive: boolean): void;
};

const initialValues = {
  name: '',
  description: '',
  type: 'roundrobin',
  upstreamHostList: [{} as UpstreamModule.UpstreamHost],
  timeout: {
    connect: 6000,
    send: 6000,
    read: 6000,
  },
  active: false,
  passive: false,
  checks: {
    active: {
      timeout: 5,
      http_path: '',
      host: '',
      healthy: {
        interval: 2,
        successes: 1,
      },
      unhealthy: {
        interval: 1,
        http_failures: 2,
      },
      req_headers: [''],
    },
    passive: {
      healthy: {
        http_statuses: [undefined],
        successes: 3,
      },
      unhealthy: {
        http_statuses: [undefined],
        http_failures: 3,
        tcp_failures: 3,
      },
    },
  },
};

const Step1: React.FC<Props> = ({ form, disabled, isActive, onChange, isPassive }) => {
  const { formatMessage } = useIntl();

  const renderUpstreamMeta = () => (
    <Form.List name="upstreamHostList">
      {(fields, { add, remove }) => (
        <>
          {fields.map((field, index) => (
            <Form.Item
              required
              key={field.key}
              {...(index === 0 ? FORM_ITEM_LAYOUT : FORM_ITEM_WITHOUT_LABEL)}
              label={
                index === 0
                  ? formatMessage({ id: 'upstream.step.backend.server.domain.or.ip' })
                  : ''
              }
              extra={
                index === 0
                  ? formatMessage({ id: 'upstream.step.domain.name.default.analysis' })
                  : ''
              }
            >
              <Row style={{ marginBottom: '10px' }} gutter={16}>
                <Col span={5}>
                  <Form.Item
                    style={{ marginBottom: 0 }}
                    name={[field.name, 'host']}
                    rules={[
                      {
                        required: true,
                        message: formatMessage({ id: 'upstream.step.input.domain.name.or.ip' }),
                      },
                      {
                        pattern: new RegExp(
                          /(^([1-9]?\d|1\d{2}|2[0-4]\d|25[0-5])(\.(25[0-5]|1\d{2}|2[0-4]\d|[1-9]?\d)){3}$|^(?![0-9.]+$)([a-zA-Z0-9_-]+)(\.[a-zA-Z0-9_-]+){0,}$)/,
                          'g',
                        ),
                        message: formatMessage({ id: 'upstream.step.domain.name.or.ip.rule' }),
                      },
                    ]}
                  >
                    <Input
                      placeholder={formatMessage({ id: 'upstream.step.domain.name.or.ip' })}
                      disabled={disabled}
                    />
                  </Form.Item>
                </Col>
                <Col span={3}>
                  <Form.Item
                    style={{ marginBottom: 0 }}
                    name={[field.name, 'port']}
                    rules={[
                      {
                        required: true,
                        message: formatMessage({ id: 'upstream.step.input.port' }),
                      },
                    ]}
                  >
                    <InputNumber
                      placeholder={formatMessage({ id: 'upstream.step.port' })}
                      disabled={disabled}
                      min={1}
                      max={65535}
                    />
                  </Form.Item>
                </Col>
                <Col span={3}>
                  <Form.Item
                    style={{ marginBottom: 0 }}
                    name={[field.name, 'weight']}
                    rules={[
                      {
                        required: true,
                        message: formatMessage({ id: 'upstream.step.input.weight' }),
                      },
                    ]}
                  >
                    <InputNumber
                      placeholder={formatMessage({ id: 'upstream.step.weight' })}
                      disabled={disabled}
                      min={0}
                      max={1000}
                    />
                  </Form.Item>
                </Col>
                <Col
                  style={{
                    marginLeft: -10,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {!disabled &&
                    (fields.length > 1 ? (
                      <MinusCircleOutlined
                        style={{ margin: '0 8px' }}
                        onClick={() => {
                          remove(field.name);
                        }}
                      />
                    ) : null)}
                </Col>
              </Row>
            </Form.Item>
          ))}
          {!disabled && (
            <Form.Item {...FORM_ITEM_WITHOUT_LABEL}>
              <Button
                type="dashed"
                onClick={() => {
                  add();
                }}
              >
                <PlusOutlined />
                {formatMessage({ id: 'upstream.step.create' })}
              </Button>
            </Form.Item>
          )}
        </>
      )}
    </Form.List>
  );

  const renderTimeUnit = () => <span style={{ margin: '0 8px' }}>ms</span>;

  const handleActiveChange = () => {
    if (isActive) {
      onChange(!isActive, false);
      form.setFieldsValue({ ...form.getFieldsValue(), passive: false });
      return;
    }
    onChange(!isActive, isPassive);
    form.setFieldsValue({ ...form.getFieldsValue(), active: !isActive });
  };
  const handlePassiveChange = () => {
    if (!isActive) {
      notification.warning({
        message: formatMessage({ id: 'upstream.notificationMessage.enableHealthCheckFirst' }),
      });
      form.setFieldsValue({ ...form.getFieldsValue(), passive: isPassive });
      return;
    }
    onChange(isActive, !isPassive);
    form.setFieldsValue({ ...form.getFieldsValue(), passive: !isPassive });
  };

  const renderPassiveHealthyCheck = () => (
    <>
      <Form.Item label={formatMessage({ id: 'upstream.step.healthy.checks.healthy' })} />
      <Form.List name={['checks', 'passive', 'healthy', 'http_statuses']}>
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <Form.Item
                required
                key={field.key}
                {...(index === 0 ? FORM_ITEM_LAYOUT : FORM_ITEM_WITHOUT_LABEL)}
                label={
                  index === 0
                    ? formatMessage({ id: 'upstream.step.healthy.checks.passive.http_statuses' })
                    : ''
                }
              >
                <Row style={{ marginBottom: '10px' }} gutter={16}>
                  <Col span={4}>
                    <Form.Item style={{ marginBottom: 0 }} name={[field.name]}>
                      <InputNumber
                        placeholder={formatMessage({
                          id: 'upstream.step.input.healthy.checks.passive.http_statuses',
                        })}
                        disabled={disabled}
                      />
                    </Form.Item>
                  </Col>
                  <Col
                    style={{
                      marginLeft: -10,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {!disabled &&
                      (fields.length > 1 ? (
                        <MinusCircleOutlined
                          style={{ margin: '0 8px' }}
                          onClick={() => {
                            remove(field.name);
                          }}
                        />
                      ) : null)}
                  </Col>
                </Row>
              </Form.Item>
            ))}
            {!disabled && (
              <Form.Item {...FORM_ITEM_WITHOUT_LABEL}>
                <Button
                  type="dashed"
                  onClick={() => {
                    add();
                  }}
                >
                  <PlusOutlined />
                  {formatMessage({ id: 'upstream.step.create' })}
                </Button>
              </Form.Item>
            )}
          </>
        )}
      </Form.List>
      <Form.Item label={formatMessage({ id: 'upstream.step.healthy.checks.successes' })} required>
        <Form.Item
          name={['checks', 'passive', 'healthy', 'successes']}
          noStyle
          rules={[
            {
              required: true,
              message: formatMessage({ id: 'upstream.step.input.receive.timeout' }),
            },
          ]}
        >
          <InputNumber disabled={disabled} min={1} max={254} />
        </Form.Item>
      </Form.Item>
      <Form.Item label={formatMessage({ id: 'upstream.step.healthy.checks.unhealthy' })} />
      <Form.List name={['checks', 'passive', 'unhealthy', 'http_statuses']}>
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <Form.Item
                required
                key={field.key}
                {...(index === 0 ? FORM_ITEM_LAYOUT : FORM_ITEM_WITHOUT_LABEL)}
                label={
                  index === 0
                    ? formatMessage({ id: 'upstream.step.healthy.checks.passive.http_statuses' })
                    : ''
                }
              >
                <Row style={{ marginBottom: '10px' }} gutter={16}>
                  <Col span={4}>
                    <Form.Item style={{ marginBottom: 0 }} name={[field.name]}>
                      <InputNumber
                        placeholder={formatMessage({
                          id: 'upstream.step.input.healthy.checks.passive.http_statuses',
                        })}
                        disabled={disabled}
                        max={599}
                      />
                    </Form.Item>
                  </Col>
                  <Col
                    style={{
                      marginLeft: -10,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {!disabled &&
                      (fields.length > 1 ? (
                        <MinusCircleOutlined
                          style={{ margin: '0 8px' }}
                          onClick={() => {
                            remove(field.name);
                          }}
                        />
                      ) : null)}
                  </Col>
                </Row>
              </Form.Item>
            ))}
            {!disabled && (
              <Form.Item {...FORM_ITEM_WITHOUT_LABEL}>
                <Button
                  type="dashed"
                  onClick={() => {
                    add();
                  }}
                >
                  <PlusOutlined />
                  {formatMessage({ id: 'upstream.step.create' })}
                </Button>
              </Form.Item>
            )}
          </>
        )}
      </Form.List>
      <Form.Item
        label={formatMessage({ id: 'upstream.step.healthy.checks.http_failures' })}
        required
      >
        <Form.Item
          name={['checks', 'passive', 'unhealthy', 'http_failures']}
          noStyle
          rules={[
            {
              required: true,
              message: formatMessage({ id: 'upstream.step.input.healthy.checks.http_failures' }),
            },
          ]}
        >
          <InputNumber disabled={disabled} min={1} max={254} />
        </Form.Item>
      </Form.Item>
      <Form.Item
        label={formatMessage({ id: 'upstream.step.healthy.checks.passive.tcp_failures' })}
        required
      >
        <Form.Item
          name={['checks', 'passive', 'unhealthy', 'tcp_failures']}
          noStyle
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'upstream.step.input.healthy.checks.passive.tcp_failures',
              }),
            },
          ]}
        >
          <InputNumber disabled={disabled} min={1} max={254} />
        </Form.Item>
      </Form.Item>
    </>
  );

  const renderActiveHealthyCheck = () => (
    <>
      <Form.Item label={formatMessage({ id: 'upstream.step.healthy.checks.active.timeout' })}>
        <Form.Item name={['checks', 'active', 'timeout']} noStyle>
          <InputNumber disabled={disabled} />
        </Form.Item>
        <span style={{ margin: '0 8px' }}>s</span>
      </Form.Item>
      <Form.Item
        label={formatMessage({ id: 'upstream.step.healthy.checks.active.http_path' })}
        required
      >
        <Form.Item
          name={['checks', 'active', 'http_path']}
          noStyle
          rules={[
            {
              required: true,
              message: formatMessage({ id: 'upstream.step.input.healthy.checks.active.http_path' }),
            },
          ]}
        >
          <Input
            disabled={disabled}
            placeholder={formatMessage({
              id: 'upstream.step.input.healthy.checks.active.http_path',
            })}
          />
        </Form.Item>
      </Form.Item>
      <Form.Item label={formatMessage({ id: 'upstream.step.healthy.checks.active.host' })} required>
        <Form.Item
          style={{ marginBottom: 0 }}
          name={['checks', 'active', 'host']}
          rules={[
            {
              required: true,
              message: formatMessage({ id: 'upstream.step.input.healthy.checks.active.host' }),
            },
            {
              pattern: new RegExp(
                /(^([1-9]?\d|1\d{2}|2[0-4]\d|25[0-5])(\.(25[0-5]|1\d{2}|2[0-4]\d|[1-9]?\d)){3}$|^(?![0-9.]+$)([a-zA-Z0-9_-]+)(\.[a-zA-Z0-9_-]+){0,}$)/,
                'g',
              ),
              message: formatMessage({ id: 'upstream.step.domain.name.or.ip.rule' }),
            },
          ]}
        >
          <Input
            placeholder={formatMessage({ id: 'upstream.step.input.healthy.checks.active.host' })}
            disabled={disabled}
          />
        </Form.Item>
      </Form.Item>
      <Form.Item label={formatMessage({ id: 'upstream.step.healthy.checks.healthy' })} />
      <Form.Item
        label={formatMessage({ id: 'upstream.step.healthy.checks.active.interval' })}
        required
      >
        <Form.Item
          style={{ marginBottom: 0 }}
          name={['checks', 'active', 'healthy', 'interval']}
          rules={[
            {
              required: true,
              message: formatMessage({ id: 'upstream.step.input.healthy.checks.active.interval' }),
            },
          ]}
        >
          <InputNumber disabled={disabled} min={1} />
        </Form.Item>
      </Form.Item>
      <Form.Item label={formatMessage({ id: 'upstream.step.healthy.checks.successes' })} required>
        <Form.Item
          name={['checks', 'active', 'healthy', 'successes']}
          noStyle
          rules={[
            {
              required: true,
              message: formatMessage({ id: 'upstream.step.input.healthy.checks.successes' }),
            },
          ]}
        >
          <InputNumber disabled={disabled} min={1} max={254} />
        </Form.Item>
      </Form.Item>
      <Form.Item label={formatMessage({ id: 'upstream.step.healthy.checks.unhealthy' })} />
      <Form.Item
        label={formatMessage({ id: 'upstream.step.healthy.checks.active.interval' })}
        required
      >
        <Form.Item
          name={['checks', 'active', 'unhealthy', 'interval']}
          noStyle
          rules={[
            {
              required: true,
              message: formatMessage({ id: 'upstream.step.input.healthy.checks.active.interval' }),
            },
          ]}
        >
          <InputNumber disabled={disabled} min={1} />
        </Form.Item>
      </Form.Item>
      <Form.Item
        label={formatMessage({ id: 'upstream.step.healthy.checks.http_failures' })}
        required
      >
        <Form.Item
          name={['checks', 'active', 'unhealthy', 'http_failures']}
          noStyle
          rules={[
            {
              required: true,
              message: formatMessage({ id: 'upstream.step.input.healthy.checks.http_failures' }),
            },
          ]}
        >
          <InputNumber disabled={disabled} min={1} max={254} />
        </Form.Item>
      </Form.Item>
      <Form.List name={['checks', 'active', 'req_headers']}>
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <Form.Item
                key={field.key}
                {...(index === 0 ? FORM_ITEM_LAYOUT : FORM_ITEM_WITHOUT_LABEL)}
                label={
                  index === 0
                    ? formatMessage({ id: 'upstream.step.healthy.checks.active.req_headers' })
                    : ''
                }
              >
                <Row style={{ marginBottom: '10px' }} gutter={16}>
                  <Col span={10}>
                    <Form.Item style={{ marginBottom: 0 }} name={[field.name]}>
                      <Input
                        placeholder={formatMessage({
                          id: 'upstream.step.input.healthy.checks.active.req_headers',
                        })}
                        disabled={disabled}
                      />
                    </Form.Item>
                  </Col>
                  <Col
                    style={{
                      marginLeft: -10,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {!disabled &&
                      (fields.length > 1 ? (
                        <MinusCircleOutlined
                          style={{ margin: '0 8px' }}
                          onClick={() => {
                            remove(field.name);
                          }}
                        />
                      ) : null)}
                  </Col>
                </Row>
              </Form.Item>
            ))}
            {!disabled && (
              <Form.Item {...FORM_ITEM_WITHOUT_LABEL}>
                <Button
                  type="dashed"
                  onClick={() => {
                    add();
                  }}
                >
                  <PlusOutlined />
                  {formatMessage({ id: 'upstream.step.create' })}
                </Button>
              </Form.Item>
            )}
          </>
        )}
      </Form.List>
    </>
  );
  return (
    <Form {...FORM_ITEM_LAYOUT} form={form} initialValues={initialValues}>
      <Form.Item
        label={formatMessage({ id: 'upstream.step.name' })}
        name="name"
        rules={[{ required: true }]}
        extra={formatMessage({ id: 'upstream.step.name.should.unique' })}
      >
        <Input
          placeholder={formatMessage({ id: 'upstream.step.input.upstream.name' })}
          disabled={disabled}
        />
      </Form.Item>
      <Form.Item label={formatMessage({ id: 'upstream.step.description' })} name="description">
        <Input.TextArea
          placeholder={formatMessage({ id: 'upstream.step.input.description' })}
          disabled={disabled}
        />
      </Form.Item>
      <Form.Item
        label={formatMessage({ id: 'upstream.step.type' })}
        name="type"
        rules={[{ required: true }]}
      >
        <Select disabled={disabled}>
          <Select.Option value="roundrobin">roundrobin</Select.Option>
          <Select.Option value="chash">chash</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item shouldUpdate>
        {() => {
          if (form.getFieldValue('type') === 'chash') {
            return (
              <>
                <Form.Item label="Hash On" name="hash_on" labelCol={{ span: 6 }}>
                  <Select disabled={disabled}>
                    {HASH_ON_LIST.map((item) => (
                      <Select.Option value={item} key={item}>
                        {item}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="Key" name="key" labelCol={{ span: 6 }}>
                  <Select disabled={disabled}>
                    {HASH_KEY_LIST.map((item) => (
                      <Select.Option value={item} key={item}>
                        {item}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </>
            );
          }
          return null;
        }}
      </Form.Item>
      {renderUpstreamMeta()}
      <Form.Item label={formatMessage({ id: 'upstream.step.connect.timeout' })} required>
        <Form.Item
          name={['timeout', 'connect']}
          noStyle
          rules={[
            {
              required: true,
              message: formatMessage({ id: 'upstream.step.input.connect.timeout' }),
            },
          ]}
        >
          <InputNumber disabled={disabled} />
        </Form.Item>
        {renderTimeUnit()}
      </Form.Item>
      <Form.Item label={formatMessage({ id: 'upstream.step.send.timeout' })} required>
        <Form.Item
          name={['timeout', 'send']}
          noStyle
          rules={[
            { required: true, message: formatMessage({ id: 'upstream.step.input.send.timeout' }) },
          ]}
        >
          <InputNumber disabled={disabled} />
        </Form.Item>
        {renderTimeUnit()}
      </Form.Item>
      <Form.Item label={formatMessage({ id: 'upstream.step.receive.timeout' })} required>
        <Form.Item
          name={['timeout', 'read']}
          noStyle
          rules={[
            {
              required: true,
              message: formatMessage({ id: 'upstream.step.input.receive.timeout' }),
            },
          ]}
        >
          <InputNumber disabled={disabled} />
        </Form.Item>
        {renderTimeUnit()}
      </Form.Item>
      <PanelSection title={formatMessage({ id: 'upstream.step.healthy.check' })}>
        <Form.Item
          label={formatMessage({ id: 'upstream.step.healthy.checks.active' })}
          name="active"
          valuePropName="checked"
        >
          <Switch disabled={disabled} onChange={handleActiveChange} />
        </Form.Item>
        {isActive && renderActiveHealthyCheck()}
        <Form.Item
          label={formatMessage({ id: 'upstream.step.healthy.checks.passive' })}
          name="passive"
          valuePropName="checked"
        >
          <Switch disabled={disabled} onChange={handlePassiveChange} />
        </Form.Item>
        {isPassive && renderPassiveHealthyCheck()}
      </PanelSection>
    </Form>
  );
};

export default Step1;
