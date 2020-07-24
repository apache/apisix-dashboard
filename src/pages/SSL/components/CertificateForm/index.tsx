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
          label={formatMessage({ id: 'ssl.form.expiration.time' })}
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
        label={formatMessage({ id: 'ssl.form.public.key' })}
        name="cert"
        rules={[
          { required: true, message: formatMessage({ id: 'ssl.form.check.cert.value' }) },
          { min: 128, message: formatMessage({ id: 'ssl.form.cert.value.length' }) },
        ]}
      >
        <Input.TextArea rows={6} disabled={mode !== 'EDIT'} />
      </Form.Item>
      <Form.Item
        label={formatMessage({ id: 'ssl.form.private.key' })}
        name="key"
        rules={[
          { required: true, message: formatMessage({ id: 'ssl.form.check.key.value' }) },
          { min: 128, message: formatMessage({ id: 'ssl.form.key.value.length' }) },
        ]}
      >
        <Input.TextArea rows={6} disabled={mode !== 'EDIT'} />
      </Form.Item>
      {renderExpireTime()}
    </Form>
  );
};

export default CertificateForm;
