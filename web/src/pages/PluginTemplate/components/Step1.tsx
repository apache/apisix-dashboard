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
import { Button, Form, Input, Select, Tag } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import { useIntl } from 'umi';

import LabelsDrawer from '@/components/LabelsfDrawer';
import { fetchLabelList } from '../service';

const FORM_LAYOUT = {
  labelCol: {
    span: 2,
  },
  wrapperCol: {
    span: 8,
  },
};

type Props = {
  form: FormInstance;
  disabled?: boolean;
};

const Step1: React.FC<Props> = ({ form, disabled }) => {
  const [visible, setVisible] = useState(false);
  const { formatMessage } = useIntl();

  const NormalLabelComponent = () => {
    const field = 'custom_normal_labels';
    return (
      <React.Fragment>
        <Form.Item label={formatMessage({ id: 'component.global.labels' })} name={field}>
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder="--"
            disabled={disabled}
            open={false}
            bordered={false}
            tagRender={(props) => {
              const { value, closable, onClose } = props;
              return (
                <Tag closable={closable && !disabled} onClose={onClose} style={{ marginRight: 3 }}>
                  {value}
                </Tag>
              );
            }}
          />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 2 }}>
          <Button type="dashed" disabled={disabled} onClick={() => setVisible(true)}>
            {formatMessage({ id: 'component.global.manage' })}
          </Button>
        </Form.Item>
        {visible && (
          <Form.Item shouldUpdate noStyle>
            {() => {
              const labels = form.getFieldValue(field) || [];
              return (
                <LabelsDrawer
                  title={formatMessage({ id: "component.label-manager" })}
                  actionName={field}
                  dataSource={labels}
                  disabled={disabled || false}
                  onChange={({ data }) => {
                    const handledLabels = [...new Set([...(form.getFieldValue('custom_normal_labels') || []), ...data])];
                    form.setFieldsValue({ ...form.getFieldsValue(), custom_normal_labels: handledLabels });
                  }}
                  onClose={() => setVisible(false)}
                  filterList={[]}
                  fetchLabelList={fetchLabelList}
                />
              );
            }}
          </Form.Item>
        )}
      </React.Fragment>
    );
  };

  return (
    <Form {...FORM_LAYOUT} form={form}>
      <Form.Item label={formatMessage({ id: 'component.global.description' })} name="desc">
        <Input.TextArea
          placeholder={`${formatMessage({ id: 'component.global.pleaseEnter' })} ${formatMessage({
            id: 'component.global.description',
          })}`}
          disabled={disabled}
        />
      </Form.Item>
      <NormalLabelComponent />
    </Form>
  );
};

export default Step1;
