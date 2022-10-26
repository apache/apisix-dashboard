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
import { Form, InputNumber } from 'antd';
import React from 'react';
import { useIntl } from 'umi';

import TimeUnit from '../../TimeUnit';

type Props = {
  readonly?: boolean;
};

const Component: React.FC<Props> = ({ readonly }) => {
  const { formatMessage } = useIntl();
  return (
    <Form.Item
      label={formatMessage({ id: 'component.upstream.fields.checks.active.healthy.interval' })}
      required
      tooltip={formatMessage({
        id: 'component.upstream.fields.checks.active.healthy.interval.tooltip',
      })}
    >
      <Form.Item
        noStyle
        style={{ marginBottom: 0 }}
        name={['checks', 'active', 'healthy', 'interval']}
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'page.upstream.step.input.healthyCheck.activeInterval',
            }),
          },
        ]}
        initialValue={1}
      >
        <InputNumber disabled={readonly} min={1} />
      </Form.Item>
      <TimeUnit />
    </Form.Item>
  );
};

export default Component;
