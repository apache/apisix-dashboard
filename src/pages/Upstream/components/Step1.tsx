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
import { Form, Input, Row, Col, InputNumber, Select } from 'antd';
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

type Props = {
  form: FormInstance;
  disabled?: boolean;
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
};

const Step1: React.FC<Props> = ({ form, disabled }) => {
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
    </Form>
  );
};

export default Step1;
