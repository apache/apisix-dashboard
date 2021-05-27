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
import Form from 'antd/es/form';
import { Button, Input, Select, Row, Col, InputNumber } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useIntl } from 'umi';

import PanelSection from '@/components/PanelSection';

import {
  HTTP_METHOD_OPTION_LIST,
  FORM_ITEM_WITHOUT_LABEL,
} from '@/pages/Route/constants';

const removeBtnStyle = {
  marginLeft: 20,
  display: 'flex',
  alignItems: 'center',
};

const RequestConfigView: React.FC<RouteModule.Step1PassProps> = ({
  form,
  disabled,
}) => {
  const { formatMessage } = useIntl();

  const HostList = () => (
    <Form.List name="hosts">
      {(fields, { add, remove }) => {
        return (
          <div>
            <Form.Item
              label={formatMessage({ id: 'page.route.host' })}
              tooltip={formatMessage({ id: 'page.route.form.itemExtraMessage.domain' })}
              style={{ marginBottom: 0 }}
            >
              {fields.map((field, index) => (
                <Row style={{ marginBottom: 10 }} gutter={16} key={index}>
                  <Col span={10}>
                    <Form.Item
                      {...field}
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        {
                          // NOTE: https://github.com/apache/apisix/blob/master/apisix/schema_def.lua#L40
                          pattern: new RegExp(/^\*?[0-9a-zA-Z-._]+$/, 'g'),
                          message: formatMessage({
                            id: 'page.route.form.itemRulesPatternMessage.domain',
                          }),
                        },
                      ]}
                      noStyle
                    >
                      <Input
                        placeholder={formatMessage({ id: 'page.route.configuration.host.placeholder' })}
                        disabled={disabled}
                      />
                    </Form.Item>
                  </Col>
                  <Col style={{ ...removeBtnStyle, marginLeft: -10 }}>
                    {!disabled && fields.length > 1 ? (
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
            {!disabled && (
              <Form.Item {...FORM_ITEM_WITHOUT_LABEL}>
                <Button
                  type="dashed"
                  data-cy="addHost"
                  onClick={() => {
                    add();
                  }}
                >
                  <PlusOutlined /> {formatMessage({ id: 'component.global.add' })}
                </Button>
              </Form.Item>
            )}
          </div>
        );
      }}
    </Form.List>
  );

  const UriList = () => (
    <Form.List name="uris">
      {(fields, { add, remove }) => {
        return (
          <div>
            <Form.Item
              label={formatMessage({ id: 'page.route.path' })}
              required
              tooltip={
                formatMessage({ id: 'page.route.form.itemExtraMessage1.path' })
              }
              style={{ marginBottom: 0 }}
            >
              {fields.map((field, index) => (
                <Row style={{ marginBottom: 10 }} gutter={16} key={index}>
                  <Col span={10}>
                    <Form.Item
                      {...field}
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        {
                          required: true,
                          whitespace: true,
                          message: formatMessage({ id: "page.route.configuration.path.rules.required.description" }),
                        },
                      ]}
                      noStyle
                    >
                      <Input
                        placeholder={formatMessage({ id: 'page.route.configuration.path.placeholder' })}
                        disabled={disabled}
                      />
                    </Form.Item>
                  </Col>
                  <Col style={{ ...removeBtnStyle, marginLeft: -10 }}>
                    {!disabled && fields.length > 1 && (
                      <MinusCircleOutlined
                        className="dynamic-delete-button"
                        onClick={() => {
                          remove(field.name);
                        }}
                      />
                    )}</Col>
                </Row>
              ))}
            </Form.Item>
            {!disabled && (
              <Form.Item {...FORM_ITEM_WITHOUT_LABEL}>
                <Button
                  type="dashed"
                  data-cy="addUri"
                  onClick={() => {
                    add();
                  }}
                >
                  <PlusOutlined /> {formatMessage({ id: 'component.global.add' })}
                </Button>
              </Form.Item>
            )}
          </div>
        );
      }}
    </Form.List>
  );

  const RemoteAddrList = () => (
    <Form.List name="remote_addrs">
      {(fields, { add, remove }) => {
        return (
          <div>
            <Form.Item
              label={formatMessage({ id: 'page.route.remoteAddrs' })}
              tooltip={formatMessage({ id: 'page.route.form.itemExtraMessage1.remoteAddrs' })}
              style={{ marginBottom: 0 }}
            >
              {fields.map((field, index) => (
                <Row style={{ marginBottom: 10 }} gutter={16} key={index}>
                  <Col span={10}>
                    <Form.Item
                      {...field}
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        {
                          pattern: new RegExp(
                            /^[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}$|^[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}\/[0-9]{1,2}$|^([a-fA-F0-9]{0,4}:){0,8}(:[a-fA-F0-9]{0,4}){0,8}([a-fA-F0-9]{0,4})?$|^([a-fA-F0-9]{0,4}:){0,8}(:[a-fA-F0-9]{0,4}){0,8}([a-fA-F0-9]{0,4})?\/[0-9]{1,3}$/,
                            'g',
                          ),
                          message: formatMessage({
                            id: 'page.route.form.itemRulesPatternMessage.remoteAddrs',
                          }),
                        },
                      ]}
                      noStyle
                    >
                      <Input
                        placeholder={formatMessage({ id: 'page.route.configuration.remote_addrs.placeholder' })}
                        disabled={disabled}
                      />
                    </Form.Item>
                  </Col>
                  <Col style={{ ...removeBtnStyle, marginLeft: -10 }}>
                    {!disabled && fields.length > 1 && (
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
            {!disabled && (
              <Form.Item {...FORM_ITEM_WITHOUT_LABEL}>
                <Button
                  type="dashed"
                  data-cy="addRemoteAddr"
                  onClick={() => {
                    add();
                  }}
                >
                  <PlusOutlined /> {formatMessage({ id: 'component.global.add' })}
                </Button>
              </Form.Item>
            )}
          </div>
        );
      }}
    </Form.List>
  );

  const HTTPMethods: React.FC = () => (
    <Form.Item
      label={formatMessage({ id: 'page.route.form.itemLabel.httpMethod' })}
    >
      <Row>
        <Col span={10}>
          <Form.Item
            name="methods"
            noStyle
          >
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              optionLabelProp="label"
              disabled={disabled}
              onChange={(value) => {
                if ((value as string[]).includes('ALL')) {
                  form.setFieldsValue({
                    methods: ['ALL'],
                  });
                }
              }}
            >
              {['ALL'].concat(HTTP_METHOD_OPTION_LIST).map((item) => {
                return (
                  <Select.Option key={item} value={item}>
                    {item}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </Form.Item>
  )

  const RoutePriority: React.FC = () => (
    <Form.Item label={formatMessage({ id: 'page.route.form.itemLabel.priority' })}>
      <Row>
        <Col span={5}>
          <Form.Item
            noStyle
            name="priority"
          >
            <InputNumber
              placeholder={`Please input ${formatMessage({
                id: 'page.route.form.itemLabel.priority',
              })}`}
              disabled={disabled}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form.Item>
  )



  return (
    <PanelSection
      title={formatMessage({ id: 'page.route.panelSection.title.requestConfigBasicDefine' })}
    >
      <HostList />
      <UriList />
      <RemoteAddrList />
      <HTTPMethods />
      <RoutePriority />
    </PanelSection>
  );
};

export default RequestConfigView;
