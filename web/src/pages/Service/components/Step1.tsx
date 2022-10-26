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
import { Button, Col, Form, Input, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'umi';

import UpstreamForm from '@/components/Upstream';
import { fetchUpstreamList } from '@/components/Upstream/service';
import { FORM_ITEM_WITHOUT_LABEL } from '@/pages/Route/constants';

const FORM_LAYOUT = {
  labelCol: {
    span: 3,
  },
  wrapperCol: {
    span: 8,
  },
};

const Step1: React.FC<ServiceModule.Step1PassProps> = ({
  form,
  upstreamForm,
  upstreamRef,
  disabled,
}) => {
  const { formatMessage } = useIntl();
  const [list, setList] = useState<UpstreamComponent.ResponseData[]>([]);
  useEffect(() => {
    fetchUpstreamList().then(({ data }) => setList(data));
  }, []);

  return (
    <>
      <Form {...FORM_LAYOUT} form={form}>
        <Form.Item
          name="name"
          label={formatMessage({ id: 'component.global.name' })}
          required
          rules={[
            {
              required: true,
              message: formatMessage({ id: 'page.service.fields.name.required' }),
            },
          ]}
        >
          <Input
            disabled={disabled}
            placeholder={formatMessage({ id: 'page.service.fields.name.required' })}
          />
        </Form.Item>
        <Form.Item name="desc" label={formatMessage({ id: 'component.global.description' })}>
          <Input.TextArea
            disabled={disabled}
            placeholder={formatMessage({ id: 'component.global.description.required' })}
          />
        </Form.Item>
        <Form.List name="hosts" initialValue={[undefined]}>
          {(fields, { add, remove }) => {
            return (
              <div>
                <Form.Item
                  label={formatMessage({ id: 'page.service.fields.hosts' })}
                  tooltip={formatMessage({ id: 'page.route.form.itemExtraMessage.domain' })}
                  style={{ marginBottom: 0 }}
                  wrapperCol={{ span: 24 }}
                >
                  {fields.map((field, index) => (
                    <Row style={{ marginBottom: 10 }} key={index}>
                      <Col span={9}>
                        <Form.Item
                          {...field}
                          validateTrigger={['onChange', 'onBlur']}
                          rules={[
                            {
                              // NOTE: https://github.com/apache/apisix/blob/master/apisix/schema_def.lua#L40
                              pattern: new RegExp(/^\*?[0-9a-zA-Z-._]+$/, 'g'),
                              message: formatMessage({
                                id: 'page.route.form.itemRulesPatternMessage.domain',
                              }),
                            },
                          ]}
                          noStyle
                        >
                          <Input
                            placeholder={formatMessage({
                              id: 'page.service.fields.hosts.placeholder',
                            })}
                            disabled={disabled}
                          />
                        </Form.Item>
                      </Col>
                      <Col style={{ marginLeft: 10, display: 'flex', alignItems: 'center' }}>
                        {!disabled && fields.length > 1 ? (
                          <MinusCircleOutlined
                            className="dynamic-delete-button"
                            onClick={() => {
                              remove(field.name);
                            }}
                          />
                        ) : null}
                      </Col>
                    </Row>
                  ))}
                </Form.Item>
                {!disabled && (
                  <Form.Item {...FORM_ITEM_WITHOUT_LABEL}>
                    <Button
                      data-cy="addHost"
                      onClick={() => {
                        add();
                      }}
                    >
                      <PlusOutlined /> {formatMessage({ id: 'component.global.add' })}
                    </Button>
                  </Form.Item>
                )}
              </div>
            );
          }}
        </Form.List>
      </Form>
      <UpstreamForm
        ref={upstreamRef}
        required={false}
        form={upstreamForm}
        disabled={disabled}
        list={list}
        showSelector
        key={1}
      />
    </>
  );
};

export default Step1;
