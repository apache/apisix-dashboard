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
  schema: Record<string, any> | undefined;
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

const RefererRestriction: React.FC<Props> = ({ form, schema }) => {
  const { formatMessage } = useIntl();
  const properties = schema?.properties;
  const allowWhitelistMinLength = properties.whitelist.minItems;
  const allowBlacklistMinLength = properties.blacklist.minItems;
  const whiteInit = Array(allowWhitelistMinLength).join('.').split('.');
  const blackInit = Array(allowBlacklistMinLength).join('.').split('.');

  return (
    <Form
      form={form}
      {...FORM_ITEM_LAYOUT}
      initialValues={{ whitelist: whiteInit, blacklist: blackInit }}
    >
      <Form.List name="whitelist" initialValue={[]}>
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
                style={{ marginBottom: 0 }}
              >
                {fields.length === 0 && (
                  <span style={{ ...removeBtnStyle, marginLeft: 0 }}>
                    {formatMessage({
                      id: 'component.pluginForm.referer-restriction.listEmpty.tooltip',
                    })}
                  </span>
                )}
                {fields.map((field, index) => (
                  <Row style={{ marginBottom: 10 }} gutter={16} key={index}>
                    <Col span={10}>
                      <Form.Item
                        {...field}
                        validateTrigger={['onChange', 'onBlur', 'onClick']}
                        noStyle
                        rules={[
                          {
                            message: formatMessage({
                              id: 'page.route.form.itemRulesPatternMessage.domain',
                            }),
                            pattern: new RegExp(`${properties.whitelist.items.pattern}`, 'g'),
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col style={{ ...removeBtnStyle, marginLeft: -10 }}>
                      {fields.length > 0 && (
                        <MinusCircleOutlined
                          className="dynamic-delete-button"
                          onClick={() => {
                            remove(field.name);
                          }}
                        />
                      )}
                    </Col>
                  </Row>
                ))}
              </Form.Item>
              <Form.Item {...FORM_ITEM_WITHOUT_LABEL}>
                <Button
                  type="dashed"
                  data-cy="addWhitelist"
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
      <Form.List name="blacklist" initialValue={[]}>
        {(fields, { add, remove }) => {
          return (
            <div>
              <Form.Item
                extra={formatMessage({
                  id: 'component.pluginForm.referer-restriction.blacklist.tooltip',
                })}
                label="blacklist"
                tooltip={formatMessage({
                  id: 'component.pluginForm.referer-restriction.blacklist.tooltip',
                })}
                style={{ marginBottom: 0 }}
              >
                {fields.length === 0 && (
                  <span style={{ ...removeBtnStyle, marginLeft: 0 }}>
                    {formatMessage({
                      id: 'component.pluginForm.referer-restriction.listEmpty.tooltip',
                    })}
                  </span>
                )}
                {fields.map((field, index) => (
                  <Row style={{ marginBottom: 10 }} gutter={16} key={index}>
                    <Col span={10}>
                      <Form.Item
                        {...field}
                        validateTrigger={['onChange', 'onBlur', 'onClick']}
                        noStyle
                        rules={[
                          {
                            message: formatMessage({
                              id: 'page.route.form.itemRulesPatternMessage.domain',
                            }),
                            pattern: new RegExp(`${properties.blacklist.items.pattern}`, 'g'),
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col style={{ ...removeBtnStyle, marginLeft: -10 }}>
                      {fields.length > 0 && (
                        <MinusCircleOutlined
                          className="dynamic-delete-button"
                          onClick={() => {
                            remove(field.name);
                          }}
                        />
                      )}
                    </Col>
                  </Row>
                ))}
              </Form.Item>
              <Form.Item {...FORM_ITEM_WITHOUT_LABEL}>
                <Button
                  type="dashed"
                  data-cy="addBlacklist"
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
        <Switch defaultChecked={properties.bypass_missing.default} />
      </Form.Item>
      <Form.Item
        label="message"
        name="message"
        tooltip={formatMessage({ id: 'component.pluginForm.referer-restriction.message.tooltip' })}
      >
        <Input min={1} max={1024} placeholder={properties.message.default} />
      </Form.Item>
    </Form>
  );
};

export default RefererRestriction;
