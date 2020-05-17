import React from 'react';
import { Form, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { UploadChangeParam } from 'antd/lib/upload';
import { UploadFile } from 'antd/lib/upload/interface';
import { useForm } from 'antd/es/form/util';
import forge from 'node-forge';
import { FormData } from '../..';
import styles from '../../style.less';

export interface AltName {
  value: string;
}

export type UploadType = 'PUBLIC_KEY' | 'PRIVATE_KEY';
export interface UploadPublicSuccessData {
  sni: string;
  cert: string;
  expireTime: Date;
  publicKeyDefaultFileList: UploadFile[];
}
export interface UploadPrivateSuccessData {
  key: string;
  privateKeyDefaultFileList: UploadFile[];
}

interface UploaderProps {
  onSuccess(data: UploadPublicSuccessData | UploadPrivateSuccessData): void;
  onRemove(type: UploadType): void;
  data: FormData;
}

const CertificateUploader: React.FC<UploaderProps> = ({ onSuccess, onRemove, data }) => {
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
  const onChange = (info: UploadChangeParam<UploadFile<any>>, type: UploadType) => {
    if (!info.file.originFileObj) return;
    const fileReader = new FileReader();
    fileReader.readAsText(info.file.originFileObj);
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
            publicKeyDefaultFileList: [genUploadFile(info.file.name)],
          };
          onSuccess(uploadPublicData);
        } catch (error) {
          message.error('证书解析失败');
        }
      } else {
        const uploadprivateData: UploadPrivateSuccessData = {
          key: result,
          privateKeyDefaultFileList: [genUploadFile(info.file.name)],
        };
        onSuccess(uploadprivateData);
      }
    };
  };

  const publicUploadProps = {
    defaultFileList: data.publicKeyDefaultFileList || [],
  };

  const privateUploadProps = {
    defaultFileList: data.privateKeyDefaultFileList || [],
  };

  return (
    <Form form={form} layout="horizontal" className={styles.stepForm}>
      <Form.Item>
        <Upload
          className={styles.stepForm}
          onChange={(info) => onChange(info, 'PUBLIC_KEY')}
          onRemove={() => onRemove('PUBLIC_KEY')}
          {...publicUploadProps}
        >
          <Button>
            <UploadOutlined /> 点击上传公钥
          </Button>
        </Upload>
      </Form.Item>
      <Form.Item>
        <Upload
          className={styles.stepForm}
          onChange={(info) => onChange(info, 'PRIVATE_KEY')}
          onRemove={() => onRemove('PRIVATE_KEY')}
          {...privateUploadProps}
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
