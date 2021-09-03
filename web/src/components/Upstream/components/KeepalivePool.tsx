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
import { Row, Col, Form, InputNumber } from 'antd';
import { useIntl } from 'umi';

type Props = {
  readonly?: boolean;
};

const KeepalivePool: React.FC<Props> = ({ readonly }) => {
  const { formatMessage } = useIntl();

  return (
    <React.Fragment>
      <Form.Item
        label={formatMessage({ id: 'component.upstream.fields.keepalive_pool' })}
        tooltip={formatMessage({ id: 'component.upstream.fields.keepalive_pool.tooltip' })}
      >
        <Row style={{ marginBottom: 10 }} gutter={10}>
          <Col span={5}>
            <Form.Item
              name={['keepalive_pool', 'size']}
              label={formatMessage({ id: 'component.upstream.fields.keepalive_pool.size' })}
              style={{ marginBottom: 0 }}
              initialValue={320}
            >
              <InputNumber
                min={1}
                placeholder={formatMessage({
                  id: 'component.upstream.fields.keepalive_pool.size.placeholder',
                })}
                disabled={readonly}
              />
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item
              name={['keepalive_pool', 'idle_timeout']}
              label={formatMessage({ id: 'component.upstream.fields.keepalive_pool.idle_timeout' })}
              style={{ marginBottom: 0 }}
              initialValue={60}
            >
              <InputNumber
                min={0}
                placeholder={formatMessage({
                  id: 'component.upstream.fields.keepalive_pool.idle_timeout.placeholder',
                })}
                disabled={readonly}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name={['keepalive_pool', 'requests']}
              label={formatMessage({ id: 'component.upstream.fields.keepalive_pool.requests' })}
              style={{ marginBottom: 0 }}
              initialValue={1000}
            >
              <InputNumber
                min={1}
                placeholder={formatMessage({
                  id: 'component.upstream.fields.keepalive_pool.requests.placeholder',
                })}
                disabled={readonly}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>
    </React.Fragment>
  );
};

export default KeepalivePool;
