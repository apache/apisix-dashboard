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
import { Form, Input, Select } from 'antd';
import { useIntl } from 'umi';
import PanelSection from '@/components/PanelSection';

import { HTTP_METHOD_OPTION_LIST, PROTOCOL_SUPPORTED } from '../../constants';

const DebugTargetView: React.FC<RouteModule.DebugTargetProps> = (props) => {
  const { formatMessage } = useIntl();
  const methodWithoutBody = ['GET', 'HEAD'];

  return (
    <Form
      name="debug_target"
      form={props.form}
      layout="inline"
      initialValues={{
        method: HTTP_METHOD_OPTION_LIST[0],
        requestTarget: props.requestTargetList[0],
        protocol: PROTOCOL_SUPPORTED[0],
      }}
    >
      <Input.Group>
        <PanelSection
          title={formatMessage({ id: 'page.route.PanelSection.title.chooseRequestAddress' })}
        >
          <Form.Item name="protocol" noStyle>
            <Select size="large" data-cy="debug-protocol" style={{ width: '30%' }} bordered={false}>
              {PROTOCOL_SUPPORTED.map((protocol) => {
                return (
                  <Select.Option key={protocol} value={protocol}>
                    {`${protocol}://`}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item name="requestTarget" noStyle>
            <Select size="large" style={{ width: '70%' }} bordered={false}>
              {props.requestTargetList?.map((requestTarget) => {
                return (
                  <Select.Option key={requestTarget} value={requestTarget}>
                    {requestTarget}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        </PanelSection>
      </Input.Group>
      <Input.Group>
        <PanelSection
          title={formatMessage({ id: 'page.route.PanelSection.title.enterRequestPath' })}
        >
          <Form.Item name="method" noStyle>
            <Select size="large" data-cy="debug-method" style={{ width: '30%' }} bordered={false} onChange={(value: string) => {
              props.setShowBodyTab(!(methodWithoutBody.indexOf(value) > -1));
            }}>
              {HTTP_METHOD_OPTION_LIST.map((method) => {
                return (
                  <Select.Option key={method} value={method} >
                    {method}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item
            name="path"
            noStyle
            rules={[
              {
                required: true,
                whitespace: true,
              },
              {
                pattern: new RegExp(/^\/[a-zA-Z0-9\-._~%!$&'()+,;=:@?/]*?$/, 'g'),
              },
            ]}
          >
            <Input
              data-cy="debug-path"
              size="large"
              placeholder={formatMessage({ id: 'page.route.configuration.path.placeholder' })}
              allowClear
              style={{ width: '70%' }}
              bordered={false}
            />
          </Form.Item>
        </PanelSection>
      </Input.Group>
    </Form>
  );
};

export default DebugTargetView;
