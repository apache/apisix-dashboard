import React from 'react';
import { Form, Button } from 'antd';
import CertificateForm from '../CertificateForm';
import CertificateUploader from '../CertificateUploader';
import { StepProps } from '../..';

const Step2: React.FC<StepProps> = ({ data, onStepChange, onFormChange }) => {
  const [form] = Form.useForm();
  const { validateFields } = form;

  const onValidateForm = async () => {
    validateFields().then((values) => {
      onFormChange({
        createType: data.createType,
        ...values,
      });
      onStepChange(2);
    });
  };
  let renderView;
  const buttonArea = (
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
  );
  if (data.createType === 'INPUT') {
    renderView = (
      <div className="step2-container">
        <CertificateForm mode="EDIT" form={form} data={data} />
        {buttonArea}
      </div>
    );
  } else {
    renderView = (
      <>
        <CertificateUploader form={form} data={data} />
        {buttonArea}
      </>
    );
  }
  return renderView;
};
export default Step2;
