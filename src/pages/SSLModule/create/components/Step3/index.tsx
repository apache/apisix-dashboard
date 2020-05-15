import React from 'react';
import { Form, Button } from 'antd';
import CertificateForm from '../CertificateForm';
import { StepProps } from '../..';

const Step3: React.FC<StepProps> = ({ data, onStepChange }) => {
  const [form] = Form.useForm();
  const submit = () => {
    onStepChange(3);
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
export default Step3;
