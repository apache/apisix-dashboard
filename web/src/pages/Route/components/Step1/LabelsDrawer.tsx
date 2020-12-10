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
import React, { useEffect, useState } from 'react';
import { AutoComplete, Button, Col, Drawer, Form, Row } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { transformLableValueToKeyValue } from '../../transform';
import { fetchLabelList } from '../../service';

interface Props extends Pick<RouteModule.Step1PassProps, 'onChange'> {
  labelsDataSource: any;
  disabled: boolean;
  onClose(): void;
}

const LabelList = (disabled: boolean, labelList: RouteModule.LabelList) => {
  const keyOptions = Object.keys(labelList || {}).map((item) => ({ value: item }));
  return (
    <Form.List name="labels">
      {(fields, { add, remove }) => {
        return (
          <>
            {fields.map((field, index) => (
              <Form.Item
                key={field.key}
                label={index === 0 && 'Label'}
                labelCol={{ span: index === 0 ? 3 : 0 }}
                wrapperCol={{ offset: index === 0 ? 0 : 3 }}
              >
                <Row style={{ marginBottom: 10 }} gutter={16}>
                  <Col>
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      name={[field.name, 'labelKey']}
                      rules={[
                        {
                          required: true,
                          message: '请输入 key',
                        },
                      ]}
                    >
                      <AutoComplete options={keyOptions} style={{ width: 100 }} />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Form.Item shouldUpdate noStyle>
                      {({ getFieldValue }) => {
                        const key = getFieldValue(['labels', field.name, 'labelKey']);
                        let valueOptions = [{ value: '' }];
                        if (labelList) {
                          valueOptions = (labelList[key] || []).map((item) => ({ value: item }));
                        }

                        return (
                          <Form.Item
                            noStyle
                            name={[field.name, 'labelValue']}
                            fieldKey={[field.fieldKey, 'labelValue']}
                            rules={[
                              {
                                required: true,
                                message: '请输入 value',
                              },
                            ]}
                          >
                            <AutoComplete options={valueOptions} style={{ width: 100 }} />
                          </Form.Item>
                        );
                      }}
                    </Form.Item>
                  </Col>
                  <Col>
                    {!disabled && <MinusCircleOutlined onClick={() => remove(field.name)} />}
                  </Col>
                </Row>
              </Form.Item>
            ))}
            {!disabled && (
              <Form.Item wrapperCol={{ offset: 3 }}>
                <Button type="dashed" onClick={add}>
                  <PlusOutlined />
                  增加
                </Button>
              </Form.Item>
            )}
          </>
        );
      }}
    </Form.List>
  );
};

const LabelsDrawer: React.FC<Props> = ({
  disabled,
  labelsDataSource,
  onClose,
  onChange = () => {},
}) => {
  const transformLabel = transformLableValueToKeyValue(labelsDataSource);

  const [form] = Form.useForm();
  const [labelList, setLabelList] = useState<RouteModule.LabelList>();
  form.setFieldsValue({ labels: transformLabel });

  useEffect(() => {
    fetchLabelList().then((item) => {
      setLabelList(item as RouteModule.LabelList);
    });
  }, []);

  return (
    <Drawer
      title="Edit labels"
      placement="right"
      width={512}
      visible
      closable
      onClose={onClose}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={onClose}>取消</Button>
          <Button
            type="primary"
            style={{ marginRight: 8, marginLeft: 8 }}
            onClick={(e) => {
              e.persist();
              form.validateFields().then(({ labels }) => {
                onChange({
                  action: 'labelsChange',
                  data: labels.map((item: any) => `${item.labelKey}:${item.labelValue}`),
                });
                onClose();
              });
            }}
          >
            确认
          </Button>
        </div>
      }
    >
      <Form form={form} layout="horizontal">
        {LabelList(disabled, labelList || {})}
      </Form>
    </Drawer>
  );
};

export default LabelsDrawer;
