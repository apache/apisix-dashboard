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
import { Form, Row, Col, Select, FormInstance, Input } from 'antd'
import { useIntl } from 'umi'

type Props = {
  form: FormInstance;
  readonly?: boolean;
}

const TLSComponent: React.FC<Props> = ({ form, readonly }) => {
  const { formatMessage } = useIntl()

  return (
    <React.Fragment>
      <Form.Item
        label={formatMessage({ id: 'component.upstream.fields.tls' })}
        tooltip={formatMessage({ id: 'component.upstream.fields.tls.tooltip' })}
        style={{ marginBottom: 0 }}
      >
        <Row>
          <Col span={5}>
            <Form.Item
              name={["custom", "tls"]}
              initialValue="disable"
            >
              <Select disabled={readonly}>
                {
                  ["disable", "enable"].map(item => (
                    <Select.Option value={item} key={item}>
                      {formatMessage({ id: `component.global.${item}` })}
                    </Select.Option>
                  ))
                }
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, next) => {
          return prev.custom.tls !== next.custom.tls
        }}
      >
        {
          () => {
            if (form.getFieldValue(["custom", "tls"]) === 'enable') {
              return (
                <React.Fragment>
                  <Form.Item
                    label={formatMessage({ id: 'component.upstream.fields.tls.client_cert' })}
                    name={["tls", "client_cert"]}
                    required
                    rules={[{ required: true, message: "" }, { max: 64 * 1024 }, { min: 128 }]}
                  >
                    <Input.TextArea disabled={readonly} minLength={128} maxLength={64 * 1024} rows={5} placeholder={formatMessage({id: 'component.upstream.fields.tls.client_cert.required'})} />
                  </Form.Item>
                  <Form.Item
                    label={formatMessage({ id: 'component.upstream.fields.tls.client_key' })}
                    name={["tls", "client_key"]}
                    required
                    rules={[{ required: true, message: "" }, { max: 64 * 1024 }, { min: 128 }]}
                  >
                    <Input.TextArea disabled={readonly} minLength={128} maxLength={64 * 1024} rows={5} placeholder={formatMessage({id: 'component.upstream.fields.tls.client_key.required'})} />
                  </Form.Item>
                </React.Fragment>
              )
            }
            return null
          }
        }
      </Form.Item>
    </React.Fragment>
  )
}

export default TLSComponent
