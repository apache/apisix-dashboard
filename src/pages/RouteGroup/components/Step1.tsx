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
import { FormInstance } from 'antd/lib/form';
import { useIntl } from 'umi';

import { FORM_ITEM_LAYOUT } from '@/pages/Upstream/constants';

type Props = {
  form: FormInstance;
  disabled?: boolean;
};

const initialValues = {
  name: '',
  description: '',
};

const Step1: React.FC<Props> = ({ form, disabled }) => {
  const { formatMessage } = useIntl();
  return (
    <Form {...FORM_ITEM_LAYOUT} form={form} initialValues={initialValues}>
      <Form.Item
        label={formatMessage({ id: 'routegroup.step.name' })}
        name="name"
        rules={[{ required: true }]}
        extra={formatMessage({ id: 'routegroup.step.name.should.unique' })}
      >
        <Input
          placeholder={formatMessage({ id: 'routegroup.step.input.routegroup.name' })}
          disabled={disabled}
        />
      </Form.Item>
      <Form.Item label={formatMessage({ id: 'routegroup.step.description' })} name="description">
        <Input.TextArea
          placeholder={formatMessage({ id: 'routegroup.step.input.description' })}
          disabled={disabled}
        />
      </Form.Item>
    </Form>
  );
};

export default Step1;
