import React from 'react';
import { Form, Button } from 'antd';
import CertificateForm from '../CertificateForm/index';

const Step3: React.FC = props => {
  const [form] = Form.useForm();
  const { data, setCurrentStep } = props;
  const onValidateForm = async () => {
    setCurrentStep(3);
  };
  const preStep = () => {
    setCurrentStep(1);
  };
  return (
    <div className="container">
      <CertificateForm mode="VIEW" form={form} data={data} />
      <div style={{ width: '100%', textAlign: 'center' }}>
        <Button type="primary" onClick={preStep} style={{ marginRight: '8px' }}>
          上一步
        </Button>
        <Button type="primary" onClick={onValidateForm}>
          下一步
        </Button>
      </div>
    </div>
  );
};
export default Step3;
