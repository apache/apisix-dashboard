import React, { useState } from 'react';
import { Form, Select } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import { FormInstance } from 'antd/es/form';

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
        label="方式"
        required
        extra={
          window.location.pathname.indexOf('edit') === -1 ? '' : '新证书所含 SNI 应与当前证书一致'
        }
      >
        <Select
          placeholder="请选择创建方式"
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
          <Select.Option value="Input">手动输入</Select.Option>
          <Select.Option value="Upload">上传证书</Select.Option>
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
