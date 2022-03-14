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
import { Form, Input } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import { useIntl } from 'umi';

const FORM_LAYOUT = {
  labelCol: {
    span: 2,
  },
  wrapperCol: {
    span: 8,
  },
};

type Props = {
  form: FormInstance;
  disabled?: boolean;
};

const Step1: React.FC<Props> = ({ form, disabled }) => {
  const { formatMessage } = useIntl();
  return (
    <Form {...FORM_LAYOUT} form={form}>
      <Form.Item
        label={formatMessage({ id: 'page.consumer.username' })}
        name="username"
        help={formatMessage({ id: 'component.global.form.itemExtraMessage.nameGloballyUnique' })}
        rules={[
          { required: true },
          {
            pattern: new RegExp(/^[a-zA-Z0-9_]+$/, 'g'),
            message: formatMessage({ id: 'page.consumer.form.itemRuleMessage.username' }),
          },
        ]}
      >
        <Input
          placeholder={formatMessage({ id: 'page.consumer.username.required' })}
          disabled={disabled || window.location.pathname.indexOf('edit') !== -1}
        />
      </Form.Item>
      <Form.Item label={formatMessage({ id: 'component.global.description' })} name="desc">
        <Input.TextArea
          placeholder={formatMessage({ id: 'component.global.description.required' })}
          disabled={disabled}
        />
      </Form.Item>
    </Form>
  );
};

export default Step1;
