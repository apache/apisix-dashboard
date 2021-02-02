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
import { useIntl } from 'umi';

import UpstreamForm from '@/components/Upstream';
import { fetchUpstreamList } from '../service';

const FORM_LAYOUT = {
  labelCol: {
    span: 3,
  },
  wrapperCol: {
    span: 8,
  },
};

const Step1: React.FC<ServiceModule.Step1PassProps> = ({
  form,
  upstreamForm,
  upstreamRef,
  disabled,
}) => {
  const { formatMessage } = useIntl();
  const [list, setList] = useState<UpstreamModule.RequestBody[]>([]);
  useEffect(() => {
    fetchUpstreamList().then(({ data }) => setList(data));
  }, []);

  return (
    <>
      <Form {...FORM_LAYOUT} form={form}>
        <Form.Item name="name" label={formatMessage({ id: 'component.global.name' })}>
          <Input disabled={disabled} />
        </Form.Item>
        <Form.Item name="desc" label={formatMessage({ id: 'component.global.description' })}>
          <Input.TextArea disabled={disabled} />
        </Form.Item>
      </Form>
      <UpstreamForm
        ref={upstreamRef}
        required
        form={upstreamForm}
        disabled={disabled}
        list={list}
        showSelector
        key={1}
      />
    </>
  );
};

export default Step1;
