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
import React, { useState } from 'react';
import type { FormInstance } from 'antd/es/form';
import { Button, Col, Form, Input, InputNumber, Row, Select } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useIntl } from 'umi';

type Props = {
  form: FormInstance;
};

type PolicyProps = "local" | "redis" | "redis-cluster"

const FORM_ITEM_LAYOUT = {
  labelCol: {
    span: 7,
  },
  wrapperCol: {
    span: 10
  },
};

const FORM_ITEM_WITHOUT_LABEL = {
  wrapperCol: {
    span: 10, offset: 7,
  },
};

const removeBtnStyle = {
  marginLeft: 20,
  display: 'flex',
  alignItems: 'center',
};

const RedisForm: React.FC = () => {
  const { formatMessage } = useIntl();

  return (<>
    <Form.Item
      label="redis_host"
      name="redis_host"
      tooltip={formatMessage({ id: 'component.pluginForm.limit-count.redis_host.tooltip' })}
      rules={[
        { required: true, message: `${formatMessage({ id: 'component.global.pleaseEnter' })} redis_host` },
        { min: 2, message: formatMessage({ id: 'component.pluginForm.limit-count.atLeast2Characters.rule' }) }
      ]}
      validateTrigger={['onChange', 'onBlur', 'onClick']}
    >
      <Input />
    </Form.Item>
    <Form.Item
      initialValue={6379}
      label="redis_port"
      name="redis_port"
      tooltip={formatMessage({ id: 'component.pluginForm.limit-count.redis_port.tooltip' })}
    >
      <InputNumber min={1} max={65535} />
    </Form.Item>
    <Form.Item
      label="redis_password"
      name="redis_password"
      tooltip={formatMessage({ id: 'component.pluginForm.limit-count.redis_password.tooltip' })}
      rules={[{ required: true, message: `${formatMessage({ id: 'component.global.pleaseEnter' })} redis_password` }]}
      validateTrigger={['onChange', 'onBlur', 'onClick']}
    >
      <Input />
    </Form.Item>
    <Form.Item
      initialValue={0}
      label="redis_database"
      name="redis_database"
      tooltip={formatMessage({ id: 'component.pluginForm.limit-count.redis_database.tooltip' })}
    >
      <InputNumber min={0} />
    </Form.Item>
    <Form.Item
      initialValue={1000}
      label="redis_timeout"
      name="redis_timeout"
      tooltip={formatMessage({ id: 'component.pluginForm.limit-count.redis_timeout.tooltip' })}
    >
      <InputNumber min={1} />
    </Form.Item>
  </>)
}

