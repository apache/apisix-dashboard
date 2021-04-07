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
import React, { forwardRef, useImperativeHandle } from 'react';
import type { FormInstance } from 'antd/es/form';
import { Form, InputNumber, Select } from 'antd';

type Props = {
  form: FormInstance;
  ref?: any;
};

const LimitConn: React.FC<Props> = forwardRef(
  ({ form }, ref) => {
    useImperativeHandle(ref, () => ({
      getData: () => form.getFieldsValue(),
    }));
    return (
      <Form
        form={form}
        labelCol={{ span: 5 }}
      >
        <Form.Item
          label="conn"
          required
          name="conn"
        >
          <InputNumber min={0} required></InputNumber>
        </Form.Item>
        <Form.Item
          label="burst"
          required
          name="burst"
        >
          <InputNumber min={0} required></InputNumber>
        </Form.Item>
        <Form.Item
          label="default_conn_delay"
          required
          name="default_conn_delay"
        >
          <InputNumber min={0} required></InputNumber>
        </Form.Item>

        <Form.Item
          label="key"
          required
          name="key"
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
        >
          <InputNumber min={200} max={509} required></InputNumber>
        </Form.Item>
      </Form>
    );
  },
);

export default LimitConn;
