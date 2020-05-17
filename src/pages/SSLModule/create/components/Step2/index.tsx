import React from 'react';
import { Form, Button } from 'antd';
import CertificateForm from '../CertificateForm';
import {
  CertificateUploader,
  UploadPublicSuccessData,
  UploadPrivateSuccessData,
  UploadType,
} from '../CertificateUploader';
import { StepProps } from '../..';

const Step2: React.FC<StepProps> = ({ onStepChange, onFormChange, data }) => {
  const [form] = Form.useForm();
  const { validateFields } = form;

  const onValidateForm = async () => {
    validateFields().then(() => {
      onStepChange(2);
    });
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
