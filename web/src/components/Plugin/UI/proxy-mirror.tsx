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
import { Form, Input } from 'antd';
import { useIntl } from 'umi';

type Props = {
  form: FormInstance;
};

const FORM_ITEM_LAYOUT = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 10
  },
};

const ProxyMirror: React.FC<Props> = ({ form }) => {
  const { formatMessage } = useIntl();

  return (
    <Form
      form={form}
      {...FORM_ITEM_LAYOUT}
    >
      <Form.Item
        label="host"
        name="host"
        extra={formatMessage({ id: 'component.pluginForm.proxy-mirror.host.extra' })}
        tooltip={formatMessage({ id: 'component.pluginForm.proxy-mirror.host.tooltip' })}
        rules={[
          {
            pattern: new RegExp(/^http(s)?:\/\/[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+(:[0-9]{1,5})?$/, 'g'),
            message: formatMessage({ id: 'component.pluginForm.proxy-mirror.host.ruletip' }),
          }
        ]}
      >
        <Input />
      </Form.Item>
    </Form>
  );
}

export default ProxyMirror;
