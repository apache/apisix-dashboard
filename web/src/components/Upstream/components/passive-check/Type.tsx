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
import { Col, Form, Row, Select } from 'antd';
import React from 'react';
import { useIntl } from 'umi';

type Props = {
  readonly?: boolean;
};

const options = [
  {
    label: 'HTTP',
    value: 'http',
  },
  {
    label: 'HTTPs',
    value: 'https',
  },
  {
    label: 'TCP',
    value: 'tcp',
  },
];

const PassiveCheckTypeComponent: React.FC<Props> = ({ readonly }) => {
  const { formatMessage } = useIntl();

  return (
    <Form.Item
      label={formatMessage({ id: 'component.upstream.fields.checks.active.type' })}
      style={{ marginBottom: 0 }}
      tooltip={formatMessage({ id: 'component.upstream.fields.checks.active.type.tooltip' })}
    >
      <Row>
        <Col span={5}>
          <Form.Item name={['checks', 'passive', 'type']} initialValue="http">
            <Select disabled={readonly}>
              {options.map((item) => {
                return (
                  <Select.Option value={item.value} key={item.value}>
                    {item.label}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </Form.Item>
  );
};

export default PassiveCheckTypeComponent;
