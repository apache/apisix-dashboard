import React from 'react';
import { Form, Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { UploadChangeParam } from 'antd/lib/upload';
import { UploadFile } from 'antd/lib/upload/interface';
import { useForm } from 'antd/es/form/util';
import forge from 'node-forge';
import { FormData } from '../..';
import styles from '../../style.less';

interface AltName {
  value: string;
}

export type UploadType = 'PUBLIC_KEY' | 'PRIVATE_KEY';
export interface SuccessDataProps {
  sni?: string;
  cert?: string;
  key?: string;
  expireTime?: Date;
  publicKeyDefaultFileList?:
    | []
    | [
        {
          uid: string;
          status: string;
          name: string;
        },
      ];
  privateKeyDefaultFileList?:
    | []
    | [
        {
          uid: string;
          status: string;
          name: string;
        },
      ];
}

interface UploaderProps {
  onSuccess(uploadData: SuccessDataProps): void;
  onDelFile(type: UploadType): void;
  data: FormData;
}

const CertificateUploader: React.FC<UploaderProps> = ({ onSuccess, onDelFile, data }) => {
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
        const uploadPublicData: SuccessDataProps = {
          sni: altNames,
          cert: fileResult,
          expireTime: cert.validity.notAfter,
          publicKeyDefaultFileList: [
            {
              uid: '1',
              name: info.file.name,
              status: 'done',
            },
          ],
        };
        onSuccess(uploadPublicData);
      } else {
        const uploadprivateData: SuccessDataProps = {
          key: fileResult,
          privateKeyDefaultFileList: [
            {
              uid: '2',
              name: info.file.name,
              status: 'done',
            },
          ],
        };
        onSuccess(uploadprivateData);
      }
    };
  };

  const publicUploadProps = {
    defaultFileList: data.publicKeyDefaultFileList || undefined,
  };

  const privateUploadProps = {
    defaultFileList: data.privateKeyDefaultFileList || undefined,
  };

  return (
    <Form form={form} layout="horizontal" className={styles.stepForm}>
      <Form.Item>
        <Upload
          className={styles.stepForm}
          onChange={(info) => handleChange(info, 'PUBLIC_KEY')}
          onRemove={() => onDelFile('PUBLIC_KEY')}
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
          onChange={(info) => handleChange(info, 'PRIVATE_KEY')}
          onRemove={() => onDelFile('PRIVATE_KEY')}
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
