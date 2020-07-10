import React from 'react';
import { Form, Input, Tag } from 'antd';
import { useIntl } from 'umi';
import { FormInstance } from 'antd/lib/form';

interface CertificateFormProps {
  mode: 'EDIT' | 'VIEW';
  form: FormInstance;
}

const CertificateForm: React.FC<CertificateFormProps> = ({ mode, form }) => {
  const { formatMessage } = useIntl();
  const renderSNI = () => {
    if (mode === 'VIEW') {
      return (
        <Form.Item label="SNI">
          {(form.getFieldValue('snis') || []).map((item: string) => (
            <Tag color="geekblue" key={item}>
              {item}
            </Tag>
          ))}
        </Form.Item>
      );
    }
    return null;
  };

  const renderExpireTime = () => {
    if (mode === 'VIEW') {
      return (
        <Form.Item
          label="过期时间"
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
    <Form form={form} layout="horizontal" initialValues={form?.getFieldsValue()}>
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
