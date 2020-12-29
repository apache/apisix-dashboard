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
import React, { useEffect, useState } from 'react';
import { Form, Input } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { useIntl } from 'umi';

import UpstreamForm, { DEFAULT_UPSTREAM } from '@/components/Upstream';
import { fetchList } from '../service';

type Props = {
  form: FormInstance;
  disabled?: boolean;
  upstreamRef?: React.MutableRefObject<any>;
};

const Step1: React.FC<Props> = ({ form, disabled, upstreamRef }) => {
  const { formatMessage } = useIntl();
  const [list, setList] = useState<UpstreamModule.RequestBody[]>([]);

  useEffect(() => {
    fetchList({}).then(({ data }) => setList(data));
  }, []);

  return (
    <>
      <Form labelCol={{ span: 3 }} form={form} initialValues={DEFAULT_UPSTREAM}>
        <Form.Item
          label={formatMessage({ id: 'page.upstream.step.name' })}
          name="name"
          rules={[{ required: true }]}
          extra={formatMessage({ id: 'page.upstream.step.name.should.unique' })}
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
      <UpstreamForm ref={upstreamRef} form={form} disabled={disabled} list={list} />
    </>
  );
};

export default Step1;
