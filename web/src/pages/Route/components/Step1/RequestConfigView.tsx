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
import React, { useEffect, useState } from 'react';
import Form from 'antd/es/form';
import { Button, Input, Select, Row, Col, InputNumber, Switch } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useIntl } from 'umi';
import { PanelSection } from '@api7-dashboard/ui';

import {
  HTTP_METHOD_OPTION_LIST,
  FORM_ITEM_LAYOUT,
  FORM_ITEM_WITHOUT_LABEL,
} from '@/pages/Route/constants';
import { fetchServiceList } from '../../service';

const RequestConfigView: React.FC<RouteModule.Step1PassProps> = ({
  form,
  disabled,
  onChange = () => {},
}) => {
  const { formatMessage } = useIntl();
  const [serviceList, setServiceList] = useState<ServiceModule.ResponseBody[]>([]);

  useEffect(() => {
    fetchServiceList().then(({ data }) => setServiceList(data));
  }, []);

  const HostList = () => (
    <Form.List name="hosts">
      {(fields, { add, remove }) => {
        return (
          <div>
            {fields.map((field, index) => (
              <Form.Item
                {...(index === 0 ? FORM_ITEM_LAYOUT : FORM_ITEM_WITHOUT_LABEL)}
                label={index === 0 && formatMessage({ id: 'page.route.domainName' })}
                key={field.key}
                extra={
                  index === 0 && formatMessage({ id: 'page.route.form.itemExtraMessage.domain' })
                }
              >
                <Form.Item
                  {...field}
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[
                    {
                      pattern: new RegExp(/(^\*?[a-zA-Z0-9._-]+$|^\*$)/, 'g'),
                      message: formatMessage({
                        id: 'page.route.form.itemRulesPatternMessage.domain',
                      }),
                    },
                  ]}
                  noStyle
                >
                  <Input
                    placeholder={`${formatMessage({
                      id: 'component.global.pleaseEnter',
                    })} ${formatMessage({ id: 'page.route.domainName' })}`}
                    style={{ width: '60%' }}
                    disabled={disabled}
                  />
                </Form.Item>
                {!disabled && fields.length > 1 ? (
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
            {!disabled && (
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
            {fields.map((field, index) => (
              <Form.Item
                {...(index === 0 ? FORM_ITEM_LAYOUT : FORM_ITEM_WITHOUT_LABEL)}
                label={index === 0 && formatMessage({ id: 'page.route.path' })}
                required
                key={field.key}
                extra={
                  index === 0 && (
                    <div>
                      {formatMessage({ id: 'page.route.form.itemExtraMessage1.path' })}
                      <br />
                      {formatMessage({ id: 'page.route.form.itemExtraMessage2.path' })}
                    </div>
                  )
                }
              >
                <Form.Item
                  {...field}
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: `${formatMessage({
                        id: 'component.global.pleaseEnter',
                      })} ${formatMessage({ id: 'page.route.path' })}`,
                    },
                    {
                      pattern: new RegExp(/^\/[a-zA-Z0-9\-._~%!$&'()+,;=:@/]*\*?$/, 'g'),
                      message: formatMessage({
                        id: 'page.route.form.itemRulesPatternMessage.path',
                      }),
                    },
                  ]}
                  noStyle
                >
                  <Input
                    placeholder={`${formatMessage({
                      id: 'component.global.pleaseEnter',
                    })} ${formatMessage({ id: 'page.route.path' })}`}
                    style={{ width: '60%' }}
                    disabled={disabled}
                  />
                </Form.Item>
                {!disabled && fields.length > 1 && (
                  <MinusCircleOutlined
                    className="dynamic-delete-button"
                    style={{ margin: '0 8px' }}
                    onClick={() => {
                      remove(field.name);
                    }}
                  />
                )}
              </Form.Item>
            ))}
            {!disabled && (
              <Form.Item {...FORM_ITEM_WITHOUT_LABEL}>
                <Button
                  type="dashed"
                  data-cy="addUri"
                  onClick={() => {
                    add();
                  }}
                >
                  <PlusOutlined /> {formatMessage({ id: 'component.global.create' })}
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
            {fields.map((field, index) => (
              <Form.Item
                {...(index === 0 ? FORM_ITEM_LAYOUT : FORM_ITEM_WITHOUT_LABEL)}
                label={index === 0 && formatMessage({ id: 'page.route.remoteAddrs' })}
                key={field.key}
                extra={
                  index === 0 && (
                    <div>
                      {formatMessage({ id: 'page.route.form.itemExtraMessage1.remoteAddrs' })}
                    </div>
                  )
                }
              >
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
                    placeholder={`${formatMessage({
                      id: 'component.global.pleaseEnter',
                    })} ${formatMessage({ id: 'page.route.remoteAddrs' })}`}
                    style={{ width: '60%' }}
                    disabled={disabled}
                  />
                </Form.Item>
                {!disabled && fields.length > 1 && (
                  <MinusCircleOutlined
                    className="dynamic-delete-button"
                    style={{ margin: '0 8px' }}
                    onClick={() => {
                      remove(field.name);
                    }}
                  />
                )}
              </Form.Item>
            ))}
            {!disabled && (
              <Form.Item {...FORM_ITEM_WITHOUT_LABEL}>
                <Button
                  type="dashed"
                  data-cy="addRemoteAddr"
                  onClick={() => {
                    add();
                  }}
                >
                  <PlusOutlined /> {formatMessage({ id: 'component.global.create' })}
                </Button>
              </Form.Item>
            )}
          </div>
        );
      }}
    </Form.List>
  );

  return (
    <PanelSection
      title={formatMessage({ id: 'page.route.panelSection.title.requestConfigBasicDefine' })}
    >
      <HostList />
      <UriList />
      <RemoteAddrList />
      <Form.Item
        label={formatMessage({ id: 'page.route.form.itemLabel.httpMethod' })}
        name="methods"
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
      <Form.Item
        label={formatMessage({ id: 'page.route.form.itemLabel.priority' })}
        name="priority"
      >
        <InputNumber
          placeholder={`Please input ${formatMessage({
            id: 'page.route.form.itemLabel.priority',
          })}`}
          style={{ width: '60%' }}
          disabled={disabled}
        />
      </Form.Item>
      <Form.Item label="Websocket" valuePropName="checked" name="enable_websocket">
        <Switch disabled={disabled} />
      </Form.Item>
      <Form.Item
        label={formatMessage({ id: 'page.route.form.itemLabel.redirect' })}
        name="redirectOption"
      >
        <Select
          disabled={disabled}
          onChange={(parmas) => {
            onChange({ action: 'redirectOptionChange', data: parmas });
          }}
        >
          <Select.Option value="forceHttps">
            {formatMessage({ id: 'page.route.select.option.enableHttps' })}
          </Select.Option>
          <Select.Option value="customRedirect">
            {formatMessage({ id: 'page.route.select.option.configCustom' })}
          </Select.Option>
          <Select.Option value="disabled">
            {formatMessage({ id: 'page.route.select.option.forbidden' })}
          </Select.Option>
        </Select>
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, next) => {
          if (prev.redirectOption !== next.redirectOption) {
            onChange({ action: 'redirectOptionChange', data: next.redirectOption });
          }
          return prev.redirectOption !== next.redirectOption;
        }}
      >
        {() => {
          if (form.getFieldValue('redirectOption') === 'customRedirect') {
            return (
              <Form.Item
                label={formatMessage({ id: 'page.route.form.itemLabel.redirectCustom' })}
                required
              >
                <Row gutter={10}>
                  <Col>
                    <Form.Item
                      name="redirectURI"
                      rules={[
                        {
                          required: true,
                          message: `${formatMessage({
                            id: 'component.global.pleaseEnter',
                          })}${formatMessage({
                            id: 'page.route.form.itemLabel.redirectURI',
                          })}`,
                        },
                      ]}
                    >
                      <Input
                        placeholder={formatMessage({
                          id: 'page.route.input.placeholder.redirectCustom',
                        })}
                        disabled={disabled}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={10}>
                    <Form.Item name="ret_code" rules={[{ required: true }]}>
                      <Select disabled={disabled}>
                        <Select.Option value={301}>
                          {formatMessage({ id: 'page.route.select.option.redirect301' })}
                        </Select.Option>
                        <Select.Option value={302}>
                          {formatMessage({ id: 'page.route.select.option.redirect302' })}
                        </Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>
            );
          }
          return null;
        }}
      </Form.Item>
      <Form.Item label={formatMessage({ id: 'page.route.service' })} name="service_id">
        <Select disabled={disabled}>
          {/* TODO: value === '' means  no service_id select, need to find a better way */}
          <Select.Option value="" key={Math.random().toString(36).substring(7)}>
            None
          </Select.Option>
          {serviceList.map((item) => {
            return (
              <Select.Option value={item.id} key={item.id}>
                {item.name}
              </Select.Option>
            );
          })}
        </Select>
      </Form.Item>
    </PanelSection>
  );
};

export default RequestConfigView;
