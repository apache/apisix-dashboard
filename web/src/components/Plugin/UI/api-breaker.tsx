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
import React, { forwardRef } from 'react';
import type { FormInstance } from 'antd/es/form';
import { Form, InputNumber } from 'antd';

type Props = {
  form: FormInstance;
};

const ApiBreaker: React.FC<Props> = forwardRef(
  ({ form }) => {
    return (
      <Form
        form={form}
        labelCol={{ span: 6 }}
      >
        <Form.Item
          label="break_response_code"
          required
          name="break_response_code"
        >
          <InputNumber min={200} max={599} required></InputNumber>
        </Form.Item>
        <Form.Item
          label="max_breaker_sec"
          name="max_breaker_sec"
          initialValue={300}
        >
          <InputNumber min={60}></InputNumber>
        </Form.Item>
        <Form.Item
          label="unhealthy.http_statuses"
          name="unhealthy.http_statuses"
          initialValue={500}
        >
          <InputNumber min={500} max={599}></InputNumber>
        </Form.Item>
        <Form.Item
          label="unhealthy.failures"
          name="unhealthy.failures"
          initialValue={3}
        >
          <InputNumber min={1}></InputNumber>
        </Form.Item>
        <Form.Item
          label="healthy.http_statuses"
          name="healthy.http_statuses"
          initialValue={200}
        >
          <InputNumber min={200} max={499}></InputNumber>
        </Form.Item>
        <Form.Item
          label="healthy.successes"
          name="healthy.successes"
          initialValue={3}
        >
          <InputNumber min={1}></InputNumber>
        </Form.Item>
      </Form>
    );
  },
);

export default ApiBreaker;
