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
import type { FormInstance } from 'antd/es/form';
import { Form, InputNumber, Select } from 'antd';

type Props = {
  form: FormInstance;
  ref?: any;
};

const FORM_ITEM_LAYOUT = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 8
  },
};

const LimitConn: React.FC<Props> = ({ form }) => {
  return (
    <Form
      form={form}
      {...FORM_ITEM_LAYOUT}
    >
      <Form.Item
        label="conn"
        required
        name="conn"
        tooltip='the maximum number of concurrent requests allowed. Requests exceeding this ratio (and below conn + burst) will get delayed(the latency seconds is configured by default_conn_delay) to conform to this threshold.'
      >
        <InputNumber min={1} required></InputNumber>
      </Form.Item>
      <Form.Item
        label="burst"
        required
        name="burst"
        tooltip='the number of excessive concurrent requests (or connections) allowed to be delayed.'
      >
        <InputNumber min={0} required></InputNumber>
      </Form.Item>
      <Form.Item
        label="default_conn_delay"
        required
        name="default_conn_delay"
        tooltip='the latency seconds of request when concurrent requests exceeding conn but below (conn + burst).'
      >
        <InputNumber step={0.001} min={0.001} required></InputNumber>
      </Form.Item>

      <Form.Item
        label="key"
        required
        name="key"
        tooltip="to limit the concurrency level.
        For example, one can use the host name (or server zone) as the key so that we limit concurrency per host name. Otherwise, we can also use the client address as the key so that we can avoid a single client from flooding our service with too many parallel connections or requests.
        Now accept those as key: 'remote_addr'(client's IP), 'server_addr'(server's IP), 'X-Forwarded-For/X-Real-IP' in request header, 'consumer_name'(consumer's username)."
      >
        <Select>
          {["remote_addr", "server_addr", "http_x_real_ip", "http_x_forwarded_for", "consumer_name"].map(item => {
            return <Select.Option value={item}>{item}</Select.Option>
          })}
        </Select>
      </Form.Item>

      <Form.Item
        label="rejected_code"
        name="rejected_code"
        initialValue={503}
        tooltip='returned when the request exceeds conn + burst will be rejected.'
      >
        <InputNumber min={200} max={599} required></InputNumber>
      </Form.Item>
    </Form>
  );
}

export default LimitConn;