const RedisClusterForm: React.FC = () => {
  const { formatMessage } = useIntl();

  return (
    <>
      <Form.Item
        label="redis_cluster_name"
        name="redis_cluster_name"
        rules={[{ required: true, message: `${formatMessage({ id: 'component.global.pleaseEnter' })} redis_cluster_name` }]}
        tooltip={formatMessage({ id: 'component.pluginForm.limit-count.redis_cluster_name.tooltip' })}
      >
        <Input />
      </Form.Item>
      <Form.List name="redis_cluster_nodes" initialValue={['', '']}>
        {(fields, { add, remove }) => {
          return (
            <div>
              <Form.Item
                label='redis_cluster_nodes'
                style={{ marginBottom: 0 }}
                required
                tooltip={formatMessage({ id: 'component.pluginForm.limit-count.redis_cluster_nodes.tooltip' })}
              >
                {fields.map((field, index) => (
                  <Row style={{ marginBottom: 10 }} gutter={16} key={index}>
                    <Col>
                      <Form.Item
                        {...field}
                        noStyle
                        validateTrigger={['onChange', 'onBlur', 'onClick']}
                        rules={[{ required: true, message: `${formatMessage({ id: 'component.global.pleaseEnter' })} redis_cluster_name` }, { min: 2, message: formatMessage({ id: 'component.pluginForm.limit-count.atLeast2Characters.rule' }) }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col style={{ ...removeBtnStyle, marginLeft: -10 }}>
                      {fields.length > 1 ? (
                        <MinusCircleOutlined
                          className="dynamic-delete-button"
                          onClick={() => {
                            remove(field.name);
                          }}
                        />
                      ) : null}
                    </Col>
                  </Row>
                ))}
              </Form.Item>

              <Form.Item {...FORM_ITEM_WITHOUT_LABEL}>
                <Button
                  type="dashed"
                  onClick={() => {
                    add();
                  }}
                >
                  <PlusOutlined /> {formatMessage({ id: 'component.global.add' })}
                </Button>
              </Form.Item>
            </div>
          );
        }}
      </Form.List>
      <Form.Item
        label="redis_password"
        name="redis_password"
        tooltip={formatMessage({ id: 'component.pluginForm.limit-count.redis_password.tooltip' })}
      >
        <Input />
      </Form.Item>
      <Form.Item
        initialValue={1000}
        label="redis_timeout"
        name="redis_timeout"
        tooltip={formatMessage({ id: 'component.pluginForm.limit-count.redis_timeout.tooltip' })}
      >
        <InputNumber min={1} />
      </Form.Item>
    </>)
}

const LimitCount: React.FC<Props> = ({ form }) => {
  const [policy, setPoicy] = useState<PolicyProps>('local');
  const { formatMessage } = useIntl()

  return (
    <Form
      form={form}
      {...FORM_ITEM_LAYOUT}
    >
      <Form.Item
        label="count"
        name="count"
        rules={[{ required: true, message: `${formatMessage({ id: 'component.global.pleaseEnter' })} count` }]}
        tooltip={formatMessage({ id: 'component.pluginForm.limit-count.count.tooltip' })}
        validateTrigger={['onChange', 'onBlur', 'onClick']}
      >
        <InputNumber min={1} />
      </Form.Item>
      <Form.Item
        label="time_window"
        name="time_window"
        rules={[{ required: true, message: `${formatMessage({ id: 'component.global.pleaseEnter' })} time_window` }]}
        tooltip={formatMessage({ id: 'component.pluginForm.limit-count.time_window.tooltip' })}
        validateTrigger={['onChange', 'onBlur', 'onClick']}
      >
        <InputNumber min={1} />
      </Form.Item>
      <Form.Item
        initialValue='remote_addr'
        label="key"
        name="key"
        tooltip={formatMessage({ id: 'component.pluginForm.limit-count.key.tooltip' })}
      >
        <Select>
          {["remote_addr", "server_addr", "http_x_real_ip", "http_x_forwarded_for", "consumer_name", "service_id"].map(item => (<Select.Option value={item} key={item}>{item}</Select.Option>))}
        </Select>
      </Form.Item>
      <Form.Item
        initialValue={503}
        label="rejected_code"
        name="rejected_code"
        tooltip={formatMessage({ id: 'component.pluginForm.limit-count.rejected_code.tooltip' })}
      >
        <InputNumber min={200} max={599} />
      </Form.Item>
      <Form.Item
        initialValue={policy}
        label="policy"
        name="policy"
        tooltip={formatMessage({ id: 'component.pluginForm.limit-count.policy.tooltip' })}
      >
        <Select onChange={(e: PolicyProps) => { setPoicy(e) }}>
          {["local", "redis", "redis-cluster"].map(item => (<Select.Option value={item} key={item}>{item}</Select.Option>))}
        </Select>
      </Form.Item>
      <Form.Item shouldUpdate={(prev, next) => prev.policy !== next.policy} style={{ display: 'none' }}>
        {() => {
          setPoicy(form.getFieldValue('policy'));
        }}
      </Form.Item>
      {Boolean(policy === 'redis') && <RedisForm />}
      {Boolean(policy === 'redis-cluster') && <RedisClusterForm />}
    </Form>
  );
}

export default LimitCount;
