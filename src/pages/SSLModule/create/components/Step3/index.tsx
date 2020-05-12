import React from 'react';
import { Form, Button } from 'antd';
import ListDetail from '../listDetail/index';

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
      <ListDetail mode="VIEW" form={form} data={data} />
      <div className="button-area">
        <Button type="primary" onClick={preStep}>
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
