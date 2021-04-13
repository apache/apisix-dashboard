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
import { Form, Select } from 'antd'
import { useIntl } from 'umi'
import type { FormInstance } from 'antd/es/form'

enum Type {
  roundrobin = 'roundrobin',
  chash = 'chash',
  ewma = 'ewma',
  // TODO: new type
  // least_conn = 'least_conn'
}

enum HashOn {
  vars = 'vars',
  header = 'header',
  cookie = 'cookie',
  consumer = 'consumer',
  // TODO: new hash_on key
  // vars_combinations = 'vars_combinations'
}

enum HashKey {
  remote_addr = 'remote_addr',
  host = 'host',
  uri = 'uri',
  server_name = 'server_name',
  server_addr = 'server_addr',
  request_uri = 'request_uri',
  query_string = 'query_string',
  remote_port = 'remote_port',
  hostname = 'hostname',
  arg_id = 'arg_id',
}

type Props = {
  readonly?: boolean
  form: FormInstance
}

const CHash: React.FC<Pick<Props, 'readonly'>> = ({ readonly }) => (
  <>
    <Form.Item label="Hash On" name="hash_on" rules={[{ required: true }]}>
      <Select disabled={readonly}>
        {Object.entries(HashOn).map(([label, value]) => (
          <Select.Option value={value} key={value}>
            {label}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
    <Form.Item label="Key" name="key" rules={[{ required: true }]}>
      <Select disabled={readonly}>
        {Object.entries(HashKey).map(([label, value]) => (
          <Select.Option value={value} key={value}>
            {label}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  </>
);

const Component: React.FC<Props> = ({ readonly, form }) => {
  const { formatMessage } = useIntl()

  return (
    <React.Fragment>
      <Form.Item
        label={formatMessage({ id: 'page.upstream.step.type' })}
        name="type"
        rules={[{ required: true }]}
      >
        <Select disabled={readonly}>
          {Object.entries(Type).map(([label, value]) => {
            return (
              <Select.Option value={value} key={value}>
                {formatMessage({ id: `page.upstream.type.${label}` })}
              </Select.Option>
            );
          })}
        </Select>
      </Form.Item>
      <Form.Item shouldUpdate noStyle>
        {() => {
          if (form.getFieldValue('type') === 'chash') {
            return <CHash readonly={readonly} />;
          }
          return null;
        }}
      </Form.Item>
    </React.Fragment>
  )
}

export default Component
