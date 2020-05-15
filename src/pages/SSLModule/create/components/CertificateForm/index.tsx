import React from 'react';
import { Form, Input } from 'antd';
import { useIntl } from 'umi';
import { FormInstance } from 'antd/lib/form';

interface CertificateFormProps {
  mode: 'EDIT' | 'VIEW';
  data?: any;
  form: FormInstance;
}

const CertificateForm: React.FC<CertificateFormProps> = ({ mode, data, form }) => {
  const { formatMessage } = useIntl();
  const renderSNI =
    mode === 'EDIT' ? null : (
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
  const renderExpireTime =
    mode === 'EDIT' ? null : (
      <Form.Item
        label="ExpireTime"
        name="ExpireTime"
        rules={[{ required: true, message: 'ExpireTime' }]}
      >
        <Input disabled={mode === 'VIEW'} />
      </Form.Item>
    );

  return (
    <Form form={form} layout="horizontal" initialValues={data}>
      {renderSNI}
      <Form.Item
        label="Cert"
        name="cert"
        rules={[
          { required: true, message: formatMessage({ id: 'component.ssl.fieldCertInvalid' }) },
          { min: 128, message: formatMessage({ id: 'component.ssl.fieldCertTooShort' }) },
        ]}
      >
        <Input.TextArea rows={6} disabled={mode !== 'EDIT'} />
      </Form.Item>
      <Form.Item
        label="Key"
        name="key"
        rules={[
          { required: true, message: formatMessage({ id: 'component.ssl.fieldKeyInvalid' }) },
          { min: 128, message: formatMessage({ id: 'component.ssl.fieldKeyTooShort' }) },
        ]}
      >
        <Input.TextArea rows={6} disabled={mode !== 'EDIT'} />
      </Form.Item>
      {renderExpireTime}
    </Form>
  );
};

export default CertificateForm;
