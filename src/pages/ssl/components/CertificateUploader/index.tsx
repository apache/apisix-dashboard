import React from 'react';
import { Form, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { UploadFile } from 'antd/lib/upload/interface';
import { useForm } from 'antd/es/form/util';
import forge from 'node-forge';
import { FormData } from '../../Create';
import styles from '../../Create.less';

export interface AltName {
  value: string;
}

export type UploadType = 'PUBLIC_KEY' | 'PRIVATE_KEY';
export interface UploadPublicSuccessData {
  sni: string;
  cert: string;
  expireTime: Date;
  publicKeyFileList: UploadFile[];
}
export interface UploadPrivateSuccessData {
  key: string;
  privateKeyFileList: UploadFile[];
}

interface UploaderProps {
  onSuccess(data: UploadPublicSuccessData | UploadPrivateSuccessData): void;
  onRemove(type: UploadType): void;
  data: FormData;
}

const CertificateUploader: React.FC<UploaderProps> = ({ onSuccess, onRemove, data }) => {
  const { publicKeyFileList = [], privateKeyFileList = [] } = data;
  const [form] = useForm();

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
        try {
          const cert = forge.pki.certificateFromPem(result);
          const altNames = (cert.extensions.find((item) => item.name === 'subjectAltName')
            .altNames as AltName[])
            .map((item) => item.value)
            .join(';');
          const uploadPublicData: UploadPublicSuccessData = {
            sni: altNames,
            cert: result,
            expireTime: cert.validity.notAfter,
            publicKeyFileList: [genUploadFile(fileName)],
          };
          onSuccess(uploadPublicData);
        } catch (error) {
          message.error('证书解析失败');
        }
      } else {
        const uploadprivateData: UploadPrivateSuccessData = {
          key: result,
          privateKeyFileList: [genUploadFile(fileName)],
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
          accept=".pem"
          className={styles.stepForm}
          onRemove={() => onRemove('PUBLIC_KEY')}
          fileList={publicKeyFileList}
          beforeUpload={(file, fileList) => beforeUpload(file, fileList, 'PUBLIC_KEY')}
        >
          <Button disabled={publicKeyFileList.length === 1}>
            <UploadOutlined /> 点击上传公钥
          </Button>
        </Upload>
      </Form.Item>
      <Form.Item>
        <Upload
          accept=".key"
          className={styles.stepForm}
          onRemove={() => onRemove('PRIVATE_KEY')}
          fileList={privateKeyFileList}
          beforeUpload={(file, fileList) => beforeUpload(file, fileList, 'PRIVATE_KEY')}
        >
          <Button disabled={privateKeyFileList.length === 1}>
            <UploadOutlined /> 点击上传私钥
          </Button>
        </Upload>
      </Form.Item>
    </Form>
  );
};
export { CertificateUploader };
