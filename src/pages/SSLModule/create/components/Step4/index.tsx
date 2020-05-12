import React from 'react';
import { Result, Button } from 'antd';
import { router } from 'umi';

interface props {
  data: any;
  setCurrentStep: any;
  setFormData: any;
}

const Step4: React.FC<props> = props => {
  const { setCurrentStep, setFormData } = props;
  const continueUpload = () => {
    setFormData({ createType: null });
    setCurrentStep(0);
  };
  const backTo = () => {
    router.push('/');
  };

  return (
    <>
      <Result
        status="success"
        title="成功"
        subTitle="SSL证书上传成功"
        extra={[
          <Button type="primary" onClick={backTo}>
            回到首页
          </Button>,
          <Button onClick={continueUpload}>继续上传</Button>,
        ]}
      />
    </>
  );
};
export default Step4;
