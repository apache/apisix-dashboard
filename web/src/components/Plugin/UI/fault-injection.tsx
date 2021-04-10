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
import type { FormInstance } from 'antd/es/form';
import { Button, Form, Input, InputNumber, Select } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useIntl } from 'umi';

type Props = {
  form: FormInstance;
};

const FORM_ITEM_LAYOUT = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 7,
  },
};

const FORM_LIST_LAYOUT = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 10,
  },
};

const FORM_ITEM_WITHOUT_LABEL = {
  wrapperCol: {
    sm: { span: 10, offset: 6 },
  },
};

const FaultInjection: React.FC<Props> = ({ form }) => {
  const { formatMessage } = useIntl()

  return (
    <Form
      form={form}
      {...FORM_ITEM_LAYOUT}
    >
      <Form.Item
        name={['abort', 'http_status']}
        label='abort.http_status'
        required
        tooltip='user-specified http code returned to the client.'
      >
        <InputNumber min={200} required></InputNumber>
      </Form.Item>
      <Form.Item
        name={['abort', 'percentage']}
        label='abort.percentage'
        tooltip='percentage of requests to be aborted.'
      >
        <InputNumber min={0} max={100}></InputNumber>
      </Form.Item>
      <Form.Item
        name={['abort', 'body']}
        label='abort.body'
        tooltip='response data returned to the client. Nginx variable can be used inside.'
      >
        <Input min={200}></Input>
      </Form.Item>

      <Form.List name={['abort', 'vars']}>
        {(fields, { add, remove }) => {
          return (
            <div>
              {fields.map((field, index) => (
                <Form.Item
                  {...(index === 0 ? FORM_LIST_LAYOUT : FORM_ITEM_WITHOUT_LABEL)}
                  label={index === 0 && 'abort.vars'}
                  tooltip='The rules for executing fault injection will only be executed when the rules are matched.'
                  key={field.key}
                >
                  <Form.Item
                    {...field}
                    validateTrigger={['onChange', 'onBlur']}
                    noStyle
                  >
                    <Select style={{ width: '70%' }}>
                      {['==', '`~=', '>', '<', '~~', '~*', 'in', 'has', '!'].map((item, index) => {
                        return <Select.Option value={item} key={index}>{item}</Select.Option>
                      })}
                    </Select>
                  </Form.Item>
                  {fields.length > 1 ? (
                    <MinusCircleOutlined
                      className="dynamic-delete-button"
                      style={{ margin: '0 8px' }}
                      onClick={() => {
                        remove(field.name);
                      }}
                    />
                  ) : null}
                </Form.Item>
              ))}
              {
                <Form.Item {...FORM_ITEM_WITHOUT_LABEL}>
                  <Button
                    type="dashed"
                    onClick={() => {
                      add();
                    }}
                  >
                    <PlusOutlined /> {formatMessage({ id: 'component.global.create' })}
                  </Button>
                </Form.Item>
              }
            </div>
          );
        }}
      </Form.List>

      <Form.Item
        label="delay.duration"
        name={['delay', 'duration']}
        required
        tooltip='delay time (can be decimal).'
      >
        <InputNumber required></InputNumber>
      </Form.Item>
      <Form.Item
        label="delay.percentage"
        name={['delay', 'percentage']}
        tooltip='percentage of requests to be delayed.'
      >
        <InputNumber min={0} max={100}></InputNumber>
      </Form.Item>

      <Form.List name={['delay', 'vars']}>
        {(fields, { add, remove }) => {
          return (
            <div>
              {fields.map((field, index) => (
                <Form.Item
                  {...(index === 0 ? FORM_LIST_LAYOUT : FORM_ITEM_WITHOUT_LABEL)}
                  key={field.key}
                  label={index === 0 && 'delay.vars'}
                  tooltip='Execute the request delay rule, and the request will be delayed only after the rule matches.'
                >
                  <Form.Item
                    {...field}
                    validateTrigger={['onChange', 'onBlur']}
                    noStyle
                  >
                    <Select style={{ width: '70%' }}>
                      {['==', '`~=', '>', '<', '~~', '~*', 'in', 'has', '!'].map((item, index) => {
                        return <Select.Option value={item} key={index}>{item}</Select.Option>
                      })}
                    </Select>
                  </Form.Item>
                  {fields.length > 1 ? (
                    <MinusCircleOutlined
                      className="dynamic-delete-button"
                      style={{ margin: '0 8px' }}
                      onClick={() => {
                        remove(field.name);
                      }}
                    />
                  ) : null}
                </Form.Item>
              ))}
              {
                <Form.Item {...FORM_ITEM_WITHOUT_LABEL}>
                  <Button
                    type="dashed"
                    onClick={() => {
                      add();
                    }}
                  >
                    <PlusOutlined /> {formatMessage({ id: 'component.global.create' })}
                  </Button>
                </Form.Item>
              }
            </div>
          );
        }}
      </Form.List>
    </Form>
  );
}

export default FaultInjection;
