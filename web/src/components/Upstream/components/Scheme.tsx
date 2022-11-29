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
import { Form, Select } from 'antd';
import React, { useState } from 'react';
import { useIntl } from 'umi';

const options = [
  {
    label: 'HTTP',
    value: 'http',
    type: 'http',
  },
  {
    label: 'HTTPs',
    value: 'https',
    type: 'http',
  },
  {
    label: 'gRPC',
    value: 'grpc',
    type: 'http',
  },
  {
    label: 'gRPCs',
    value: 'grpcs',
    type: 'http',
  },
  {
    label: 'TCP',
    value: 'tcp',
    type: 'stream',
  },
  {
    label: 'TLS',
    value: 'tls',
    type: 'stream',
  },
  {
    label: 'UDP',
    value: 'udp',
    type: 'stream',
  },
  {
    label: 'Kafka',
    value: 'kafka',
    type: 'pubsub',
  },
];

type Props = {
  readonly?: boolean;
};

const Scheme: React.FC<Props> = ({ readonly }) => {
  const { formatMessage } = useIntl();
  const [extraMessage, setExtraMessage] = useState('');
  const onChange = (value: string) => {
    Object.values(options).forEach((opt) => {
      if (opt.value !== value && opt.type !== 'http') return;
      setExtraMessage(
        formatMessage({ id: `component.upstream.fields.scheme.tooltip.${opt.type}` }),
      );
    });
  };

  return (
    <Form.Item
      label={formatMessage({ id: 'page.upstream.scheme' })}
      name="scheme"
      rules={[{ required: true }]}
      initialValue="http"
      extra={extraMessage}
    >
      <Select disabled={readonly} onChange={onChange}>
        {options.map((item) => {
          return (
            <Select.Option value={item.value} key={item.value}>
              {item.label}
            </Select.Option>
          );
        })}
      </Select>
    </Form.Item>
  );
};

export default Scheme;
