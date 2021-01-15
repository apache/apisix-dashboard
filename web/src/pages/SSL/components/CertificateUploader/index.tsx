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
import { Form, Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/lib/upload/interface';
import styles from '@/pages/SSL/style.less';
import { useIntl } from 'umi';

export type UploadType = 'PUBLIC_KEY' | 'PRIVATE_KEY';

type UploaderProps = {
  data: {
    publicKeyList: UploadFile[];
    privateKeyList: UploadFile[];
  };
  onSuccess: (
    data: Partial<SSLModule.UploadPrivateSuccessData & SSLModule.UploadPublicSuccessData>,
  ) => void;
  onRemove: (type: UploadType) => void;
};

const CertificateUploader: React.FC<UploaderProps> = ({ onSuccess, onRemove, data }) => {
  const { publicKeyList = [], privateKeyList = [] } = data;
  const [form] = Form.useForm();
  const { formatMessage } = useIntl();

  const genUploadFile = (name = ''): UploadFile => {
    return {
      uid: Math.random().toString(36).slice(2),
      name,
      status: 'done',
      size: 0,
      type: '',
    };
  };

  const parseCertificate = (file: File | Blob, fileName: string, type: UploadType) => {
    const fileReader = new FileReader();
    fileReader.readAsText(file);
    // eslint-disable-next-line func-names
    fileReader.onload = function (event) {
      const { result } = event.currentTarget as any;
      if (type === 'PUBLIC_KEY') {
        const uploadPublicData: SSLModule.UploadPublicSuccessData = {
          cert: result,
          publicKeyList: [genUploadFile(fileName)],
        };
        onSuccess(uploadPublicData);
      } else {
        const uploadprivateData: SSLModule.UploadPrivateSuccessData = {
          key: result,
          privateKeyList: [genUploadFile(fileName)],
        };
        onSuccess(uploadprivateData);
      }
    };
  };

  const beforeUpload = (file: File, fileList: File[], type: UploadType) => {
    parseCertificate(file, file.name, type);
    return false;
  };

  return (
    <Form form={form} layout="horizontal" className={styles.stepForm}>
      <Form.Item>
        <Upload
          className={styles.stepForm}
          onRemove={() => onRemove('PUBLIC_KEY')}
          fileList={publicKeyList}
          beforeUpload={(file, fileList) => beforeUpload(file, fileList, 'PUBLIC_KEY')}
        >
          <Button disabled={publicKeyList.length === 1}>
            <UploadOutlined /> {formatMessage({ id: 'page.ssl.button.uploadCert' })}
          </Button>
        </Upload>
      </Form.Item>
      <Form.Item>
        <Upload
          className={styles.stepForm}
          onRemove={() => onRemove('PRIVATE_KEY')}
          fileList={privateKeyList}
          beforeUpload={(file, fileList) => beforeUpload(file, fileList, 'PRIVATE_KEY')}
        >
          <Button disabled={privateKeyList.length === 1}>
            <UploadOutlined />{' '}
            {`${formatMessage({ id: 'page.ssl.upload' })}${formatMessage({
              id: 'page.ssl.form.itemLabel.privateKey',
            })}`}
          </Button>
        </Upload>
      </Form.Item>
    </Form>
  );
};
export default CertificateUploader;
