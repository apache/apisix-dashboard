import React from 'react';
import { Form, Button } from 'antd';
import { create as createSSL } from '@/pages/ssl/service';
import CertificateForm from '../CertificateForm';
import { StepProps } from '../../Create';

const Step: React.FC<StepProps> = ({ data, onStepChange }) => {
  const [form] = Form.useForm();
  const submit = () => {
    createSSL({
      sni: data.sni!.split(';'),
      cert: data.cert!,
      key: data.key!,
    }).then(() => {
      onStepChange(2);
    });
  };
  return (
    <div className="container">
      <CertificateForm mode="VIEW" form={form} data={data} />
      <div style={{ width: '100%', textAlign: 'center' }}>
        <Button type="primary" onClick={() => onStepChange(1)} style={{ marginRight: '8px' }}>
          上一步
        </Button>
        <Button type="primary" onClick={submit}>
          提交
        </Button>
      </div>
    </div>
  );
};
export default Step;
