import React, { useState } from 'react';
import { Form, Button, Select } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';

import CertificateForm from '../CertificateForm';
import { CertificateUploader, UploadType } from '../CertificateUploader';
import { StepProps } from '../../Create';
import { verifyKeyPaire } from '../../service';

type CreateType = 'Upload' | 'Input';

const Step: React.FC<StepProps> = ({ onStepChange, onFormChange, data }) => {
  const [form] = Form.useForm();
  const { validateFields } = form;

  const [publicKeyList, setPublicKeyList] = useState<UploadFile[]>([]);
  const [privateKeyList, setPrivateKeyList] = useState<UploadFile[]>([]);

  const [createType, setCreateType] = useState<CreateType>('Input');

  const onValidateForm = async () => {
    let keyPaire = { cert: '', key: '' };
    validateFields()
      .then((value) => {
        keyPaire = { cert: value.cert, key: value.key };
        return verifyKeyPaire(value.cert, value.key);
      })
      .then((_data) => {
        const { snis, validity_end } = _data.data;
        onFormChange({
          ...keyPaire,
          sni: snis.join(';'),
          expireTime: new Date(validity_end * 1000).toLocaleString(),
        });
        onStepChange(1);
      });
  };

  const onRemove = (type: UploadType) => {
    if (type === 'PUBLIC_KEY') {
      onFormChange({
        cert: '',
        sni: '',
        expireTime: undefined,
      });
      setPublicKeyList([]);
    } else {
      onFormChange({
        key: '',
      });
      setPrivateKeyList([]);
    }
  };
  return (
    <>
      <Form.Item label="方式" required>
        <Select
          placeholder="请选择创建方式"
          defaultValue="Input"
          onChange={(value: CreateType) => {
            onFormChange({}, true);
            setCreateType(value);
          }}
          style={{ width: 100 }}
        >
          <Select.Option value="Input">手动输入</Select.Option>
          <Select.Option value="Upload">上传证书</Select.Option>
        </Select>
      </Form.Item>
      <div style={createType === 'Input' ? {} : { display: 'none' }}>
        <CertificateForm mode="EDIT" form={form} data={data} />
      </div>
      {Boolean(createType === 'Upload') && (
        <CertificateUploader
          onSuccess={(_data: any) => {
            form.setFieldsValue(_data);
            if (_data.cert) {
              setPublicKeyList(_data.publicKeyList);
            } else {
              setPrivateKeyList(_data.privateKeyList);
            }
          }}
          onRemove={onRemove}
          data={{ publicKeyList, privateKeyList }}
        />
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
export default Step;
