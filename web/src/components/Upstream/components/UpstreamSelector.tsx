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
import { Form, Select } from 'antd';
import { useIntl, useLocation } from 'umi';

type Upstream = {
  name?: string;
  id?: string;
};

type Props = {
  list?: Upstream[];
  disabled?: boolean;
  required?: boolean;
  onChange: (id: string) => void;
};

const UpstreamSelector: React.FC<Props> = ({ onChange, list = [], disabled, required }) => {
  const { formatMessage } = useIntl();
  const location = useLocation();

  return (
    <Form.Item
      label={formatMessage({ id: 'page.upstream.step.select.upstream' })}
      name="upstream_id"
    >
      <Select
        showSearch
        data-cy="upstream_selector"
        disabled={disabled}
        onChange={onChange}
        filterOption={(input, item) => item?.children.toLowerCase().includes(input.toLowerCase())}
      >
        <Select.Option value="None" disabled={required}>
          {formatMessage({ id: 'component.upstream.other.none' })}
        </Select.Option>
        {[
          {
            name: formatMessage({
              id: `page.upstream.step.select.upstream.select.option${
                !required && location.pathname === '/routes/create' ? '.serviceSelected' : ''
              }`,
            }),
            id: 'Custom',
          },
          ...list,
        ].map((item) => (
          <Select.Option value={item.id!} key={item.id}>
            {item.name}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default UpstreamSelector;
