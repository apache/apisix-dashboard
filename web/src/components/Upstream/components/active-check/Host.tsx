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
import React from 'react'
import { Form, Input } from 'antd'
import { useIntl } from 'umi'

type Props = {
  readonly?: boolean
}

const Component: React.FC<Props> = ({ readonly }) => {
  const { formatMessage } = useIntl()
  return (
    <Form.Item
      label={formatMessage({ id: 'page.upstream.step.healthyCheck.activeHost' })}
      required
      tooltip={formatMessage({ id: 'page.upstream.checks.active.host.description' })}
    >
      <Form.Item
        style={{ marginBottom: 0 }}
        name={['checks', 'active', 'host']}
        rules={[
          {
            required: true,
            message: formatMessage({ id: 'page.upstream.step.input.healthyCheck.activeHost' }),
          },
          {
            pattern: new RegExp(
              /(^([1-9]?\d|1\d{2}|2[0-4]\d|25[0-5])(\.(25[0-5]|1\d{2}|2[0-4]\d|[1-9]?\d)){3}$|^(?![0-9.]+$)([a-zA-Z0-9_-]+)(\.[a-zA-Z0-9_-]+){0,}$)/,
              'g',
            ),
            message: formatMessage({ id: 'page.upstream.step.domain.name.or.ip.rule' }),
          },
        ]}
      >
        <Input
          placeholder={formatMessage({
            id: 'page.upstream.step.input.healthyCheck.activeHost',
          })}
          disabled={readonly}
        />
      </Form.Item>
    </Form.Item>
  )
}

export default Component
