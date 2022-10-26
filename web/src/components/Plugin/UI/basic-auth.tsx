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
import { Form, Input } from 'antd';
import type { FormInstance } from 'antd/es/form';
import React from 'react';

type Props = {
  form: FormInstance;
  schema: Record<string, any> | undefined;
  ref?: any;
};

export const FORM_ITEM_LAYOUT = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 8,
  },
};

const BasicAuth: React.FC<Props> = ({ form, schema }) => {
  const required: string[] = schema?.required;
  return (
    <Form form={form} {...FORM_ITEM_LAYOUT}>
      <Form.Item
        label="username"
        name="username"
        rules={[{ required: required.indexOf('username') > -1 }]}
        validateTrigger={['onChange', 'onBlur', 'onClick']}
      >
        <Input></Input>
      </Form.Item>
      <Form.Item
        label="password"
        name="password"
        rules={[{ required: required.indexOf('password') > -1 }]}
        validateTrigger={['onChange', 'onBlur', 'onClick']}
      >
        <Input></Input>
      </Form.Item>
    </Form>
  );
};

export default BasicAuth;
