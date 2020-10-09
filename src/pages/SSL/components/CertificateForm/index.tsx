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
import { Form, Input, Tag } from 'antd';
import { useIntl } from 'umi';
import { FormInstance } from 'antd/lib/form';

interface CertificateFormProps {
  mode: 'EDIT' | 'VIEW';
  form: FormInstance;
}

const CertificateForm: React.FC<CertificateFormProps> = ({ mode, form }) => {
  const { formatMessage } = useIntl();
  const renderSNI = () => {
    if (mode === 'VIEW') {
      return (
        <Form.Item label="SNI">
          {(form.getFieldValue('snis') || []).map((item: string) => (
            <Tag color="geekblue" key={item}>
              {item}
            </Tag>
          ))}
        </Form.Item>
      );
    }
    return null;
  };

  const renderExpireTime = () => {
    if (mode === 'VIEW') {
      return (
        <Form.Item
          label={formatMessage({ id: 'page.ssl.form.itemLabel.expireTime' })}
          name="expireTime"
          rules={[{ required: true, message: 'ExpireTime' }]}
        >
          <Input disabled={mode === 'VIEW'} />
        </Form.Item>
      );
    }
    return null;
  };

  return (
    <Form form={form} layout="horizontal" initialValues={form?.getFieldsValue()}>
      {renderSNI()}
      <Form.Item
        label={formatMessage({ id: 'page.ssl.form.itemLabel.cert' })}
        name="cert"
        rules={[
          {
            required: true,
            message: `${formatMessage({ id: 'component.global.pleaseCheck' })}${formatMessage({
              id: 'page.ssl.form.itemLabel.cert',
            })}`,
          },
          {
            min: 128,
            message: formatMessage({ id: 'page.ssl.form.itemRuleMessage.certValueLength' }),
          },
        ]}
      >
        <Input.TextArea
          rows={6}
          disabled={mode !== 'EDIT'}
          placeholder={formatMessage({ id: 'page.ssl.textAreaPlaceholder.cert' })}
        />
      </Form.Item>
      <Form.Item
        label={formatMessage({ id: 'page.ssl.form.itemLabel.privateKey' })}
        name="key"
        rules={[
          {
            required: true,
            message: `${formatMessage({ id: 'component.global.pleaseCheck' })}${formatMessage({
              id: 'page.ssl.form.itemLabel.privateKey',
            })}`,
          },
          {
            min: 128,
            message: formatMessage({ id: 'page.ssl.form.itemRuleMessage.privateKeyLength' }),
          },
        ]}
      >
        <Input.TextArea rows={6} disabled={mode !== 'EDIT'} />
      </Form.Item>
      {renderExpireTime()}
    </Form>
  );
};

export default CertificateForm;
