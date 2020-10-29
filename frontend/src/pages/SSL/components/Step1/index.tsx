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
import { Form, Select } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import { FormInstance } from 'antd/es/form';
import { useIntl } from 'umi';

import CertificateForm from '@/pages/SSL/components/CertificateForm';
import CertificateUploader, { UploadType } from '@/pages/SSL/components/CertificateUploader';

type CreateType = 'Upload' | 'Input';

type Props = {
  form: FormInstance;
};

const Step: React.FC<Props> = ({ form }) => {
  const [publicKeyList, setPublicKeyList] = useState<UploadFile[]>([]);
  const [privateKeyList, setPrivateKeyList] = useState<UploadFile[]>([]);

  const [createType, setCreateType] = useState<CreateType>('Input');

  const { formatMessage } = useIntl();

  const onRemove = (type: UploadType) => {
    if (type === 'PUBLIC_KEY') {
      form.setFieldsValue({
        cert: '',
        sni: '',
        expireTime: undefined,
      });
      setPublicKeyList([]);
    } else {
      form.setFieldsValue({ key: '' });
      setPrivateKeyList([]);
    }
  };
  return (
    <>
      <Form.Item
        label={formatMessage({ id: 'page.ssl.form.itemLabel.way' })}
        required
        extra={
          window.location.pathname.indexOf('edit') === -1
            ? ''
            : formatMessage({ id: 'page.ssl.form.itemExtraMessage.way' })
        }
      >
        <Select
          placeholder={formatMessage({ id: 'page.ssl.select.placeholder.selectCreateWays' })}
          defaultValue="Input"
          onChange={(value: CreateType) => {
            form.setFieldsValue({
              key: '',
              cert: '',
              sni: '',
              expireTime: undefined,
            });
            setCreateType(value);
          }}
          style={{ width: 100 }}
        >
          <Select.Option value="Input">
            {formatMessage({ id: 'page.ssl.selectOption.input' })}
          </Select.Option>
          <Select.Option value="Upload">{formatMessage({ id: 'page.ssl.upload' })}</Select.Option>
        </Select>
      </Form.Item>
      <div style={createType === 'Input' ? {} : { display: 'none' }}>
        <CertificateForm mode="EDIT" form={form} />
      </div>
      {Boolean(createType === 'Upload') && (
        <CertificateUploader
          onSuccess={({
            cert,
            key,
            ...rest
          }: SSLModule.UploadPrivateSuccessData & SSLModule.UploadPublicSuccessData) => {
            if (cert) {
              setPublicKeyList(rest.publicKeyList);
              form.setFieldsValue({ cert });
            } else {
              form.setFieldsValue({ key });
              setPrivateKeyList(rest.privateKeyList);
            }
          }}
          onRemove={onRemove}
          data={{ publicKeyList, privateKeyList }}
        />
      )}
    </>
  );
};
export default Step;
