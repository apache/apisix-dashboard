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
import { Button, Form, Input, InputNumber, Switch } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useIntl } from '@/.umi/plugin-locale/localeExports';

type Props = {
  form: FormInstance;
  ref?: any;
};

const FORM_ITEM_LAYOUT = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 8
  },
};

export const FORM_ITEM_WITHOUT_LABEL = {
  wrapperCol: {
    sm: { span: 8, offset: 6 },
  },
};

const Cors: React.FC<Props> = ({ form }) => {
  const { formatMessage } = useIntl();

  return (
    <Form
      form={form}
      {...FORM_ITEM_LAYOUT}
    >
      <Form.Item
        name="allow_origins"
        label="allow_origins"
        initialValue={"*"}
      >
        <Input></Input>
      </Form.Item>
      <Form.Item
        name="allow_methods"
        label="allow_methods"
        initialValue={"*"}
      >
        <Input></Input>
      </Form.Item>
      <Form.Item
        name="allow_headers"
        label="allow_headers"
        initialValue={"*"}
      >
        <Input></Input>
      </Form.Item>
      <Form.Item
        name="expose_headers"
        label="expose_headers"
        initialValue={"*"}
      >
        <Input></Input>
      </Form.Item>
      <Form.Item
        name="max_age"
        label="max_age"
        initialValue={5}
      >
        <InputNumber></InputNumber>
      </Form.Item>
      <Form.Item
        name="allow_credential"
        label="allow_credential"
        valuePropName="checked"
        initialValue={false}
        extra="if you set this option to true, you can not use '*' for other options."
      >
        <Switch />
      </Form.Item>

      <Form.List name={['allow_origins_by_regex']}>
        {(fields, { add, remove }) => {
          return (
            <div>
              {fields.map((field, index) => (
                <Form.Item
                  {...(index === 0 ? FORM_ITEM_LAYOUT : FORM_ITEM_WITHOUT_LABEL)}
                  label={index === 0 && 'allow_origins_by_regex'}
                  key={field.key}
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
    </Form >
  );
}

export default Cors;
