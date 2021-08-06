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
import React, { useState } from 'react';
import { AutoComplete, Form, Select } from 'antd';
import { useIntl } from 'umi';
import type { FormInstance } from 'antd/es/form';

import { HashOnEnum, CommonHashKeyEnum, AlgorithmEnum } from '../constant';

type Props = {
  readonly?: boolean;
  form: FormInstance;
};

const CHash: React.FC<Pick<Props, 'readonly'>> = ({ readonly }) => {
  const { formatMessage } = useIntl();
  const [keySearchWord, setKeySearchWord] = useState('');

  const handleSearch = (search: string) => {
    setKeySearchWord(search);
  };
  return (
    <React.Fragment>
      <Form.Item
        name="hash_on"
        rules={[{ required: true }]}
        label={formatMessage({ id: 'component.upstream.fields.hash_on' })}
        tooltip={formatMessage({ id: 'component.upstream.fields.hash_on.tooltip' })}
        initialValue="vars"
      >
        <Select disabled={readonly}>
          {Object.entries(HashOnEnum).map(([label, value]) => (
            <Select.Option value={value} key={value}>
              {label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="key"
        rules={[{ required: true }]}
        label={formatMessage({ id: 'component.upstream.fields.key' })}
        tooltip={formatMessage({ id: 'component.upstream.fields.key.tooltip' })}
        initialValue="remote_addr"
      >
        <AutoComplete disabled={readonly} onSearch={handleSearch}>
          {Object.entries(CommonHashKeyEnum)
            .filter(
              ([label, value]) =>
                label.startsWith(keySearchWord) || value.startsWith(keySearchWord),
            )
            .map(([label, value]) => (
              <Select.Option value={value} key={value}>
                {label}
              </Select.Option>
            ))}
        </AutoComplete>
      </Form.Item>
    </React.Fragment>
  );
};

const Component: React.FC<Props> = ({ readonly, form }) => {
  const { formatMessage } = useIntl();

  return (
    <React.Fragment>
      <Form.Item
        label={formatMessage({ id: 'page.upstream.step.type' })}
        name="type"
        rules={[{ required: true }]}
        initialValue="roundrobin"
      >
        <Select disabled={readonly}>
          {Object.entries(AlgorithmEnum).map(([label, value]) => {
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
  );
};

export default Component;
