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
import { Form, InputNumber } from 'antd';
import { useIntl } from 'umi';

type Props = {
  readonly?: boolean;
};

const ConcurrencyComponent: React.FC<Props> = ({ readonly }) => {
  const { formatMessage } = useIntl();

  return (
    <Form.Item
      label={formatMessage({ id: 'component.upstream.fields.checks.active.concurrency' })}
      tooltip={formatMessage({ id: 'component.upstream.fields.checks.active.concurrency.tooltip' })}
    >
      <Form.Item name={['checks', 'active', 'concurrency']} noStyle initialValue={10}>
        <InputNumber disabled={readonly} min={0} />
      </Form.Item>
    </Form.Item>
  );
};

export default ConcurrencyComponent;
