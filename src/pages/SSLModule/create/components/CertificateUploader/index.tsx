import React from 'react';
import { Form, Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { UploadChangeParam } from 'antd/lib/upload';
import { UploadFile } from 'antd/lib/upload/interface';
import { useForm } from 'antd/es/form/util';

import forge from 'node-forge';

import styles from '../../style.less';

interface AltName {
  value: string;
}
export interface successDataProps {
  sni?: string;
  cert?: any;
  expireTime?: Date;
  key?: string;
}

interface UploaderProps {
  onSuccess(uploadData: successDataProps): successDataProps;
  data: FormData;
}

type UploadType = 'PUBLIC_KEY' | 'PRIVATE_KEY';

const CertificateUploader: React.FC<UploaderProps> = ({ onSuccess }) => {
  const [form] = useForm();
  const handleChange = (info: UploadChangeParam<UploadFile<any>>, type: UploadType) => {
    if (!info.file.originFileObj) return;
    const fileRead = new FileReader();
    fileRead.readAsText(info.file.originFileObj);
    // eslint-disable-next-line func-names
    fileRead.onload = function (event) {
      const fileResult = (event.currentTarget as any).result;
      if (type === 'PUBLIC_KEY') {
        const cert = forge.pki.certificateFromPem(fileResult);
        const altNames = (cert.extensions.find((item) => item.name === 'subjectAltName')
          .altNames as AltName[])
          .map((item) => item.value)
          .join(';');
        const uploadData = {
          sni: altNames,
          cert: fileResult,
          expireTime: cert.validity.notAfter,
        };
        onSuccess(uploadData);
      } else {
        onSuccess({ key: fileResult });
      }
    };
  };
  const uploadProps = {
    // onChange: handleChange,
    multiple: false,
  };
  return (
    <Form form={form} layout="horizontal" className={styles.stepForm}>
      <Form.Item>
        <Upload
          className={styles.stepForm}
          onChange={(info) => handleChange(info, 'PUBLIC_KEY')}
          {...uploadProps}
        >
          <Button>
            <UploadOutlined /> 点击上传公钥
          </Button>
        </Upload>
      </Form.Item>
      <Form.Item>
        <Upload
          className={styles.stepForm}
          onChange={(info) => handleChange(info, 'PRIVATE_KEY')}
          {...uploadProps}
        >
          <Button>
            <UploadOutlined /> 点击上传私钥
          </Button>
        </Upload>
      </Form.Item>
    </Form>
  );
};
export { CertificateUploader };
