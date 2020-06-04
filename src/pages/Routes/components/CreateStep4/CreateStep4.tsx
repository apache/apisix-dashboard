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

const CreateStep4: React.FC<Props> = ({ form1, form2, redirect, ...rest }) => {
  return (
    <>
      <Step1 {...rest} form={form1} disabled />
      {!redirect && (
        <>
          <Step2 {...rest} form={form2} disabled />
          <CreateStep3 {...rest} disabled />
        </>
      )}
    </>
  );
};

export default CreateStep4;
