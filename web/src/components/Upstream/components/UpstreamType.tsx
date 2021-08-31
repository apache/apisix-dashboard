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
import { useIntl } from 'umi';
import type { FormInstance } from 'antd/lib/form';
import Nodes from '@/components/Upstream/components/Nodes';
import ServiceDiscovery from '@/components/Upstream/components/ServiceDiscovery';

type Props = {
  form: FormInstance;
  readonly?: boolean;
};

const UpstreamType: React.FC<Props> = ({ readonly, form }) => {
  const { formatMessage } = useIntl();

  return (
    <React.Fragment>
      <Form.Item
        label={formatMessage({ id: 'component.upstream.fields.upstream_type' })}
        name="upstream_type"
        rules={[{ required: true }]}
        initialValue="node"
      >
        <Select disabled={readonly}>
          <Select.Option value="node">
            {formatMessage({ id: 'component.upstream.fields.upstream_type.node' })}
          </Select.Option>
          <Select.Option value="service_discovery">
            {formatMessage({ id: 'component.upstream.fields.upstream_type.service_discovery' })}
          </Select.Option>
        </Select>
      </Form.Item>

      <Form.Item shouldUpdate noStyle>
        {() => {
          if (form.getFieldValue('upstream_type') === 'node') {
            return <Nodes readonly={readonly} />;
          }
          return <ServiceDiscovery form={form} readonly={readonly} />;
        }}
      </Form.Item>
    </React.Fragment>
  );
};

export default UpstreamType;
