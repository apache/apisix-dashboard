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
import { Button, Col, Form, Input, InputNumber, Row, Select, Switch } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useIntl } from '@/.umi/plugin-locale/localeExports';

type Props = {
  form: FormInstance;
  ref?: any;
};

const FORM_ITEM_LAYOUT = {
  labelCol: {
    span: 7,
  },
  wrapperCol: {
    span: 8
  },
};

export const FORM_ITEM_WITHOUT_LABEL = {
  wrapperCol: {
    sm: { span: 8, offset: 7 },
  },
};

const Cors: React.FC<Props> = ({ form }) => {
  const { formatMessage } = useIntl();

  const HTTPMethods: React.FC = () => (
    <Form.Item
      label="allow_methods"
      tooltip={formatMessage({ id: 'component.pluginForm.cors.allow_methods.tooltip' })}
    >
      <Row>
        <Col span={24}>
          <Form.Item
            name="allow_methods"
            initialValue={["*"]}
          >
            <Select
              mode="multiple"
              optionLabelProp="label"
              onChange={(value: string[]) => {
                if (value.includes('*')) {
                  form.setFieldsValue({
                    allow_methods: ['*'],
                  });
                }
              }}
            >
              {['*', 'GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'CONNECT', 'TRACE'].map((item) => {
                return <Select.Option value={item} key={item}>{item}</Select.Option>
              })}
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </Form.Item >
  );

  return (
    <Form
      form={form}
      {...FORM_ITEM_LAYOUT}
    >
      <Form.Item
        extra={formatMessage({ id: 'component.pluginForm.cors.allow_origins.extra' })}
        name="allow_origins"
        label="allow_origins"
        initialValue="*"
        tooltip={formatMessage({ id: 'component.pluginForm.cors.allow_origins.tooltip' })}
      >
        <Input />
      </Form.Item>
      <HTTPMethods />

      <Form.Item
        name="allow_headers"
        label="allow_headers"
        initialValue="*"
        tooltip={formatMessage({ id: 'component.pluginForm.cors.allow_headers.tooltip' })}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="expose_headers"
        label="expose_headers"
        initialValue="*"
        tooltip={formatMessage({ id: 'component.pluginForm.cors.expose_headers.tooltip' })}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="max_age"
        label="max_age"
        initialValue={5}
        tooltip={formatMessage({ id: 'component.pluginForm.cors.max_age.tooltip' })}
      >
        <InputNumber />
      </Form.Item>
      <Form.Item
        name="allow_credential"
        label="allow_credential"
        valuePropName="checked"
        initialValue={false}
        tooltip={formatMessage({ id: 'component.pluginForm.cors.allow_credential.tooltip' })}
      >
        <Switch />
      </Form.Item>

      <Form.List name='allow_origins_by_regex' initialValue={['']}>
        {(fields, { add, remove }) => {
          return (
            <div>
              {fields.map((field, index) => (
                <Form.Item
                  {...(index === 0 ? FORM_ITEM_LAYOUT : FORM_ITEM_WITHOUT_LABEL)}
                  label={index === 0 && 'allow_origins_by_regex'}
                  key={field.key}
                  tooltip={formatMessage({ id: 'component.pluginForm.cors.allow_origins_by_regex.tooltip' })}
                >
                  <Form.Item
                    {...field}
                    validateTrigger={['onChange', 'onBlur']}
                    noStyle
                  >
                    <Input style={{ width: '80%' }} />
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
                    data-cy="add-allow_origins_by_regex"
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
    </Form >
  );
}

export default Cors;
