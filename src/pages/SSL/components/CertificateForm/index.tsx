import React from 'react';
import { Form, Input } from 'antd';
import { useIntl } from 'umi';
import { FormInstance } from 'antd/lib/form';
import { FormData } from '../../Create';

interface CertificateFormProps {
  mode: 'EDIT' | 'VIEW';
  data: FormData;
  form: FormInstance;
}

const CertificateForm: React.FC<CertificateFormProps> = ({ mode, data, form }) => {
  const { formatMessage } = useIntl();
  const renderSNI = () => {
    if (mode === 'VIEW') {
      return (
        <Form.Item
          label="SNI"
          name="sni"
          rules={[
            { required: true, message: formatMessage({ id: 'component.ssl.fieldSNIInvalid' }) },
          ]}
        >
          <Input disabled={mode === 'VIEW'} />
        </Form.Item>
      );
    }
    return null;
  };

  const renderExpireTime = () => {
    if (mode === 'VIEW') {
      return (
        <Form.Item
          label="ExpireTime"
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
    <Form form={form} layout="horizontal" initialValues={data}>
      {renderSNI()}
      <Form.Item
        label="公钥"
        name="cert"
        rules={[
          { required: true, message: formatMessage({ id: 'component.ssl.fieldCertInvalid' }) },
          { min: 128, message: formatMessage({ id: 'component.ssl.fieldCertTooShort' }) },
        ]}
      >
        <Input.TextArea rows={6} disabled={mode !== 'EDIT'} />
      </Form.Item>
      <Form.Item
        label="私钥"
        name="key"
        rules={[
          { required: true, message: formatMessage({ id: 'component.ssl.fieldKeyInvalid' }) },
          { min: 128, message: formatMessage({ id: 'component.ssl.fieldKeyTooShort' }) },
        ]}
      >
        <Input.TextArea rows={6} disabled={mode !== 'EDIT'} />
      </Form.Item>
      {renderExpireTime()}
    </Form>
  );
};

export default CertificateForm;
