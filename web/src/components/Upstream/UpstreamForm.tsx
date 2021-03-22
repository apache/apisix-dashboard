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
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Divider, Form, Input, InputNumber, Row, Select, Switch } from 'antd';
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useIntl } from 'umi';
import type { FormInstance } from 'antd/es/form';

import { PanelSection } from '@api7-dashboard/ui';
import { transformRequest } from '@/pages/Upstream/transform';
import { DEFAULT_UPSTREAM } from './constant';

enum Type {
  roundrobin = 'roundrobin',
  chash = 'chash',
  ewma = 'ewma',
}

enum HashOn {
  vars = 'vars',
  header = 'header',
  cookie = 'cookie',
  consumer = 'consumer',
}

enum HashKey {
  remote_addr = 'remote_addr',
  host = 'host',
  uri = 'uri',
  server_name = 'server_name',
  server_addr = 'server_addr',
  request_uri = 'request_uri',
  query_string = 'query_string',
  remote_port = 'remote_port',
  hostname = 'hostname',
  arg_id = 'arg_id',
}

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
  required: boolean;
};

const removeBtnStyle = {
  marginLeft: -10,
  display: 'flex',
  alignItems: 'center',
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
      },
      {
        label: formatMessage({ id: 'page.upstream.step.send.timeout' }),
        name: ['timeout', 'send'],
      },
      {
        label: formatMessage({ id: 'page.upstream.step.read.timeout' }),
        name: ['timeout', 'read'],
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

    const CHash = () => (
      <>
        <Form.Item label="Hash On" name="hash_on" rules={[{ required: true }]}>
          <Select disabled={readonly}>
            {Object.entries(HashOn).map(([label, value]) => (
              <Select.Option value={value} key={value}>
                {label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Key" name="key" rules={[{ required: true }]}>
          <Select disabled={readonly}>
            {Object.entries(HashKey).map(([label, value]) => (
              <Select.Option value={value} key={value}>
                {label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </>
    );

    const TimeUnit = () => <span style={{ margin: '0 8px' }}>s</span>;
    const NodeList = () => (
      <Form.List name="nodes">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <Form.Item
                required
                key={field.key}
                label={
                  index === 0 &&
                  formatMessage({ id: 'page.upstream.form.item-label.node.domain.or.ip' })
                }
                extra={
                  index === 0 &&
                  formatMessage({ id: 'page.upstream.form.item.extra-message.node.domain.or.ip' })
                }
                labelCol={{ span: index === 0 ? 3 : 0 }}
                wrapperCol={{ offset: index === 0 ? 0 : 3 }}
              >
                <Row style={{ marginBottom: 10 }} gutter={16}>
                  <Col span={5}>
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      name={[field.name, 'host']}
                      rules={[
                        {
                          required: true,
                          message: formatMessage({
                            id: 'page.upstream.step.input.domain.name.or.ip',
                          }),
                        },
                        {
                          pattern: new RegExp(
                            /(^([1-9]?\d|1\d{2}|2[0-4]\d|25[0-5])(\.(25[0-5]|1\d{2}|2[0-4]\d|[1-9]?\d)){3}$|^(?![0-9.]+$)([a-zA-Z0-9_-]+)(\.[a-zA-Z0-9_-]+){0,}$)/,
                            'g',
                          ),
                        },
                      ]}
                    >
                      <Input
                        placeholder={formatMessage({ id: 'page.upstream.step.domain.name.or.ip' })}
                        disabled={readonly}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={2}>
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      name={[field.name, 'port']}
                      rules={[
                        {
                          required: true,
                          message: formatMessage({ id: 'page.upstream.step.input.port' }),
                        },
                      ]}
                    >
                      <InputNumber
                        placeholder={formatMessage({ id: 'page.upstream.step.port' })}
                        disabled={readonly}
                        min={1}
                        max={65535}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={2}>
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      name={[field.name, 'weight']}
                      rules={[
                        {
                          required: true,
                          message: formatMessage({ id: 'page.upstream.step.input.weight' }),
                        },
                      ]}
                    >
                      <InputNumber
                        placeholder={formatMessage({ id: 'page.upstream.step.weight' })}
                        disabled={readonly}
                        min={0}
                        max={1000}
                      />
                    </Form.Item>
                  </Col>
                  <Col style={removeBtnStyle}>
                    {!readonly && fields.length > 1 && (
                      <MinusCircleOutlined onClick={() => remove(field.name)} />
                    )}
                  </Col>
                </Row>
              </Form.Item>
            ))}
            {!readonly && (
              <Form.Item wrapperCol={{ offset: 3 }}>
                <Button type="dashed" onClick={add}>
                  <PlusOutlined />
                  {formatMessage({ id: 'page.upstream.step.create.node' })}
                </Button>
              </Form.Item>
            )}
          </>
        )}
      </Form.List>
    );

    const ActiveHealthCheck = () => (
      <>
        <Form.Item label={formatMessage({ id: 'page.upstream.step.healthyCheck.active.timeout' })}>
          <Form.Item name={['checks', 'active', 'timeout']} noStyle>
            <InputNumber disabled={readonly} />
          </Form.Item>
          <span style={{ margin: '0 8px' }}>s</span>
        </Form.Item>
        <Form.Item
          label={formatMessage({ id: 'page.upstream.step.healthyCheck.activeHost' })}
          required
        >
          <Form.Item
            style={{ marginBottom: 0 }}
            name={['checks', 'active', 'host']}
            rules={[
              {
                required: true,
                message: formatMessage({ id: 'page.upstream.step.input.healthyCheck.activeHost' }),
              },
              {
                pattern: new RegExp(
                  /(^([1-9]?\d|1\d{2}|2[0-4]\d|25[0-5])(\.(25[0-5]|1\d{2}|2[0-4]\d|[1-9]?\d)){3}$|^(?![0-9.]+$)([a-zA-Z0-9_-]+)(\.[a-zA-Z0-9_-]+){0,}$)/,
                  'g',
                ),
                message: formatMessage({ id: 'page.upstream.step.domain.name.or.ip.rule' }),
              },
            ]}
          >
            <Input
              placeholder={formatMessage({
                id: 'page.upstream.step.input.healthyCheck.activeHost',
              })}
              disabled={readonly}
            />
          </Form.Item>
        </Form.Item>

        <Form.Item label={formatMessage({ id: 'page.upstream.step.healthyCheck.activePort' })}>
          <Form.Item name={['checks', 'active', 'port']} noStyle>
            <InputNumber
              placeholder={formatMessage({
                id: 'page.upstream.step.input.healthyCheck.activePort',
              })}
              disabled={readonly}
            />
          </Form.Item>
        </Form.Item>

        <Form.Item
          label={formatMessage({ id: 'page.upstream.step.healthyCheck.active.http_path' })}
          required
        >
          <Form.Item
            name={['checks', 'active', 'http_path']}
            noStyle
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'page.upstream.step.input.healthyCheck.active.http_path',
                }),
              },
            ]}
          >
            <Input
              disabled={readonly}
              placeholder={formatMessage({
                id: 'page.upstream.step.input.healthyCheck.active.http_path',
              })}
            />
          </Form.Item>
        </Form.Item>

        <Divider orientation="left" plain>
          {formatMessage({ id: 'page.upstream.step.healthyCheck.healthy.status' })}
        </Divider>
        <Form.Item
          label={formatMessage({ id: 'page.upstream.step.healthyCheck.activeInterval' })}
          required
        >
          <Form.Item
            style={{ marginBottom: 0 }}
            name={['checks', 'active', 'healthy', 'interval']}
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'page.upstream.step.input.healthyCheck.activeInterval',
                }),
              },
            ]}
          >
            <InputNumber disabled={readonly} min={1} />
          </Form.Item>
        </Form.Item>
        <Form.Item
          label={formatMessage({ id: 'page.upstream.step.healthyCheck.successes' })}
          required
        >
          <Form.Item
            name={['checks', 'active', 'healthy', 'successes']}
            noStyle
            rules={[
              {
                required: true,
                message: formatMessage({ id: 'page.upstream.step.input.healthyCheck.successes' }),
              },
            ]}
          >
            <InputNumber disabled={readonly} min={1} max={254} />
          </Form.Item>
        </Form.Item>

        <Divider orientation="left" plain>
          {formatMessage({ id: 'page.upstream.step.healthyCheck.unhealthyStatus' })}
        </Divider>
        <Form.Item
          label={formatMessage({ id: 'page.upstream.step.healthyCheck.activeInterval' })}
          required
        >
          <Form.Item
            name={['checks', 'active', 'unhealthy', 'interval']}
            noStyle
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'page.upstream.step.input.healthyCheck.activeInterval',
                }),
              },
            ]}
          >
            <InputNumber disabled={readonly} min={1} />
          </Form.Item>
        </Form.Item>
        <Form.Item
          label={formatMessage({ id: 'page.upstream.step.healthyCheck.http_failures' })}
          required
        >
          <Form.Item
            name={['checks', 'active', 'unhealthy', 'http_failures']}
            noStyle
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'page.upstream.step.input.healthyCheck.http_failures',
                }),
              },
            ]}
          >
            <InputNumber disabled={readonly} min={1} max={254} />
          </Form.Item>
        </Form.Item>
        <Form.List name={['checks', 'active', 'req_headers']}>
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <Form.Item
                  key={field.key}
                  label={
                    index === 0 &&
                    formatMessage({ id: 'page.upstream.step.healthyCheck.active.req_headers' })
                  }
                  wrapperCol={{ offset: index === 0 ? 0 : 3 }}
                >
                  <Row style={{ marginBottom: 10 }} gutter={16}>
                    <Col span={10}>
                      <Form.Item style={{ marginBottom: 0 }} name={[field.name]}>
                        <Input
                          placeholder={formatMessage({
                            id: 'page.upstream.step.input.healthyCheck.active.req_headers',
                          })}
                          disabled={readonly}
                        />
                      </Form.Item>
                    </Col>
                    <Col style={removeBtnStyle}>
                      {!readonly && fields.length > 1 && (
                        <MinusCircleOutlined
                          style={{ margin: '0 8px' }}
                          onClick={() => {
                            remove(field.name);
                          }}
                        />
                      )}
                    </Col>
                  </Row>
                </Form.Item>
              ))}
              {!readonly && (
                <Form.Item wrapperCol={{ offset: 3 }}>
                  <Button type="dashed" onClick={() => add()}>
                    <PlusOutlined />
                    {formatMessage({
                      id: 'page.upstream.step.healthyCheck.active.create.req_headers',
                    })}
                  </Button>
                </Form.Item>
              )}
            </>
          )}
        </Form.List>
      </>
    );
    const InActiveHealthCheck = () => (
      <>
        <Divider orientation="left" plain>
          {formatMessage({ id: 'page.upstream.step.healthyCheck.healthy.status' })}
        </Divider>
        <Form.List name={['checks', 'passive', 'healthy', 'http_statuses']}>
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <Form.Item
                  required
                  key={field.key}
                  label={
                    index === 0 &&
                    formatMessage({ id: 'page.upstream.step.healthyCheck.passive.http_statuses' })
                  }
                  labelCol={{ span: index === 0 ? 3 : 0 }}
                  wrapperCol={{ offset: index === 0 ? 0 : 3 }}
                >
                  <Row style={{ marginBottom: 10 }}>
                    <Col span={2}>
                      <Form.Item style={{ marginBottom: 0 }} name={[field.name]}>
                        <InputNumber disabled={readonly} />
                      </Form.Item>
                    </Col>
                    <Col style={removeBtnStyle}>
                      {!readonly && fields.length > 1 && (
                        <MinusCircleOutlined
                          onClick={() => {
                            remove(field.name);
                          }}
                        />
                      )}
                    </Col>
                  </Row>
                </Form.Item>
              ))}
              {!readonly && (
                <Form.Item wrapperCol={{ offset: 3 }}>
                  <Button type="dashed" onClick={() => add()}>
                    <PlusOutlined />
                    {formatMessage({
                      id: 'page.upstream.step.healthyCheck.passive.create.http_statuses',
                    })}
                  </Button>
                </Form.Item>
              )}
            </>
          )}
        </Form.List>
        <Form.Item
          label={formatMessage({ id: 'page.upstream.step.healthyCheck.successes' })}
          required
        >
          <Form.Item
            name={['checks', 'passive', 'healthy', 'successes']}
            noStyle
            rules={[
              {
                required: true,
                message: formatMessage({ id: 'page.upstream.step.input.healthyCheck.successes' }),
              },
            ]}
          >
            <InputNumber disabled={readonly} min={1} max={254} />
          </Form.Item>
        </Form.Item>

        <Divider orientation="left" plain>
          {formatMessage({ id: 'page.upstream.step.healthyCheck.unhealthyStatus' })}
        </Divider>
        <Form.List name={['checks', 'passive', 'unhealthy', 'http_statuses']}>
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <Form.Item
                  required
                  key={field.key}
                  label={
                    index === 0 &&
                    formatMessage({ id: 'page.upstream.step.healthyCheck.passive.http_statuses' })
                  }
                  labelCol={{ span: index === 0 ? 3 : 0 }}
                  wrapperCol={{ offset: index === 0 ? 0 : 3 }}
                >
                  <Row style={{ marginBottom: 10 }}>
                    <Col span={2}>
                      <Form.Item style={{ marginBottom: 0 }} name={[field.name]}>
                        <InputNumber disabled={readonly} max={599} />
                      </Form.Item>
                    </Col>
                    <Col style={removeBtnStyle}>
                      {!readonly && fields.length > 1 && (
                        <MinusCircleOutlined
                          onClick={() => {
                            remove(field.name);
                          }}
                        />
                      )}
                    </Col>
                  </Row>
                </Form.Item>
              ))}
              {!readonly && (
                <Form.Item wrapperCol={{ offset: 3 }}>
                  <Button type="dashed" onClick={() => add()}>
                    <PlusOutlined />
                    {formatMessage({
                      id: 'page.upstream.step.healthyCheck.passive.create.http_statuses',
                    })}
                  </Button>
                </Form.Item>
              )}
            </>
          )}
        </Form.List>
        <Form.Item
          label={formatMessage({ id: 'page.upstream.step.healthyCheck.http_failures' })}
          required
        >
          <Form.Item
            name={['checks', 'passive', 'unhealthy', 'http_failures']}
            noStyle
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'page.upstream.step.input.healthyCheck.http_failures',
                }),
              },
            ]}
          >
            <InputNumber disabled={readonly} min={1} max={254} />
          </Form.Item>
        </Form.Item>
        <Form.Item
          label={formatMessage({ id: 'page.upstream.step.healthyCheck.passive.tcp_failures' })}
          required
        >
          <Form.Item
            name={['checks', 'passive', 'unhealthy', 'tcp_failures']}
            noStyle
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'page.upstream.step.input.healthyCheck.passive.tcp_failures',
                }),
              },
            ]}
          >
            <InputNumber disabled={readonly} min={1} max={254} />
          </Form.Item>
        </Form.Item>
      </>
    );

    return (
      <Form
        form={form}
        labelCol={{ span: 3 }}
        initialValues={{
          pass_host: 'pass',
        }}
      >
        {showSelector && (
          <Form.Item
            label={formatMessage({ id: 'page.upstream.step.select.upstream' })}
            name="upstream_id"
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
          >
            <Select
              showSearch
              data-cy="upstream_selector"
              disabled={disabled}
              onChange={(upstream_id) => {
                setReadonly(Boolean(upstream_id));
                setHiddenForm(Boolean(upstream_id === 'None'));
                form.setFieldsValue(list.find((item) => item.id === upstream_id));
                if (upstream_id === '') {
                  form.resetFields();
                  form.setFieldsValue(DEFAULT_UPSTREAM);
                }
              }}
              filterOption={(input, item) =>
                item?.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {Boolean(!required) && <Select.Option value={'None'}>None</Select.Option>}
              {[
                {
                  name: formatMessage({ id: 'page.upstream.step.select.upstream.select.option' }),
                  id: '',
                },
                ...list,
              ].map((item) => (
                <Select.Option value={item.id!} key={item.id}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {!hiddenForm && (
          <>
            <Form.Item
              label={formatMessage({ id: 'page.upstream.step.type' })}
              name="type"
              rules={[{ required: true }]}
            >
              <Select disabled={readonly}>
                {Object.entries(Type).map(([label, value]) => {
                  return (
                    <Select.Option value={value} key={value}>
                      {label}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item shouldUpdate noStyle>
              {() => {
                if (form.getFieldValue('type') === 'chash') {
                  return <CHash />;
                }
                return null;
              }}
            </Form.Item>
            {NodeList()}
            <Form.Item
              label={formatMessage({ id: 'page.upstream.step.pass-host' })}
              name="pass_host"
              extra={formatMessage({ id: 'page.upstream.step.pass-host.tips' })}
            >
              <Select disabled={readonly}>
                <Select.Option value="pass">
                  {formatMessage({ id: 'page.upstream.step.pass-host.pass' })}
                </Select.Option>
                <Select.Option value="node">
                  {formatMessage({ id: 'page.upstream.step.pass-host.node' })}
                </Select.Option>
                <Select.Option value="rewrite">
                  {formatMessage({ id: 'page.upstream.step.pass-host.rewrite' })}
                </Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              noStyle
              shouldUpdate={(prev, next) => {
                return prev.pass_host !== next.pass_host;
              }}
            >
              {() => {
                if (form.getFieldValue('pass_host') === 'rewrite') {
                  return (
                    <Form.Item
                      label={formatMessage({ id: 'page.upstream.step.pass-host.upstream_host' })}
                      name="upstream_host"
                    >
                      <Input disabled={readonly} />
                    </Form.Item>
                  );
                }
                return null;
              }}
            </Form.Item>

            {timeoutFields.map(({ label, name }) => (
              <Form.Item label={label} required key={label}>
                <Form.Item
                  name={name}
                  noStyle
                  rules={[
                    {
                      required: true,
                      message: formatMessage({ id: `page.upstream.step.input.${name[1]}.timeout` }),
                    },
                  ]}
                >
                  <InputNumber disabled={readonly} />
                </Form.Item>
                <TimeUnit />
              </Form.Item>
            ))}

            <PanelSection
              title={formatMessage({ id: 'page.upstream.step.healthyCheck.healthy.check' })}
            >
              {[
                {
                  label: formatMessage({ id: 'page.upstream.step.healthyCheck.active' }),
                  name: ['checks', 'active'],
                  component: <ActiveHealthCheck />,
                },
                {
                  label: formatMessage({ id: 'page.upstream.step.healthyCheck.passive' }),
                  name: ['checks', 'passive'],
                  component: <InActiveHealthCheck />,
                },
              ].map(({ label, name, component }) => (
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
          </>
        )}
      </Form>
    );
  },
);

export default UpstreamForm;
