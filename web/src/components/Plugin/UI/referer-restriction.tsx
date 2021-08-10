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
import { Form, Input, Button, Switch, Row, Col } from 'antd';
import { useIntl } from 'umi';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

type Props = {
  form: FormInstance;
};

const FORM_ITEM_LAYOUT = {
  labelCol: {
    span: 5,
  },
  wrapperCol: {
    span: 18,
  },
};

const FORM_ITEM_WITHOUT_LABEL = {
  wrapperCol: {
    span: 10,
    offset: 5,
  },
};

const removeBtnStyle = {
  marginLeft: 20,
  display: 'flex',
  alignItems: 'center',
};

const RefererRestriction: React.FC<Props> = ({ form }) => {
  const { formatMessage } = useIntl();
  return (
    <Form form={form} {...FORM_ITEM_LAYOUT} initialValues={{ whitelist: [''] }}>
      <Form.List name="whitelist">
        {(fields, { add, remove }) => {
          return (
            <div>
              <Form.Item
                extra={formatMessage({
                  id: 'component.pluginForm.referer-restriction.whitelist.tooltip',
                })}
                label="whitelist"
                tooltip={formatMessage({
                  id: 'component.pluginForm.referer-restriction.whitelist.tooltip',
                })}
                required
                style={{ marginBottom: 0 }}
              >
                {fields.map((field, index) => (
                  <Row style={{ marginBottom: 10 }} gutter={16} key={index}>
                    <Col span={10}>
                      <Form.Item
                        {...field}
                        validateTrigger={['onChange', 'onBlur', 'onClick']}
                        noStyle
                        required
                        rules={[
                          {
                            message: formatMessage({
                              id: 'page.route.form.itemRulesPatternMessage.domain',
                            }),
                            pattern: new RegExp(/^\*?[0-9a-zA-Z-._]+$/, 'g'),
                          },
                          {
                            required: true,
                            message: `${formatMessage({
                              id: 'component.global.pleaseEnter',
                            })} whitelist`,
                          },
                        ]}
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
        extra={formatMessage({
          id: 'component.pluginForm.referer-restriction.bypass_missing.tooltip',
        })}
        label="bypass_missing"
        name="bypass_missing"
        tooltip={formatMessage({
          id: 'component.pluginForm.referer-restriction.bypass_missing.tooltip',
        })}
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>
    </Form>
  );
};

export default RefererRestriction;
