import React from 'react';
import { FormInstance } from 'antd/lib/form';

import Step1 from '../Step1';
import Step2 from '../Step2';
import CreateStep3 from '../CreateStep3';

interface Props extends RouteModule.Data {
  form1: FormInstance;
  form2: FormInstance;
  redirect?: boolean;
}

const style = {
  marginTop: '40px',
};

const CreateStep4: React.FC<Props> = ({ form1, form2, redirect, ...rest }) => {
  return (
    <>
      <h2>定义 API 请求</h2>
      <Step1 {...rest} form={form1} disabled />
      {!redirect && (
        <>
          <h2 style={style}>定义 API 后端服务</h2>
          <Step2 {...rest} form={form2} disabled />
          <h2 style={style}>插件配置</h2>
          <CreateStep3 {...rest} disabled />
        </>
      )}
    </>
  );
};

export default CreateStep4;
