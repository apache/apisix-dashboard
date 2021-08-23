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
import { Form, Input } from 'antd';
import { useIntl } from 'umi';

type Props = {
  readonly?: boolean;
};

const ServiceDiscoveryArgs: React.FC<Props> = ({ readonly }) => {
  const { formatMessage } = useIntl();

  return (
    <React.Fragment>
      <Form.Item
        name={['discovery_args', 'group_name']}
        label={formatMessage({ id: 'component.upstream.fields.discovery_args.group_name' })}
        tooltip={formatMessage({
          id: 'component.upstream.fields.discovery_args.group_name.tooltip',
        })}
      >
        <Input
          disabled={readonly}
          placeholder={formatMessage({
            id: 'component.upstream.fields.discovery_args.group_name.placeholder',
          })}
        />
      </Form.Item>
      <Form.Item
        name={['discovery_args', 'namespace_id']}
        label={formatMessage({ id: 'component.upstream.fields.discovery_args.namespace_id' })}
        tooltip={formatMessage({
          id: 'component.upstream.fields.discovery_args.namespace_id.tooltip',
        })}
      >
        <Input
          disabled={readonly}
          placeholder={formatMessage({
            id: 'component.upstream.fields.discovery_args.namespace_id.placeholder',
          })}
        />
      </Form.Item>
    </React.Fragment>
  );
};

export default ServiceDiscoveryArgs;
