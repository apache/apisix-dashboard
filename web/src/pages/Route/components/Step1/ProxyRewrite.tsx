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
import { Button, Input, Radio, Row, Col } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useIntl } from 'umi';
import { PanelSection } from '@api7-dashboard/ui';

import {
  FORM_ITEM_LAYOUT,
  FORM_ITEM_WITHOUT_LABEL,
  SCHEME_REWRITE,
  URI_REWRITE_TYPE,
  HOST_REWRITE_TYPE
} from '@/pages/Route/constants';

const ProxyRewrite: React.FC<RouteModule.Step1PassProps> = ({ form, disabled }) => {
  const { formatMessage } = useIntl();

  const getUriRewriteItems = () => {
    switch (form.getFieldValue('URIRewriteType')) {
      case URI_REWRITE_TYPE.STATIC:
        return (
          <Form.Item
            label={formatMessage({ id: 'page.route.form.itemLabel.newPath' })}
            name={['proxyRewrite', 'uri']}
            rules={[
              {
                required: true,
                message: `${formatMessage({ id: 'component.global.pleaseEnter' })} ${formatMessage({
                  id: 'page.route.form.itemLabel.newPath',
                })}`,
              },
            ]}
          >
            <Input
              placeholder={`${formatMessage({
                id: 'component.global.pleaseEnter',
              })} ${formatMessage({ id: 'page.route.form.itemLabel.newPath' })}`}
              disabled={disabled}
            />
          </Form.Item>
        );
      case URI_REWRITE_TYPE.REGEXP:
        return (
          <Form.List
            name={['proxyRewrite', 'regex_uri']}
            initialValue={['', '']}
          >
            {(fields) =>
              fields.map((field, index) => {
                switch (index) {
                  case 0:
                    return (
                      <Form.Item
                        label={formatMessage({ id: 'page.route.form.itemLabel.regex' })}
                        name={field.name}
                        key={field.name}
                        rules={[
                          {
                            required: true,
                            message: `${formatMessage({
                              id: 'component.global.pleaseEnter',
                            })} ${formatMessage({ id: 'page.route.form.itemLabel.regex' })}`,
                          },
                        ]}
                      >
                        <Input
                          placeholder={`${formatMessage({
                            id: 'component.global.pleaseEnter',
                          })} ${formatMessage({ id: 'page.route.form.itemLabel.regex' })}`}
                          disabled={disabled}
                        />
                      </Form.Item>
                    );
                  case 1:
                    return (
                      <Form.Item
                        label={formatMessage({ id: 'page.route.form.itemLabel.template' })}
                        name={field.name}
                        key={field.name}
                        rules={[
                          {
                            required: true,
                            message: `${formatMessage({
                              id: 'component.global.pleaseEnter',
                            })} ${formatMessage({ id: 'page.route.form.itemLabel.template' })}`,
                          },
                        ]}
                      >
                        <Input
                          placeholder={`${formatMessage({
                            id: 'component.global.pleaseEnter',
                          })} ${formatMessage({ id: 'page.route.form.itemLabel.template' })}`}
                          disabled={disabled}
                        />
                      </Form.Item>
                    );
                  default:
                    return null;
                }
              })
            }
          </Form.List>
        );
      case URI_REWRITE_TYPE.KEEP:
      default:
        return null;
    }
  };

  const getHostRewriteItems = () => {
    switch (form.getFieldValue('hostRewriteType')) {
      case HOST_REWRITE_TYPE.REWRITE:
        return (
          <Form.Item
            label={formatMessage({ id: 'page.route.form.itemLabel.newHost' })}
            name={['proxyRewrite', 'host']}
            rules={[
              {
                required: true,
                message: `${formatMessage({ id: 'component.global.pleaseEnter' })} ${formatMessage({
                  id: 'page.route.form.itemLabel.newHost',
                })}`,
              },
            ]}
          >
            <Input
              placeholder={`${formatMessage({
                id: 'component.global.pleaseEnter',
              })} ${formatMessage({ id: 'page.route.form.itemLabel.newHost' })}`}
              disabled={disabled}
            />
          </Form.Item>
        );
      case HOST_REWRITE_TYPE.KEEP:
      default:
        return null;
    }
  };

  return (
    <PanelSection title={formatMessage({ id: 'page.route.panelSection.title.requestOverride' })}>
      <Form.Item
        label={formatMessage({ id: 'page.route.form.itemLabel.scheme' })}
        name={['proxyRewrite', 'scheme']}
      >
        <Radio.Group disabled={disabled}>
          <Radio value={SCHEME_REWRITE.KEEP}>
            {formatMessage({ id: 'page.route.radio.staySame' })}
          </Radio>
          <Radio value={SCHEME_REWRITE.HTTP}>{(SCHEME_REWRITE.HTTP).toLocaleUpperCase()}</Radio>
          <Radio value={SCHEME_REWRITE.HTTPS}>{(SCHEME_REWRITE.HTTPS).toLocaleUpperCase()}</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item
        label={formatMessage({ id: 'page.route.form.itemLabel.URIRewriteType' })}
        name='URIRewriteType'
      >
        <Radio.Group
          disabled={disabled}
        >
          <Radio value={URI_REWRITE_TYPE.KEEP}>
            {formatMessage({ id: 'page.route.radio.staySame' })}
          </Radio>
          <Radio data-cy='uri-static' value={URI_REWRITE_TYPE.STATIC}>
            {formatMessage({ id: 'page.route.radio.static' })}
          </Radio>
          <Radio value={URI_REWRITE_TYPE.REGEXP}>
            {formatMessage({ id: 'page.route.radio.regex' })}
          </Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item shouldUpdate={
        (prevValues, curValues) => prevValues.URIRewriteType !== curValues.URIRewriteType } noStyle>
        {
          () => {
            return getUriRewriteItems()
          }
        }
      </Form.Item>

      <Form.Item
        label={formatMessage({ id: 'page.route.form.itemLabel.hostRewriteType' })}
        name='hostRewriteType'
      >
        <Radio.Group
          disabled={disabled}
        >
          <Radio data-cy='host-keep' value={HOST_REWRITE_TYPE.KEEP}>
            {formatMessage({ id: 'page.route.radio.staySame' })}
          </Radio>
          <Radio data-cy='host-static' value={HOST_REWRITE_TYPE.REWRITE}>
            {formatMessage({ id: 'page.route.radio.static' })}
          </Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.hostRewriteType !== curValues.hostRewriteType} noStyle>
        {
          () =>{
            return getHostRewriteItems();
          }
        }
      </Form.Item>

      <Form.List
        name={['proxyRewrite', 'kvHeaders']}
        initialValue={[{}]}
      >
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <Form.Item
                {...(index === 0 ? FORM_ITEM_LAYOUT : FORM_ITEM_WITHOUT_LABEL)}
                label={
                  index === 0
                    ? formatMessage({ id: 'page.route.form.itemLabel.headerRewrite' })
                    : ''
                }
                key={field.key}
              >
                <Row gutter={24} key={field.name}>
                  <Col span={11}>
                    <Form.Item
                      name={[field.name, 'key']}
                      fieldKey={[field.fieldKey, 'key']}
                      noStyle
                    >
                      <Input
                        placeholder={`${formatMessage({
                          id: 'component.global.pleaseEnter',
                        })}${formatMessage({ id: 'page.route.parameterName' })}`}
                        disabled={disabled}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={11}>
                    <Form.Item
                      name={[field.name, 'value']}
                      fieldKey={[field.fieldKey, 'value']}
                      noStyle
                    >
                      <Input
                        placeholder={`${formatMessage({
                          id: 'component.global.pleaseEnter',
                        })}${formatMessage({ id: 'page.route.value' })}`}
                        disabled={disabled}
                      />
                    </Form.Item>
                  </Col>
                  {!disabled && fields.length > 1 && (
                    <Col>
                      <MinusCircleOutlined
                        className="dynamic-delete-button"
                        onClick={() => remove(field.name)}
                      />
                    </Col>
                  )}
                </Row>
              </Form.Item>
            ))}
            <Form.Item {...FORM_ITEM_WITHOUT_LABEL}>
              <Button data-cy='create-new-rewrite-header' type="dashed" disabled={disabled} onClick={() => add()} icon={<PlusOutlined />}>
                {formatMessage({ id: 'component.global.create' })}
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </PanelSection>
  );
};

export default ProxyRewrite;
