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

import { PanelSection } from '@api7-dashboard/ui';
import { transformRequest } from '@/pages/Upstream/transform';
import type { FormInstance } from 'antd/es/form';

enum Type {
  roundrobin = 'roundrobin',
  chash = 'chash',
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
};

const timeoutFields = [
  {
    label: '连接超时',
    name: ['timeout', 'connect'],
  },
  {
    label: '发送超时',
    name: ['timeout', 'send'],
  },
  {
    label: '接收超时',
    name: ['timeout', 'read'],
  },
];

const removeBtnStyle = {
  marginLeft: -10,
  display: 'flex',
  alignItems: 'center',
};

const UpstreamForm: React.FC<Props> = forwardRef(
  ({ form, disabled, list = [], showSelector }, ref) => {
    const { formatMessage } = useIntl();
    const [readonly, setReadonly] = useState(
      Boolean(form.getFieldValue('upstream_id')) || disabled,
    );

    useImperativeHandle(ref, () => ({
      getData: () => transformRequest(form.getFieldsValue()),
    }));

    useEffect(() => {
      const id = form.getFieldValue('upstream_id');
      if (id) {
        form.setFieldsValue(list.find((item) => item.id === id));
      }
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

    const TimeUnit = () => <span style={{ margin: '0 8px' }}>ms</span>;
    const NodeList = () => (
      <Form.List name="nodes">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <Form.Item
                required
                key={field.key}
                label={index === 0 && '节点域名/IP'}
                extra={
                  index === 0 && '使用域名时，默认解析本地 /etc/resolv.conf；权重为0则熔断该节点'
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
                          message: formatMessage({ id: 'upstream.step.input.domain.name.or.ip' }),
                        },
                        {
                          pattern: new RegExp(
                            /(^([1-9]?\d|1\d{2}|2[0-4]\d|25[0-5])(\.(25[0-5]|1\d{2}|2[0-4]\d|[1-9]?\d)){3}$|^(?![0-9.]+$)([a-zA-Z0-9_-]+)(\.[a-zA-Z0-9_-]+){0,}$)/,
                            'g',
                          ),
                        },
                      ]}
                    >
                      <Input placeholder="域名/IP" disabled={readonly} />
                    </Form.Item>
                  </Col>
                  <Col span={2}>
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
                      <InputNumber placeholder="端口号" disabled={readonly} min={1} max={65535} />
                    </Form.Item>
                  </Col>
                  <Col span={2}>
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
                      <InputNumber placeholder="权重" disabled={readonly} min={0} max={1000} />
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
                  创建节点
                </Button>
              </Form.Item>
            )}
          </>
        )}
      </Form.List>
    );

    const ActiveHealthCheck = () => (
      <>
        <Form.Item label="超时时间">
          <Form.Item name={['checks', 'active', 'timeout']} noStyle>
            <InputNumber disabled={readonly} />
          </Form.Item>
          <span style={{ margin: '0 8px' }}>s</span>
        </Form.Item>
        <Form.Item
          label={formatMessage({ id: 'upstream.step.healthy.checks.active.host' })}
          required
        >
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
              disabled={readonly}
            />
          </Form.Item>
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
                message: formatMessage({
                  id: 'upstream.step.input.healthy.checks.active.http_path',
                }),
              },
            ]}
          >
            <Input
              disabled={readonly}
              placeholder={formatMessage({
                id: 'upstream.step.input.healthy.checks.active.http_path',
              })}
            />
          </Form.Item>
        </Form.Item>

        <Divider orientation="left" plain>
          健康状态
        </Divider>
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
                message: formatMessage({
                  id: 'upstream.step.input.healthy.checks.active.interval',
                }),
              },
            ]}
          >
            <InputNumber disabled={readonly} min={1} />
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
            <InputNumber disabled={readonly} min={1} max={254} />
          </Form.Item>
        </Form.Item>

        <Divider orientation="left" plain>
          不健康状态
        </Divider>
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
                message: formatMessage({
                  id: 'upstream.step.input.healthy.checks.active.interval',
                }),
              },
            ]}
          >
            <InputNumber disabled={readonly} min={1} />
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
                    formatMessage({ id: 'upstream.step.healthy.checks.active.req_headers' })
                  }
                  wrapperCol={{ offset: index === 0 ? 0 : 3 }}
                >
                  <Row style={{ marginBottom: 10 }} gutter={16}>
                    <Col span={10}>
                      <Form.Item style={{ marginBottom: 0 }} name={[field.name]}>
                        <Input
                          placeholder={formatMessage({
                            id: 'upstream.step.input.healthy.checks.active.req_headers',
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
                    创建请求头
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
          健康状态
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
                    formatMessage({ id: 'upstream.step.healthy.checks.passive.http_statuses' })
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
                    创建状态码
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
                message: formatMessage({ id: 'upstream.step.input.healthy.checks.successes' }),
              },
            ]}
          >
            <InputNumber disabled={readonly} min={1} max={254} />
          </Form.Item>
        </Form.Item>

        <Divider orientation="left" plain>
          不健康状态
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
                    formatMessage({ id: 'upstream.step.healthy.checks.passive.http_statuses' })
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
                    创建状态码
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
            <InputNumber disabled={readonly} min={1} max={254} />
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
            <InputNumber disabled={readonly} min={1} max={254} />
          </Form.Item>
        </Form.Item>
      </>
    );

    return (
      <Form form={form} labelCol={{ span: 3 }}>
        {showSelector && (
          <Form.Item label="选择上游" name="upstream_id">
            <Select
              disabled={disabled}
              onChange={(id) => {
                setReadonly(Boolean(id));
                if (id) {
                  form.setFieldsValue(list.find((item) => item.id === id));
                  form.setFieldsValue({
                    upstream_id: id,
                  });
                }
              }}
            >
              {[{ name: '手动填写', id: '' }, ...list].map((item) => (
                <Select.Option value={item.id!} key={item.id}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item label="类型" name="type" rules={[{ required: true }]}>
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

        <NodeList />

        {timeoutFields.map(({ label, name }) => (
          <Form.Item label={label} required key={label}>
            <Form.Item
              name={name}
              noStyle
              rules={[
                {
                  required: true,
                  message: formatMessage({ id: `upstream.step.input.${name[1]}.timeout` }),
                },
              ]}
            >
              <InputNumber disabled={readonly} />
            </Form.Item>
            <TimeUnit />
          </Form.Item>
        ))}

        <PanelSection title="健康检查">
          {[
            {
              label: '探活健康检查',
              name: ['checks', 'active'],
              component: <ActiveHealthCheck />,
            },
            {
              label: '被动健康检查',
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
      </Form>
    );
  },
);

export default UpstreamForm;
