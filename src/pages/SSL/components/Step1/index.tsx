import React, { useState } from 'react';
import { Form, Select } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import { FormInstance } from 'antd/es/form';
import { useIntl } from 'umi';

import CertificateForm from '@/pages/SSL/components/CertificateForm';
import CertificateUploader, { UploadType } from '@/pages/SSL/components/CertificateUploader';

type CreateType = 'Upload' | 'Input';

type Props = {
  form: FormInstance;
};

const Step: React.FC<Props> = ({ form }) => {
  const [publicKeyList, setPublicKeyList] = useState<UploadFile[]>([]);
  const [privateKeyList, setPrivateKeyList] = useState<UploadFile[]>([]);

  const [createType, setCreateType] = useState<CreateType>('Input');

  const { formatMessage } = useIntl();

  const onRemove = (type: UploadType) => {
    if (type === 'PUBLIC_KEY') {
      form.setFieldsValue({
        cert: '',
        sni: '',
        expireTime: undefined,
      });
      setPublicKeyList([]);
    } else {
      form.setFieldsValue({ key: '' });
      setPrivateKeyList([]);
    }
  };
  return (
    <>
      <Form.Item
        label={formatMessage({ id: 'ssl.step.way' })}
        required
        extra={
          window.location.pathname.indexOf('edit') === -1 ? '' : formatMessage({ id: 'ssl.step.rules' })
        }
      >
        <Select
          placeholder={formatMessage({ id: 'ssl.step.select.create.ways' })}
          defaultValue="Input"
          onChange={(value: CreateType) => {
            form.setFieldsValue({
              key: '',
              cert: '',
              sni: '',
              expireTime: undefined,
            });
            setCreateType(value);
          }}
          style={{ width: 100 }}
        >
          <Select.Option value="Input">{formatMessage({ id: 'ssl.step.input' })}</Select.Option>
          <Select.Option value="Upload">{formatMessage({ id: 'ssl.step.upload' })}</Select.Option>
        </Select>
      </Form.Item>
      <div style={createType === 'Input' ? {} : { display: 'none' }}>
        <CertificateForm mode="EDIT" form={form} />
      </div>
      {Boolean(createType === 'Upload') && (
        <CertificateUploader
          onSuccess={({
            cert,
            key,
            ...rest
          }: SSLModule.UploadPrivateSuccessData & SSLModule.UploadPublicSuccessData) => {
            if (cert) {
              setPublicKeyList(rest.publicKeyList);
              form.setFieldsValue({ cert });
            } else {
              form.setFieldsValue({ key });
              setPrivateKeyList(rest.privateKeyList);
            }
          }}
          onRemove={onRemove}
          data={{ publicKeyList, privateKeyList }}
        />
      )}
    </>
  );
};
export default Step;
