import React from 'react';
import { Form, Input } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';

interface detailList {
  mode: string;
  data?: any;
  form: any;
}

const ListDetail: React.FC<detailList> = props => {
  const { mode, data, form } = props;

  return (
    <>
      <Form form={form} layout="horizontal" initialValues={data}>
        <Form.Item
          label="SNI"
          name="sni"
          rules={[
            { required: true, message: formatMessage({ id: 'component.ssl.fieldSNIInvalid' }) },
          ]}
        >
          <Input disabled={mode !== 'EDIT'} />
        </Form.Item>
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
      </Form>
    </>
  );
};

export default ListDetail;
