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
import type { FormInstance } from 'antd/lib/form';
import React from 'react';
import { useIntl } from 'umi';

import UpstreamForm from '@/components/Upstream';

type Props = {
  form: FormInstance;
  disabled?: boolean;
  upstreamRef?: React.MutableRefObject<any>;
  neverReadonly?: boolean;
};

const Step1: React.FC<Props> = ({ form, disabled, upstreamRef, neverReadonly }) => {
  const { formatMessage } = useIntl();

  return (
    <>
      <Form labelCol={{ span: 3 }} form={form}>
        <Form.Item
          label={formatMessage({ id: 'page.upstream.step.name' })}
          name="name"
          rules={[
            {
              required: true,
              message: formatMessage({ id: 'page.upstream.step.input.upstream.name' }),
            },
          ]}
        >
          <Input
            placeholder={formatMessage({ id: 'page.upstream.step.input.upstream.name' })}
            disabled={disabled}
          />
        </Form.Item>
        <Form.Item label={formatMessage({ id: 'page.upstream.step.description' })} name="desc">
          <Input.TextArea
            placeholder={formatMessage({ id: 'page.upstream.step.input.description' })}
            disabled={disabled}
          />
        </Form.Item>
      </Form>
      <UpstreamForm
        ref={upstreamRef}
        form={form}
        disabled={disabled}
        neverReadonly={neverReadonly}
      />
    </>
  );
};

export default Step1;
