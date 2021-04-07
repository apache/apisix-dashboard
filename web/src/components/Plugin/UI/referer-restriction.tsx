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
import React, { forwardRef } from 'react';
import type { FormInstance } from 'antd/es/form';
import { Form, Input, Button, Switch } from 'antd';
import { useIntl } from 'umi';
import { FORM_ITEM_LAYOUT, FORM_ITEM_WITHOUT_LABEL } from '@/pages/Route/constants';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

type Props = {
  form
  : FormInstance;
};


const RefererRestriction: React.FC<Props> = forwardRef(
  ({ form }) => {
    const { formatMessage } = useIntl()
    return (
      <Form
        form={form}
        labelCol={{ span: 5 }}
        initialValues={{ whitelist: [''] }}
      >
        <Form.List name="whitelist" >
          {(fields, { add, remove }) => {
            return (
              <div>
                {fields.map((field, index) => (
                  <Form.Item
                    {...(index === 0 ? FORM_ITEM_LAYOUT : FORM_ITEM_WITHOUT_LABEL)}
                    label={index === 0 && 'whitelist'}
                    key={field.key}
                    required

                  >
                    <Form.Item
                      {...field}
                      validateTrigger={['onChange', 'onBlur']}
                      required
                      noStyle

                    >
                      <Input
                        style={{ width: '60%' }}
                      />
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
          label="bypass_missing"
          name="bypass_missing"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    );
  },
);

export default RefererRestriction;
