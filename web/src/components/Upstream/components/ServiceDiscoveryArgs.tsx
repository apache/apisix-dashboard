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
import { Form, Input } from 'antd';
import React from 'react';
import { useIntl } from 'umi';

type Props = {
  args: string[];
  readonly?: boolean;
};

const ServiceDiscoveryArgs: React.FC<Props> = ({ readonly, args }) => {
  const { formatMessage } = useIntl();

  return (
    <React.Fragment>
      {args.map((item) => {
        return (
          <Form.Item
            key={item}
            name={['discovery_args', item]}
            label={formatMessage({ id: `component.upstream.fields.discovery_args.${item}` })}
            tooltip={formatMessage({
              id: `component.upstream.fields.discovery_args.${item}.tooltip`,
            })}
          >
            <Input
              disabled={readonly}
              placeholder={formatMessage({
                id: `component.upstream.fields.discovery_args.${item}.placeholder`,
              })}
            />
          </Form.Item>
        );
      })}
    </React.Fragment>
  );
};

export default ServiceDiscoveryArgs;
