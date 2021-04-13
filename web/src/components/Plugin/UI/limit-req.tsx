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
import { useIntl } from 'umi';

type Props = {
  form: FormInstance;
  ref?: any;
};

export const FORM_ITEM_LAYOUT = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 8
  },
};

const LimitReq: React.FC<Props> = ({ form }) => {
  const { formatMessage } = useIntl();
  return (
    <Form
      form={form}
      {...FORM_ITEM_LAYOUT}
    >
      <Form.Item
        label="rate"
        name="rate"
        rules={[{
          required: true,
          message: `${formatMessage({ id: 'component.global.pleaseEnter' })} rate`
        }]}
        tooltip={formatMessage({ id: 'component.pluginForm.limit-req.rate.tooltip' })}
        validateTrigger={['onChange', 'onBlur', 'onClick']}
      >
        <InputNumber min={1} required />
      </Form.Item>
      <Form.Item
        label="burst"
        name="burst"
        rules={[{
          required: true,
          message: `${formatMessage({ id: 'component.global.pleaseEnter' })} burst`
        }]}
        tooltip={formatMessage({ id: 'component.pluginForm.limit-req.burst.tooltip' })}
        validateTrigger={['onChange', 'onBlur', 'onClick']}
      >
        <InputNumber min={0} required />
      </Form.Item>
      <Form.Item
        label="key"
        name="key"
        rules={[{
          required: true,
          message: `${formatMessage({ id: 'component.global.pleaseChoose' })} key`
        }]}
        tooltip={formatMessage({ id: 'component.pluginForm.limit-req.key.tooltip' })}
        validateTrigger={['onChange', 'onBlur', 'onClick']}
      >
        <Select>
          {["remote_addr", "server_addr", "http_x_real_ip", "http_x_forwarded_for", "consumer_name"].map(item => {
            return <Select.Option value={item} key={item}>{item}</Select.Option>
          })}
        </Select>
      </Form.Item>
      <Form.Item
        label="rejected_code"
        name="rejected_code"
        initialValue={503}
        tooltip={formatMessage({ id: 'component.pluginForm.limit-req.rejected_code.tooltip' })}
      >
        <InputNumber min={200} max={599} />
      </Form.Item>
    </Form>
  );
}

export default LimitReq;
