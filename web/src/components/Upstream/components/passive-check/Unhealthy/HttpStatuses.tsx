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
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Form, InputNumber, Row } from 'antd';
import React from 'react';
import { useIntl } from 'umi';

import { removeBtnStyle } from '@/components/Upstream/constant';

type Props = {
  readonly?: boolean;
};

const Component: React.FC<Props> = ({ readonly }) => {
  const { formatMessage } = useIntl();
  return (
    <Form.List
      name={['checks', 'passive', 'unhealthy', 'http_statuses']}
      initialValue={[429, 500, 503]}
    >
      {(fields, { add, remove }) => (
        <>
          <Form.Item
            required
            label={formatMessage({ id: 'page.upstream.step.healthyCheck.passive.http_statuses' })}
            tooltip={formatMessage({
              id: 'page.upstream.checks.passive.unhealthy.http_statuses.description',
            })}
            style={{ marginBottom: 0 }}
          >
            {fields.map((field, index) => (
              <Row style={{ marginBottom: 10 }} key={index}>
                <Col span={2}>
                  <Form.Item style={{ marginBottom: 0 }} name={[field.name]}>
                    <InputNumber disabled={readonly} min={200} max={599} />
                  </Form.Item>
                </Col>
                <Col style={removeBtnStyle}>
                  {!readonly && fields.length > 1 && (
                    <MinusCircleOutlined
                      onClick={() => {
                        remove(field.name);
                      }}
                    />
                  )}
                </Col>
              </Row>
            ))}
          </Form.Item>
          {!readonly && (
            <Form.Item wrapperCol={{ offset: 3 }}>
              <Button type="dashed" onClick={() => add()}>
                <PlusOutlined />
                {formatMessage({
                  id: 'component.global.add',
                })}
              </Button>
            </Form.Item>
          )}
        </>
      )}
    </Form.List>
  );
};

export default Component;
