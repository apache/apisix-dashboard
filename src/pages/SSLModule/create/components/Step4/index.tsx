import React from 'react';
import { Result, Button } from 'antd';
import { router } from 'umi';
import { StepProps } from '../..';

const Step4: React.FC<StepProps> = props => {
  const { setStep, setData } = props;
  const continueUpload = () => {
    setData({ createType: null });
    setStep(0);
  };
  const backTo = () => {
    router.push('/ssl');
  };

  return (
    <>
      <Result
        status="success"
        title="成功"
        subTitle="SSL证书上传成功"
        key="SSL证书上传成功"
        extra={[
          <Button type="primary" onClick={backTo}>
            回到列表页
          </Button>,
          <Button onClick={continueUpload}>继续上传</Button>,
        ]}
      />
    </>
  );
};
export default Step4;
