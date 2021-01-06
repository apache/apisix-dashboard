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
import { Input, Switch, Select, Button, Tag, AutoComplete } from 'antd';
import { useIntl } from 'umi';
import { PanelSection } from '@api7-dashboard/ui';

import { FORM_ITEM_WITHOUT_LABEL } from '@/pages/Route/constants';
import LabelsDrawer from './LabelsDrawer';
import { fetchLabelList } from '../../service';

const MetaView: React.FC<RouteModule.Step1PassProps> = ({ disabled, form, isEdit, onChange }) => {
  const { formatMessage } = useIntl();
  const [visible, setVisible] = useState(false);
  const [labelList, setLabelList] = useState<RouteModule.LabelList>({});

  useEffect(() => {
    // TODO: use a better state name
    fetchLabelList().then(setLabelList);
  }, []);

  const NormalLabelComponent = () => {
    const field = 'custom_normal_labels';
    const title = 'Label Manager';

    return (
      <React.Fragment>
        <Form.Item label={formatMessage({ id: 'component.global.labels' })} name={field}>
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
                  title={title}
                  actionName={field}
                  dataSource={labels}
                  disabled={disabled || false}
                  onChange={onChange}
                  onClose={() => setVisible(false)}
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
      <React.Fragment>
        <Form.Item
          label={formatMessage({ id: 'component.global.version' })}
          name="custom_version_label"
        >
          <AutoComplete
            options={(labelList.API_VERSION || []).map((item) => ({ value: item }))}
            disabled={disabled}
          />
        </Form.Item>
      </React.Fragment>
    );
  };

  return (
    <PanelSection title={formatMessage({ id: 'page.route.panelSection.title.nameDescription' })}>
      <Form.Item
        label={formatMessage({ id: 'component.global.name' })}
        name="name"
        rules={[
          {
            required: true,
            message: `${formatMessage({ id: 'component.global.pleaseEnter' })} ${formatMessage({
              id: 'page.route.form.itemLabel.apiName',
            })}`,
          },
          {
            pattern: new RegExp(/^[a-zA-Z][a-zA-Z0-9_-]{0,100}$/, 'g'),
            message: formatMessage({ id: 'page.route.form.itemRulesPatternMessage.apiNameRule' }),
          },
        ]}
        extra={formatMessage({ id: 'page.route.form.itemRulesPatternMessage.apiNameRule' })}
      >
        <Input
          placeholder={`${formatMessage({ id: 'component.global.pleaseEnter' })} ${formatMessage({
            id: 'page.route.form.itemLabel.apiName',
          })}`}
          disabled={disabled}
        />
      </Form.Item>

      <NormalLabelComponent />
      <VersionLabelComponent />

      <Form.Item label={formatMessage({ id: 'component.global.description' })} name="desc">
        <Input.TextArea
          placeholder={formatMessage({ id: 'component.global.input.placeholder.description' })}
          disabled={disabled}
        />
      </Form.Item>

      <Form.Item
        label={formatMessage({ id: 'page.route.publish' })}
        name="status"
        valuePropName="checked"
      >
        <Switch disabled={isEdit} />
      </Form.Item>
    </PanelSection>
  );
};

export default MetaView;
