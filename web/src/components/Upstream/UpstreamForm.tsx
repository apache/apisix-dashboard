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
  // TODO: new type
  // least_conn = 'least_conn'
}

enum HashOn {
  vars = 'vars',
  header = 'header',
  cookie = 'cookie',
  consumer = 'consumer',
  // TODO: new hash_on key
  // vars_combinations = 'vars_combinations'
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
  required?: boolean;
};

const removeBtnStyle = {
  marginLeft: 20,
  display: 'flex',
  alignItems: 'center',
};

const TimeUnit = () => <span style={{ margin: '0 8px' }}>s</span>;

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

    const NodeList = () => (
      <Form.List name="nodes">
        {(fields, { add, remove }) => (
          <>
            <Form.Item label={formatMessage({ id: 'page.upstream.form.item-label.node.domain.or.ip' })} style={{ marginBottom: 0 }}>
              {fields.map((field, index) => (
                <Row style={{ marginBottom: 10 }} gutter={16} key={index}>
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
                  <Col span={4}>
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      name={[field.name, 'port']}
                      label={formatMessage({ id: 'page.upstream.step.port' })}
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
                  <Col span={5}>
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      name={[field.name, 'weight']}
                      label={formatMessage({ id: 'page.upstream.step.weight' })}
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
                  <Col style={{ ...removeBtnStyle, marginLeft: -50 }}>
                    {!readonly && (
                      <MinusCircleOutlined onClick={() => remove(field.name)} />
                    )}
                  </Col>
                </Row>
              ))}
            </Form.Item>
            {!readonly && (
              <Form.Item wrapperCol={{ offset: 3 }}>
                <Button type="dashed" onClick={add}>
                  <PlusOutlined />
                  {formatMessage({ id: 'component.global.add' })}
                </Button>
              </Form.Item>
            )}
          </>
        )}
      </Form.List>
    );

    const ActiveCheckTimeoutComponent: React.FC = () => (
      <Form.Item label={formatMessage({ id: 'page.upstream.step.healthyCheck.active.timeout' })} tooltip={formatMessage({ id: 'page.upstream.checks.active.timeout.description' })}>
        <Form.Item name={['checks', 'active', 'timeout']} noStyle>
          <InputNumber disabled={readonly} min={0} />
        </Form.Item>
        <TimeUnit />
      </Form.Item>
    )

    const ActiveCheckHostComponent: React.FC = () => (
      <Form.Item
        label={formatMessage({ id: 'page.upstream.step.healthyCheck.activeHost' })}
        required
        tooltip={formatMessage({ id: 'page.upstream.checks.active.host.description' })}
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
    )

    const ActiveCheckPortComponent: React.FC = () => (
      <Form.Item label={formatMessage({ id: 'page.upstream.step.healthyCheck.activePort' })}>
        <Form.Item name={['checks', 'active', 'port']} noStyle>
          <InputNumber
            placeholder={formatMessage({
              id: 'page.upstream.step.input.healthyCheck.activePort',
            })}
            disabled={readonly}
            min={1}
            max={65535}
          />
        </Form.Item>
      </Form.Item>
    )

    const ActiveHttpPathComponent: React.FC = () => (
      <Form.Item
        label={formatMessage({ id: 'page.upstream.step.healthyCheck.active.http_path' })}
        required
        tooltip={formatMessage({
          id: 'page.upstream.step.input.healthyCheck.active.http_path',
        })}
      >
        <Form.Item
          name={['checks', 'active', 'http_path']}
          noStyle
          rules={[
            {
              required: true,
              message: formatMessage({ id: 'page.upstream.checks.active.http_path.placeholder' }),
            },
          ]}
        >
          <Input
            disabled={readonly}
            placeholder={formatMessage({ id: 'page.upstream.checks.active.http_path.placeholder' })}
          />
        </Form.Item>
      </Form.Item>
    )

    const ActiveCheckHealthyIntervalComponent: React.FC = () => (
      <Form.Item
        label={formatMessage({ id: 'page.upstream.step.healthyCheck.activeInterval' })}
        required
        tooltip={formatMessage({ id: 'page.upstream.checks.active.healthy.interval.description' })}
      >
        <Form.Item
          noStyle
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
        <TimeUnit />
      </Form.Item>
    )

    const ActiveCheckHealthySuccessesComponent: React.FC = () => (
      <Form.Item
        label={formatMessage({ id: 'page.upstream.step.healthyCheck.successes' })}
        required
        tooltip={formatMessage({ id: 'page.upstream.checks.active.healthy.successes.description' })}
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
    )

    const ActiveCheckUnhealthyIntervalComponent: React.FC = () => (
      <Form.Item
        label={formatMessage({ id: 'page.upstream.step.healthyCheck.activeInterval' })}
        required
        tooltip={formatMessage({ id: 'page.upstream.checks.active.unhealthy.interval.description' })}
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
        <TimeUnit />
      </Form.Item>
    )

    const ActiveCheckUnhealthyHttpFailuresComponent: React.FC = () => (
      <Form.Item
        label={formatMessage({ id: 'page.upstream.step.healthyCheck.http_failures' })}
        required
        tooltip={formatMessage({ id: 'page.upstream.checks.active.unhealthy.http_failures.description' })}
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
    )

    const ActiveCheckUnhealthyTimeoutComponents: React.FC = () => (
      <Form.Item
        label="Timeouts"
        required
      >
        <Form.Item
          name={['checks', 'active', 'unhealthy', 'timeouts']}
          noStyle
        >
          <InputNumber disabled={readonly} min={1} max={254} />
        </Form.Item>
      </Form.Item>
    )

    const ActiveCheckReqHeadersComponent: React.FC = () => (
      <Form.List name={['checks', 'active', 'req_headers']}>
        {(fields, { add, remove }) => (
          <>
            <Form.Item
              label={
                formatMessage({ id: 'page.upstream.step.healthyCheck.active.req_headers' })
              }
              style={{ marginBottom: 0 }}
            >
              {fields.map((field, index) => (
                <Row style={{ marginBottom: 10 }} gutter={12} key={index}>
                  <Col span={5}>
                    <Form.Item noStyle name={[field.name]}>
                      <Input
                        placeholder={formatMessage({
                          id: 'page.upstream.step.input.healthyCheck.active.req_headers',
                        })}
                        disabled={readonly}
                      />
                    </Form.Item>
                  </Col>
                  <Col style={{ ...removeBtnStyle, marginLeft: 0 }}>
                    {!readonly && fields.length > 1 && (
                      <MinusCircleOutlined
                        onClick={() => {
                          remove(field.name);
                        }}
                      />
                    )}
                  </Col>
                </Row>
              ))}
            </Form.Item>
            {!readonly && (
              <Form.Item wrapperCol={{ offset: 3 }}>
                <Button type="dashed" onClick={() => add()}>
                  <PlusOutlined />
                  {formatMessage({
                    id: 'component.global.add',
                  })}
                </Button>
              </Form.Item>
            )}
          </>
        )}
      </Form.List>
    )

    const ActiveCheckUnhealthyHttpStatusesComponent: React.FC = () => (
      <Form.List name={['checks', 'active', 'unhealthy', 'http_statuses']}>
        {(fields, { add, remove }) => (
          <>
            <Form.Item
              required
              label={formatMessage({ id: 'page.upstream.step.healthyCheck.passive.http_statuses' })}
              style={{ marginBottom: 0 }}
            >
              {fields.map((field, index) => (
                <Row style={{ marginBottom: 10 }} key={index}>
                  <Col span={2}>
                    <Form.Item style={{ marginBottom: 0 }} name={[field.name]}>
                      <InputNumber disabled={readonly} min={200} max={599} />
                    </Form.Item>
                  </Col>
                  <Col style={removeBtnStyle}>
                    {!readonly && (
                      <MinusCircleOutlined
                        onClick={() => {
                          remove(field.name);
                        }}
                      />
                    )}
                  </Col>
                </Row>
              ))}
            </Form.Item>
            {!readonly && (
              <Form.Item wrapperCol={{ offset: 3 }}>
                <Button type="dashed" onClick={() => add()}>
                  <PlusOutlined />
                  {formatMessage({
                    id: 'component.global.add',
                  })}
                </Button>
              </Form.Item>
            )}
          </>
        )}
      </Form.List>
    )

    const ActiveHealthCheck = () => (
      <React.Fragment>
        <ActiveCheckTimeoutComponent />
        <ActiveCheckHostComponent />
        <ActiveCheckPortComponent />
        <ActiveHttpPathComponent />

        <Divider orientation="left" plain>
          {formatMessage({ id: 'page.upstream.step.healthyCheck.healthy.status' })}
        </Divider>

        <ActiveCheckHealthyIntervalComponent />
        {/* TODO: HTTP Statuses */}
        <ActiveCheckHealthySuccessesComponent />

        <Divider orientation="left" plain>
          {formatMessage({ id: 'page.upstream.step.healthyCheck.unhealthyStatus' })}
        </Divider>

        <ActiveCheckUnhealthyTimeoutComponents />
        <ActiveCheckUnhealthyIntervalComponent />
        <ActiveCheckUnhealthyHttpStatusesComponent />
        <ActiveCheckUnhealthyHttpFailuresComponent />
        {/* TODO: TCP Failures */}

        <ActiveCheckReqHeadersComponent />
      </React.Fragment>
    );

    const PassiveCheckHealthyHttpStatusesComponent: React.FC = () => (
      <Form.List name={['checks', 'passive', 'healthy', 'http_statuses']}>
        {(fields, { add, remove }) => (
          <>
            <Form.Item
              required
              label={formatMessage({ id: 'page.upstream.step.healthyCheck.passive.http_statuses' })}
              tooltip={formatMessage({ id: 'page.upstream.checks.passive.healthy.http_statuses.description' })}
              style={{ marginBottom: 0 }}
            >
              {fields.map((field, index) => (
                <Row style={{ marginBottom: 10 }} key={index}>
                  <Col span={2}>
                    <Form.Item style={{ marginBottom: 0 }} name={[field.name]}>
                      <InputNumber disabled={readonly} min={200} max={599} />
                    </Form.Item>
                  </Col>
                  <Col style={removeBtnStyle}>
                    {!readonly && (
                      <MinusCircleOutlined
                        onClick={() => {
                          remove(field.name);
                        }}
                      />
                    )}
                  </Col>
                </Row>
              ))}
            </Form.Item>
            {!readonly && (
              <Form.Item wrapperCol={{ offset: 3 }}>
                <Button type="dashed" onClick={() => add()}>
                  <PlusOutlined />
                  {formatMessage({
                    id: 'component.global.add',
                  })}
                </Button>
              </Form.Item>
            )}
          </>
        )}
      </Form.List>
    )

    const PassiveCheckHealthySuccessesComponent: React.FC = () => (
      <Form.Item
        label={formatMessage({ id: 'page.upstream.step.healthyCheck.successes' })}
        tooltip={formatMessage({ id: 'page.upstream.checks.passive.healthy.successes.description' })}
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
    )

    const PassiveCheckUnhealthyHttpStatusesComponent: React.FC = () => (
      <Form.List name={['checks', 'passive', 'unhealthy', 'http_statuses']}>
        {(fields, { add, remove }) => (
          <>
            <Form.Item
              required
              label={formatMessage({ id: 'page.upstream.step.healthyCheck.passive.http_statuses' })}
              tooltip={formatMessage({ id: 'page.upstream.checks.passive.unhealthy.http_statuses.description' })}
              style={{ marginBottom: 0 }}
            >
              {fields.map((field, index) => (
                <Row style={{ marginBottom: 10 }} key={index}>
                  <Col span={2}>
                    <Form.Item style={{ marginBottom: 0 }} name={[field.name]}>
                      <InputNumber disabled={readonly} min={200} max={599} />
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
              ))}
            </Form.Item>
            {!readonly && (
              <Form.Item wrapperCol={{ offset: 3 }}>
                <Button type="dashed" onClick={() => add()}>
                  <PlusOutlined />
                  {formatMessage({
                    id: 'component.global.add',
                  })}
                </Button>
              </Form.Item>
            )}
          </>
        )}
      </Form.List>
    )

    const PassiveCheckUnhealthyHttpFailuresComponent: React.FC = () => (
      <Form.Item
        label={formatMessage({ id: 'page.upstream.step.healthyCheck.http_failures' })}
        required
        tooltip={formatMessage({ id: 'page.upstream.checks.passive.unhealthy.http_failures.description' })}
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
    )

    const PassiveCheckUnhealthyTcpFailturesComponent: React.FC = () => (
      <Form.Item
        label={formatMessage({ id: 'page.upstream.step.healthyCheck.passive.tcp_failures' })}
        required
        tooltip={formatMessage({ id: 'page.upstream.checks.passive.unhealthy.tcp_failures.description' })}
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
    )

    const PassiveCheckUnhealthyTimeoutComponents: React.FC = () => (
      <Form.Item
        label="Timeouts"
        required
      >
        <Form.Item
          name={['checks', 'passive', 'unhealthy', 'timeouts']}
          noStyle
        >
          <InputNumber disabled={readonly} min={1} max={254} />
        </Form.Item>
      </Form.Item>
    )

    const InActiveHealthCheck = () => (
      <React.Fragment>
        <Divider orientation="left" plain>
          {formatMessage({ id: 'page.upstream.step.healthyCheck.healthy.status' })}
        </Divider>

        <PassiveCheckHealthyHttpStatusesComponent />
        <PassiveCheckHealthySuccessesComponent />

        <Divider orientation="left" plain>
          {formatMessage({ id: 'page.upstream.step.healthyCheck.unhealthyStatus' })}
        </Divider>

        <PassiveCheckUnhealthyTimeoutComponents />
        <PassiveCheckUnhealthyTcpFailturesComponent />
        <PassiveCheckUnhealthyHttpFailuresComponent />
        <PassiveCheckUnhealthyHttpStatusesComponent />
      </React.Fragment>
    );


    const SchemeComponent: React.FC = () => {
      const options = [
        {
          label: "HTTP",
          value: "http"
        }, {
          label: "HTTPs",
          value: "https"
        }, {
          label: "gRPC",
          value: "grpc"
        }, {
          label: "gRPCs",
          value: "grpcs"
        }
      ]

      return (
        <Form.Item
          label={formatMessage({ id: 'page.upstream.scheme' })}
          name="scheme"
          rules={[{ required: true }]}
        >
          <Select disabled={readonly}>
            {options.map(item => {
              return (
                <Select.Option value={item.value} key={item.value}>
                  {item.label}
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
      )
    }

    const PassHostComponent: React.FC = () => {
      const options = [
        {
          value: "pass",
          label: formatMessage({ id: 'page.upstream.step.pass-host.pass' })
        }, {
          value: "node",
          label: formatMessage({ id: 'page.upstream.step.pass-host.node' })
        }, {
          value: "rewrite",
          label: formatMessage({ id: 'page.upstream.step.pass-host.rewrite' }),
          disabled: true
        }
      ]

      return (
        <React.Fragment>
          <Form.Item
            label={formatMessage({ id: 'page.upstream.step.pass-host' })}
            name="pass_host"
          >
            <Select disabled={readonly}>
              {options.map(item => (
                <Select.Option value={item.value} key={item.value} disabled={item.disabled}>
                  {item.label}
                </Select.Option>
              ))}
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
                    rules={[
                      {
                        required: true,
                        message: "",
                      },
                    ]}
                  >
                    <Input disabled={readonly} placeholder={formatMessage({ id: `page.upstream.upstream_host.required` })} />
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>
        </React.Fragment>
      )
    }

    const RetryComponent: React.FC = () => {
      return (
        <Form.Item
          label={formatMessage({ id: 'page.upstream.retries' })}
          name="retries"
        >
          <InputNumber
            disabled={disabled}
          />
        </Form.Item>
      )
    }

    const TypeComponent: React.FC = () => {
      return (
        <React.Fragment>
          <Form.Item
            label={formatMessage({ id: 'page.upstream.step.type' })}
            name="type"
            rules={[{ required: true }]}
          >
            <Select disabled={readonly}>
              {Object.entries(Type).map(([label, value]) => {
                return (
                  <Select.Option value={value} key={value}>
                    {formatMessage({ id: `page.upstream.type.${label}` })}
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
        </React.Fragment>
      )
    }

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
                    if (name.includes("active")) {
                      // TODO: 避免默认值被覆盖
                      // form.setFieldsValue()
                    }
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

    const UpstreamSelectorComponent: React.FC = () => (
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
    )

    const TimeoutComponent: React.FC<{
      label: string;
      desc: string;
      name: string[]
    }> = ({ label, desc, name }) => {
      return (
        <Form.Item label={label} required tooltip={desc}>
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
          <UpstreamSelectorComponent />
        )}

        {!hiddenForm && (
          <React.Fragment>
            <TypeComponent />
            {NodeList()}

            <PassHostComponent />
            <RetryComponent />
            <SchemeComponent />
            {timeoutFields.map((item, index) => (
              <TimeoutComponent key={index} {...item} />
            ))}

            <HealthCheckComponent />
          </React.Fragment>
        )}
      </Form>
    );
  },
);

export default UpstreamForm;
