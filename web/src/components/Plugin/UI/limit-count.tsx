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
  return (<>
    <Form.Item
      label="redis_host"
      name="redis_host"
      tooltip='When using the redis policy, this property specifies the address of the Redis server.'
      required
    >
      <Input />
    </Form.Item>
    <Form.Item
      label="redis_port"
      name="redis_port"
      tooltip='When using the redis policy, this property specifies the port of the Redis server.'
    >
      <InputNumber min={1} />
    </Form.Item>
    <Form.Item
      label="redis_password"
      name="redis_password"
      tooltip='When using the redis policy, this property specifies the password of the Redis server.'
      required
    >
      <Input />
    </Form.Item>
    <Form.Item
      label="redis_database"
      name="redis_database"
      tooltip='When using the redis policy, this property specifies the database you selected of the Redis server, and only for non Redis cluster mode (single instance mode or Redis public cloud service that provides single entry).'
    >
      <InputNumber min={0} />
    </Form.Item>
    <Form.Item
      label="redis_timeout"
      name="redis_timeout"
      tooltip='When using the redis policy, this property specifies the timeout in milliseconds of any command submitted to the Redis server.'
    >
      <InputNumber />
    </Form.Item>
  </>)
}

const RedisClusterForm: React.FC<Props> = ({ form }) => {
  const { formatMessage } = useIntl();

  return (
    <>
      <Form.Item
        label="redis_cluster_name"
        name="redis_cluster_name"
        tooltip='When using redis-cluster policy, this property is the name of Redis cluster service nodes.'
        required
      >
        <Input />
      </Form.Item>
      <Form.List name="redis_cluster_nodes">
        {(fields, { add, remove }) => {
          return (
            <div>
              <Form.Item
                label='redis_cluster_nodes'
                tooltip='When using redis-cluster policy，This property is a list of addresses of Redis cluster service nodes.'
                style={{ marginBottom: 0 }}
              >
                {fields.map((field, index) => (
                  <Row style={{ marginBottom: 10 }} gutter={16} key={index}>
                    <Col>
                      <Form.Item
                        {...field}
                        validateTrigger={['onChange', 'onBlur']}
                        noStyle
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
    </>)
}

const LimitCount: React.FC<Props> = ({ form }) => {
  const [policy, setPoicy] = useState<PolicyProps>('local');

  return (
    <Form
      form={form}
      {...FORM_ITEM_LAYOUT}
      initialValues={{ key: 'remote_addr', redis_cluster_nodes: [''], policy, redis_port: 6379, redis_database: 0, redis_timeout: 1000 }}
    >
      <Form.Item
        label="count"
        name="count"
        tooltip='the specified number of requests threshold.'
        required
      >
        <InputNumber min={1} />
      </Form.Item>
      <Form.Item
        label="time_window"
        name="time_window"
        tooltip='the time window in seconds before the request count is reset.'
        required
      >
        <InputNumber min={1} />
      </Form.Item>
      <Form.Item
        label="key"
        name="key"
      >
        <Select>
          {["remote_addr", "server_addr", "http_x_real_ip", "http_x_forwarded_for", "consumer_name", "service_id"].map(item => (<Select.Option value={item}>{item}</Select.Option>))}
        </Select>
      </Form.Item>
      <Form.Item
        label="rejected_code"
        name="rejected_code"
        tooltip='The HTTP status code returned when the request exceeds the threshold is rejected, default 503.'
      >
        <InputNumber min={200} max={599} />
      </Form.Item>
      <Form.Item
        label="policy"
        name="policy"
      >
        <Select onChange={(e: PolicyProps) => { setPoicy(e) }}>
          {["local", "redis", "redis-cluster"].map(item => (<Select.Option value={item}>{item}</Select.Option>))}
        </Select>
      </Form.Item>
      { Boolean(policy === 'redis') && <RedisForm />}
      { Boolean(policy === 'redis-cluster') && <RedisClusterForm form={form} />}
    </Form>
  );
}

export default LimitCount;
