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
import { Form, Input, Row, Col, Checkbox, Select, Upload, Button } from 'antd';
import { useIntl } from 'umi';
import { MinusCircleOutlined, ImportOutlined } from '@ant-design/icons';
import { DebugBodyFormDataValueType } from '../../constants';

import styles from './index.less';

const DebugFormDataView: React.FC<RouteModule.DebugViewProps> = (props) => {
  const { formatMessage } = useIntl();
  const typeOptions = [
    { label: DebugBodyFormDataValueType.Text, value: DebugBodyFormDataValueType.Text },
    { label: DebugBodyFormDataValueType.File, value: DebugBodyFormDataValueType.File },
  ];
  const [typeList, setTypeList] = useState({ 0: DebugBodyFormDataValueType.Text });
  const handleTypeChanged = (value: string, index: number) => {
    setTypeList({ ...typeList, [index]: value });
  };
  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    // only support upload one file in one form item
    return e && e.file;
  };
  return (
    <Form name="dynamic_form_data_item" className={styles.routeDebugDraw} form={props.form}>
      <Form.List name="params">
        {(fields, { add, remove }) => {
          return (
            <>
              {fields.map((field, index) => (
                <Row gutter={16} key={field.name}>
                  <Col span={1}>
                    <Form.Item
                      name={[field.name, 'check']}
                      style={{ textAlign: 'right' }}
                      valuePropName="checked"
                    >
                      {fields.length > 1 && index !== fields.length - 1 && <Checkbox />}
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item name={[field.name, 'key']}>
                      <Input
                        placeholder={formatMessage({ id: 'page.route.input.placeholder.paramKey' })}
                        onChange={() => {
                          // only last line key field input can trigger add new line event
                          if (index === fields.length - 1) {
                            add();
                            const prevData = props.form.getFieldsValue();
                            // auto change the prev line checkbox checked
                            prevData.params[index].check = true;
                            props.form.setFieldsValue(prevData);
                          }
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item name={[field.name, 'type']}>
                      <Select
                        defaultValue={DebugBodyFormDataValueType.Text}
                        options={typeOptions}
                        onChange={(value) => {
                          handleTypeChanged(value, index);
                        }}
                        data-cy={`debug-formdata-type-${index}`}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={7}>
                    {(typeList[index] === DebugBodyFormDataValueType.Text || !typeList[index]) && (
                      <Form.Item name={[field.name, 'value']}>
                        <Input
                          placeholder={formatMessage({
                            id: 'page.route.input.placeholder.paramValue',
                          })}
                        />
                      </Form.Item>
                    )}
                    {typeList[index] === DebugBodyFormDataValueType.File && (
                      <Form.Item>
                        <Form.Item
                          name={[field.name, 'value']}
                          valuePropName="file"
                          getValueFromEvent={normFile}
                        >
                          <Upload maxCount={1}>
                            <Button
                              type="primary"
                              icon={<ImportOutlined />}
                              data-cy={`debug-upload-btn-${index}`}
                            >
                              {formatMessage({ id: 'page.route.button.selectFile' })}
                            </Button>
                          </Upload>
                        </Form.Item>
                      </Form.Item>
                    )}
                  </Col>
                  <Col>
                    {fields.length > 1 && index !== fields.length - 1 && (
                      <MinusCircleOutlined onClick={() => remove(field.name)} />
                    )}
                  </Col>
                </Row>
              ))}
            </>
          );
        }}
      </Form.List>
    </Form>
  );
};

export default DebugFormDataView;
