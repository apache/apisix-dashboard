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
import { Button, Form, InputNumber } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useIntl } from 'umi';

type Props = {
  form: FormInstance;
};

const FORM_ITEM_LAYOUT = {
  labelCol: {
    span: 7,
  },
  wrapperCol: {
    span: 7
  },
};

const FORM_ITEM_WITHOUT_LABEL = {
  wrapperCol: {
    sm: { span: 14, offset: 7 },
  },
};

const ApiBreaker: React.FC<Props> = ({ form }) => {
  const { formatMessage } = useIntl()

  return (
    <Form
      form={form}
      {...FORM_ITEM_LAYOUT}
      initialValues={{ unhealthy: { http_statuses: [500] }, healthy: { http_statuses: [200] } }}
    >
      <Form.Item
        label="break_response_code"
        required
        name="break_response_code"
        tooltip='Return error code when unhealthy'
      >
        <InputNumber min={200} max={599} required></InputNumber>
      </Form.Item>

      <Form.Item
        label="max_breaker_sec"
        name="max_breaker_sec"
        initialValue={300}
        tooltip='Maximum breaker time(seconds)'
      >
        <InputNumber min={60}></InputNumber>
      </Form.Item>

      <Form.List name={['unhealthy', 'http_statuses']}>
        {(fields, { add, remove }) => {
          return (
            <div>
              {fields.map((field, index) => (
                <Form.Item
                  {...(index === 0 ? FORM_ITEM_LAYOUT : FORM_ITEM_WITHOUT_LABEL)}
                  label={index === 0 && 'unhealthy.http_statuses'}
                  tooltip='Status codes when unhealthy'
                  key={field.key}
                >
                  <Form.Item
                    {...field}
                    validateTrigger={['onChange', 'onBlur']}
                    noStyle
                  >
                    <InputNumber min={500} max={599}></InputNumber>
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
                    data-cy="addHost"
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
        label="unhealthy.failures"
        name={['unhealthy', 'failures']}
        initialValue={3}
        tooltip='Number of consecutive error requests that triggered an unhealthy state'
      >
        <InputNumber min={1}></InputNumber>
      </Form.Item>

      <Form.List name={['healthy', 'http_statuses']}>
        {(fields, { add, remove }) => {
          return (
            <div>
              {fields.map((field, index) => (
                <Form.Item
                  {...(index === 0 ? FORM_ITEM_LAYOUT : FORM_ITEM_WITHOUT_LABEL)}
                  key={field.key}
                  label={index === 0 && 'healthy.http_statuses'}
                  tooltip='Status codes when healthy'
                >
                  <Form.Item
                    {...field}
                    validateTrigger={['onChange', 'onBlur']}
                    noStyle
                  >
                    <InputNumber min={200} max={499}></InputNumber>
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
                    data-cy="addHost"
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
        label="healthy.successes"
        name={['healthy', 'successes']}
        initialValue={3}
        tooltip='Number of consecutive normal requests that trigger health status'
      >
        <InputNumber min={1}></InputNumber>
      </Form.Item>
    </Form>
  );
}

export default ApiBreaker;
