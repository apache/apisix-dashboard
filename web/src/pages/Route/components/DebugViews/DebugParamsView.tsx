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
import { Form, Input, Row, Col, Checkbox } from 'antd';
import { useIntl } from 'umi';
import { MinusCircleOutlined } from '@ant-design/icons';

import styles from './index.less';

const DebugParamsView: React.FC<RouteModule.DebugViewProps> = (props) => {
  const { formatMessage } = useIntl();

  return (
    <Form name="dynamic_form_nest_item" className={styles.routeDebugDraw} form={props.form}>
      <Form.List name="params">
        {(fields, { add, remove }) => {
          return (
            <>
              {fields.map((field, index) => (
                <Row gutter={16} key={index.toString()}>
                  <Col span={1}>
                    <Form.Item
                      name={[field.name, 'check']}
                      style={{ textAlign: 'right' }}
                      valuePropName="checked"
                    >
                      {fields.length > 1 && index !== fields.length - 1 && <Checkbox key={`checkbox_${field.name}_${index}_1`}/>}
                    </Form.Item>
                  </Col>
                  <Col span={8} key={`col_${field.name}_${index}_2`}>
                    <Form.Item name={[field.name, 'key']} key={`formitem_${field.name}_${index}_2`}>
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
                        key={`input_${field.name}_${index}_2`}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8} key={`col_${field.name}_${index}_3`}>
                    <Form.Item name={[field.name, 'value']} key={`formitem_${field.name}_${index}_3`}>
                      <Input
                        placeholder={formatMessage({
                          id: 'page.route.input.placeholder.paramValue',
                        })}
                        key={`input_${field.name}_${index}_3`}
                      />
                    </Form.Item>
                  </Col>
                  <Col key={`col_${field.name}_${index}_4`}>
                    {fields.length > 1 && index !== fields.length - 1 && (
                      <MinusCircleOutlined onClick={() => remove(field.name)} key={`minus_${field.name}_${index}_4`}/>
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

export default DebugParamsView;
