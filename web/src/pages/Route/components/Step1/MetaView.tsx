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
import { Input, Switch, Select, Button, Tag, AutoComplete, Row, Col, notification } from 'antd';
import { useIntl } from 'umi';

import PanelSection from '@/components/PanelSection';
import { FORM_ITEM_WITHOUT_LABEL } from '@/pages/Route/constants';
import LabelsDrawer from '@/components/LabelsfDrawer';
import { fetchLabelList, fetchServiceList } from '../../service';

const MetaView: React.FC<RouteModule.Step1PassProps> = ({
  disabled,
  form,
  isEdit,
  upstreamForm,
  onChange = () => {},
}) => {
  const { formatMessage } = useIntl();
  const [visible, setVisible] = useState(false);
  const [labelList, setLabelList] = useState<LabelList>({});
  const [serviceList, setServiceList] = useState<ServiceModule.ResponseBody[]>([]);

  useEffect(() => {
    fetchLabelList().then(setLabelList);
    fetchServiceList().then(({ data }) => setServiceList(data));
  }, []);

  const NormalLabelComponent = () => {
    const field = 'custom_normal_labels';

    return (
      <React.Fragment>
        <Form.Item
          label={formatMessage({ id: 'component.global.labels' })}
          name={field}
          tooltip={formatMessage({ id: 'page.route.configuration.normal-labels.tooltip' })}
        >
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder="--"
            disabled={disabled}
            open={false}
            bordered={false}
            tagRender={(props) => {
              const { value, closable, onClose } = props;
              return (
                <Tag closable={closable && !disabled} onClose={onClose} style={{ marginRight: 3 }}>
                  {value}
                </Tag>
              );
            }}
          />
        </Form.Item>
        <Form.Item {...FORM_ITEM_WITHOUT_LABEL}>
          <Button type="dashed" disabled={disabled} onClick={() => setVisible(true)}>
            {formatMessage({ id: 'component.global.manage' })}
          </Button>
        </Form.Item>
        {visible && (
          <Form.Item shouldUpdate noStyle>
            {() => {
              const labels = form.getFieldValue(field) || [];
              return (
                <LabelsDrawer
                  title={formatMessage({ id: 'component.label-manager' })}
                  actionName={field}
                  dataSource={labels}
                  disabled={disabled || false}
                  onChange={onChange}
                  onClose={() => setVisible(false)}
                  filterList={['API_VERSION']}
                  fetchLabelList={fetchLabelList}
                />
              );
            }}
          </Form.Item>
        )}
      </React.Fragment>
    );
  };

  const VersionLabelComponent = () => {
    return (
      <Form.Item
        label={formatMessage({ id: 'component.global.version' })}
        tooltip={formatMessage({ id: 'page.route.configuration.version.tooltip' })}
      >
        <Row>
          <Col span={10}>
            <Form.Item noStyle name="custom_version_label">
              <AutoComplete
                options={(labelList.API_VERSION || []).map((item) => ({ value: item }))}
                disabled={disabled}
                placeholder={formatMessage({ id: 'page.route.configuration.version.placeholder' })}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>
    );
  };

  const Name: React.FC = () => (
    <Form.Item
      label={formatMessage({ id: 'component.global.name' })}
      required
      tooltip={formatMessage({ id: 'page.route.form.itemRulesPatternMessage.apiNameRule' })}
    >
      <Row>
        <Col span={10}>
          <Form.Item
            noStyle
            name="name"
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'page.route.configuration.name.rules.required.description',
                }),
              },
              {
                pattern: new RegExp(/^[a-zA-Z][a-zA-Z0-9_-]{0,100}$/, 'g'),
                message: formatMessage({
                  id: 'page.route.form.itemRulesPatternMessage.apiNameRule',
                }),
              },
            ]}
          >
            <Input
              placeholder={formatMessage({ id: 'page.route.configuration.name.placeholder' })}
              disabled={disabled}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form.Item>
  );

  const Description: React.FC = () => (
    <Form.Item label={formatMessage({ id: 'component.global.description' })}>
      <Row>
        <Col span={10}>
          <Form.Item noStyle name="desc">
            <Input.TextArea
              placeholder={formatMessage({ id: 'component.global.input.placeholder.description' })}
              disabled={disabled}
              showCount
              maxLength={256}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form.Item>
  );

  const Publish: React.FC = () => (
    <Form.Item
      label={formatMessage({ id: 'page.route.publish' })}
      tooltip={formatMessage({ id: 'page.route.configuration.publish.tooltip' })}
    >
      <Row>
        <Col>
          <Form.Item noStyle name="status" valuePropName="checked">
            <Switch disabled={isEdit} />
          </Form.Item>
        </Col>
      </Row>
    </Form.Item>
  );

  const WebSocket: React.FC = () =>
    form.getFieldValue('redirectOption') === 'disabled' ? (
      <Form.Item label="WebSocket">
        <Row>
          <Col>
            <Form.Item noStyle valuePropName="checked" name="enable_websocket">
              <Switch disabled={disabled} />
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>
    ) : null;

  const Redirect: React.FC = () => {
    const list = [
      {
        value: 'forceHttps',
        label: formatMessage({ id: 'page.route.select.option.enableHttps' }),
      },
      {
        value: 'customRedirect',
        label: formatMessage({ id: 'page.route.select.option.configCustom' }),
      },
      {
        value: 'disabled',
        label: formatMessage({ id: 'page.route.select.option.forbidden' }),
      },
    ];

    return (
      <Form.Item
        label={formatMessage({ id: 'page.route.form.itemLabel.redirect' })}
        tooltip={formatMessage({ id: 'page.route.fields.custom.redirectOption.tooltip' })}
      >
        <Row>
          <Col span={5}>
            <Form.Item name="redirectOption" noStyle>
              <Select
                disabled={disabled}
                data-cy="route-redirect"
                onChange={(params) => {
                  onChange({ action: 'redirectOptionChange', data: params });
                }}
              >
                {list.map((item) => (
                  <Select.Option value={item.value} key={item.value}>
                    {item.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>
    );
  };

  const CustomRedirect: React.FC = () => (
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
              style={{ marginBottom: 0 }}
            >
              <Row gutter={10}>
                <Col span={5}>
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
                <Col span={5}>
                  <Form.Item name="ret_code" rules={[{ required: true }]}>
                    <Select disabled={disabled} data-cy="redirect_code">
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
  );

  const ServiceSelector: React.FC = () => (
    <React.Fragment>
      <Form.Item
        label={formatMessage({ id: 'page.route.service' })}
        tooltip={formatMessage({ id: 'page.route.fields.service_id.tooltip' })}
      >
        <Row>
          <Col span={5}>
            <Form.Item noStyle name="service_id">
              <Select disabled={disabled}>
                {/* TODO: value === '' means  no service_id select, need to find a better way */}
                <Select.Option value="" key={Math.random().toString(36).substring(7)}>
                  {formatMessage({ id: 'page.route.service.none' })}
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
          </Col>
        </Row>
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, next) => {
          // route with redirect plugin can be edit without service and upstream
          if (next.redirectOption === 'customRedirect') {
            return false;
          }
          if (next.service_id === '') {
            const upstream_id = upstreamForm?.getFieldValue('upstream_id');
            if (upstream_id === 'None') {
              notification.warning({
                message: formatMessage({ id: 'page.route.fields.service_id.invalid' }),
                description: formatMessage({ id: 'page.route.fields.service_id.without-upstream' }),
              });
            }
          }
          return prev.service_id !== next.service_id;
        }}
      >
        {() => null}
      </Form.Item>
    </React.Fragment>
  );

  return (
    <PanelSection title={formatMessage({ id: 'page.route.panelSection.title.nameDescription' })}>
      <Name />
      <NormalLabelComponent />
      <VersionLabelComponent />

      <Description />

      <Redirect />
      <CustomRedirect />

      <ServiceSelector />

      <WebSocket />
      <Publish />
    </PanelSection>
  );
};

export default MetaView;
