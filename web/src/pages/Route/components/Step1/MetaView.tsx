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
import { Input, Switch, Select, Button, Tag, AutoComplete, Row, Col } from 'antd';
import { useIntl } from 'umi';
import { PanelSection } from '@api7-dashboard/ui';

import { FORM_ITEM_WITHOUT_LABEL } from '@/pages/Route/constants';
import LabelsDrawer from '@/components/LabelsfDrawer';
import { fetchLabelList } from '../../service';

const MetaView: React.FC<RouteModule.Step1PassProps> = ({ disabled, form, isEdit, onChange }) => {
  const { formatMessage } = useIntl();
  const [visible, setVisible] = useState(false);
  const [labelList, setLabelList] = useState<LabelList>({});

  useEffect(() => {
    fetchLabelList().then(setLabelList);
  }, []);

  const NormalLabelComponent = () => {
    const field = 'custom_normal_labels';

    return (
      <React.Fragment>
        <Form.Item label={formatMessage({ id: 'component.global.labels' })} name={field} tooltip="为路由增加自定义标签，可用于路由分组。">
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
                  title={formatMessage({ id: "component.label-manager" })}
                  actionName={field}
                  dataSource={labels}
                  disabled={disabled || false}
                  onChange={onChange}
                  onClose={() => setVisible(false)}
                  filterList={["API_VERSION"]}
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
        label={formatMessage({ id: 'component.global.version' })} tooltip="路由的版本号，如 V1">
        <Row>
          <Col span={10}>
            <Form.Item
              noStyle
              name="custom_version_label"
            >
              <AutoComplete
                options={(labelList.API_VERSION || []).map((item) => ({ value: item }))}
                disabled={disabled}
                placeholder="请输入路由版本号"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>
    );
  };

  const Name: React.FC = () => (
    <Form.Item label={formatMessage({ id: 'component.global.name' })} tooltip={formatMessage({ id: 'page.route.form.itemRulesPatternMessage.apiNameRule' })}>
      <Row>
        <Col span={10}>
          <Form.Item
            noStyle
            name="name"
            rules={[
              {
                required: true,
                message: "请输入路由名称",
              },
              {
                pattern: new RegExp(/^[a-zA-Z][a-zA-Z0-9_-]{0,100}$/, 'g'),
                message: formatMessage({ id: 'page.route.form.itemRulesPatternMessage.apiNameRule' }),
              },
            ]}
          >
            <Input
              placeholder="请输入路由名称"
              disabled={disabled}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form.Item>
  )

  const Description: React.FC = () => (
    <Form.Item label={formatMessage({ id: 'component.global.description' })} tooltip="路由的描述信息">
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
  )

  const Publish: React.FC = () => (
    <Form.Item label={formatMessage({ id: 'page.route.publish' })} tooltip="用于控制路由创建后，是否立即发布到网关">
      <Row>
        <Col>
          <Form.Item
            noStyle
            name="status"
            valuePropName="checked"
          >
            <Switch disabled={isEdit} />
          </Form.Item>
        </Col>
      </Row>
    </Form.Item>
  )

  return (
    <PanelSection title={formatMessage({ id: 'page.route.panelSection.title.nameDescription' })}>
      <Name />

      <NormalLabelComponent />
      <VersionLabelComponent />

      <Description />
      <Publish />

    </PanelSection>
  );
};

export default MetaView;
