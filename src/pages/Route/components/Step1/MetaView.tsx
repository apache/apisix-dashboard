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
import { Input, Select, Switch } from 'antd';
import { useIntl } from 'umi';
import { PanelSection } from '@api7-dashboard/ui';

import { fetchRouteGroupList } from '@/pages/Route/service';

interface Props extends RouteModule.Data {}

const MetaView: React.FC<Props> = ({ data, disabled, onChange, isEdit }) => {
  const { step1Data } = data;
  const { formatMessage } = useIntl();
  const routeGroupDisabled = disabled || !!step1Data.route_group_id;
  const [routeGroups, setRouteGroups] = useState<{ id: string; name: string }[]>();
  useEffect(() => {
    // eslint-disable-next-line no-shadow
    fetchRouteGroupList().then(({ data }) => {
      setRouteGroups([
        { name: formatMessage({ id: 'route.meta.api.create.group.name' }), id: null },
        ...data,
      ]);
      if (step1Data.route_group_id) {
        onChange({ route_group_id: step1Data.route_group_id });
      }
    });
  }, []);
  return (
    <PanelSection title={formatMessage({ id: 'route.meta.name.description' })}>
      <Form.Item
        label={formatMessage({ id: 'route.meta.api.name' })}
        name="name"
        rules={[
          { required: true, message: formatMessage({ id: 'route.meta.input.api.name' }) },
          {
            pattern: new RegExp(/^[a-zA-Z][a-zA-Z0-9_-]{0,100}$/, 'g'),
            message: formatMessage({ id: 'route.meta.api.name.rule' }),
          },
        ]}
        extra={formatMessage({ id: 'rotue.meta.api.rule' })}
      >
        <Input
          placeholder={formatMessage({ id: 'route.meta.input.api.name' })}
          disabled={disabled}
        />
      </Form.Item>
      <Form.Item label={formatMessage({ id: 'route.meta.api.group.name' })} name="route_group_id">
        <Select
          onChange={(value) => {
            if (step1Data.route_group_id) {
              onChange({ route_group_id: value });
            }
          }}
          disabled={disabled}
        >
          {(routeGroups || []).map((item) => {
            return (
              <Select.Option value={item.id} key={item.id}>
                {item.name}
              </Select.Option>
            );
          })}
        </Select>
      </Form.Item>
      <Form.Item
        label={formatMessage({ id: 'route.meta.group.name' })}
        name="route_group_name"
        rules={[
          { required: true, message: formatMessage({ id: 'route.meta.input.api.group.name' }) },
        ]}
      >
        <Input
          placeholder={formatMessage({ id: 'route.meta.input.api.group.name' })}
          disabled={routeGroupDisabled}
        />
      </Form.Item>
      {!isEdit && (
        <Form.Item
          label={formatMessage({ id: 'route.list.publish' })}
          name="status"
          valuePropName="checked"
          help={formatMessage({ id: 'page.route.form.itemHelp.status' })}
        >
          <Switch disabled={disabled} />
        </Form.Item>
      )}
      <Form.Item label={formatMessage({ id: 'route.meta.description' })} name="desc">
        <Input.TextArea
          placeholder={formatMessage({ id: 'route.meta.description.rule' })}
          disabled={disabled}
        />
      </Form.Item>
    </PanelSection>
  );
};

export default MetaView;
