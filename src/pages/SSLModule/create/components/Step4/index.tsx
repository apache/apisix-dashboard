import React from 'react';
import { Result, Button } from 'antd';
import { history } from 'umi';
import { StepProps } from '../..';

const Step4: React.FC<StepProps> = ({ onStepChange, onFormChange }) => {
  return (
    <Result
      status="success"
      title="成功"
      subTitle="SSL证书上传成功"
      key="SSL证书上传成功"
      extra={[
        <Button
          type="primary"
          key="back"
          onClick={() => {
            history.replace('/ssl');
          }}
        >
          回到列表页
        </Button>,
        <Button
          key="reset"
          onClick={() => {
            onFormChange({ createType: 'INPUT' });
            onStepChange(0);
          }}
        >
          继续上传
        </Button>,
      ]}
    />
  );
};
export default Step4;
