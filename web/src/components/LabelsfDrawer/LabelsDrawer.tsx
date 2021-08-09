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
import { AutoComplete, Button, Col, Drawer, Form, notification, Row } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useIntl } from 'umi';

import { transformLableValueToKeyValue } from '../../helpers';

type Props = {
  title?: string;
  actionName: string;
  dataSource: string[];
  filterList?: string[];
  fetchLabelList: any;
  disabled: boolean;
  onClose: () => void;
} & Pick<RouteModule.Step1PassProps, 'onChange'>;

const LabelList = (disabled: boolean, labelList: LabelList, filterList: string[] = []) => {
  const { formatMessage } = useIntl();

  const keyOptions = Object.keys(labelList || {})
    .filter((item) => !filterList.includes(item))
    .map((item) => ({ value: item }));
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
                          message: 'Please input key',
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
                                message: 'Please input value',
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
                  {formatMessage({ id: 'component.global.add' })}
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
  title = '',
  actionName = '',
  disabled = false,
  dataSource = [],
  filterList = [],
  fetchLabelList,
  onClose,
  onChange = () => {},
}) => {
  const transformLabel = transformLableValueToKeyValue(dataSource);

  const { formatMessage } = useIntl();
  const [form] = Form.useForm();
  const [labelList, setLabelList] = useState<LabelList>({});
  form.setFieldsValue({ labels: transformLabel });

  useEffect(() => {
    fetchLabelList().then(setLabelList);
  }, []);

  return (
    <Drawer
      title={title || formatMessage({ id: 'component.label-manager' })}
      placement="right"
      width={512}
      visible
      closable
      onClose={onClose}
      maskClosable={false}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={onClose}>{formatMessage({ id: 'component.global.cancel' })}</Button>
          <Button
            type="primary"
            style={{ marginRight: 8, marginLeft: 8 }}
            onClick={(e) => {
              e.persist();
              form.validateFields().then(({ labels }) => {
                const data = labels.map((item: any) => `${item.labelKey}:${item.labelValue}`);
                // check for duplicates
                if (new Set(data).size !== data.length) {
                  notification.warning({
                    message: `Config Error`,
                    description: 'Please do not enter duplicate labels',
                  });
                  return;
                }

                onChange({
                  action: actionName,
                  data,
                });
                onClose();
              });
            }}
          >
            {formatMessage({ id: 'component.global.confirm' })}
          </Button>
        </div>
      }
    >
      <Form form={form} layout="horizontal">
        {LabelList(disabled, labelList || {}, filterList)}
      </Form>
    </Drawer>
  );
};

export default LabelsDrawer;
