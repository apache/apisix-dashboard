import React from 'react';
import { Form, Button, message } from 'antd';
import forge from 'node-forge';
import CertificateForm from '../CertificateForm';
import {
  CertificateUploader,
  UploadPublicSuccessData,
  UploadPrivateSuccessData,
  UploadType,
  AltName,
} from '../CertificateUploader';
import { StepProps } from '../..';

const Step2: React.FC<StepProps> = ({ onStepChange, onFormChange, data }) => {
  const [form] = Form.useForm();
  const { validateFields } = form;

  const onValidateForm = async () => {
    if (data.createType === 'UPLOAD') {
      if (!data.key || !data.cert) {
        message.error('请检查证书');
        return;
      }
      onStepChange(2);
    }
    if (data.createType === 'INPUT') {
      validateFields().then((value) => {
        try {
          const cert = forge.pki.certificateFromPem(value.cert);
          const altNames = (cert.extensions.find((item) => item.name === 'subjectAltName')
            .altNames as AltName[])
            .map((item) => item.value)
            .join(';');
          onFormChange({ ...value, sni: altNames, expireTime: cert.validity.notAfter });
          onStepChange(2);
        } catch (error) {
          message.error('证书解析失败');
        }
      });
    }
  };
  const onUploadSuccess = (
    uploadSuccessData: UploadPublicSuccessData | UploadPrivateSuccessData,
  ) => {
    onFormChange(uploadSuccessData);
  };
  const onRemove = (type: UploadType) => {
    if (type === 'PUBLIC_KEY') {
      onFormChange({
        publicKeyDefaultFileList: [],
        cert: '',
        sni: '',
        expireTime: undefined,
      });
    } else {
      onFormChange({
        privateKeyDefaultFileList: [],
        key: '',
      });
    }
  };
  return (
    <>
      {Boolean(data.createType === 'INPUT') && (
        <CertificateForm mode="EDIT" form={form} data={data} />
      )}
      {Boolean(data.createType === 'UPLOAD') && (
        <CertificateUploader onSuccess={onUploadSuccess} onRemove={onRemove} data={data} />
      )}
      <div style={{ width: '100%', textAlign: 'center' }}>
        <Button
          type="primary"
          onClick={() => {
            onStepChange(0);
          }}
          style={{ marginRight: '8px' }}
        >
          上一步
        </Button>
        <Button type="primary" onClick={onValidateForm}>
          下一步
        </Button>
      </div>
    </>
  );
};
export default Step2;
