import React from 'react';
import { FormInstance } from 'antd/lib/form';
import { useIntl } from 'umi';

import PluginPage from '@/components/PluginPage';

import Step1 from '../Step1';
import Step2 from '../Step2';

interface Props extends RouteModule.Data {
  form1: FormInstance;
  form2: FormInstance;
  redirect?: boolean;
}

const style = {
  marginTop: '40px',
};

const CreateStep4: React.FC<Props> = ({ form1, form2, redirect, ...rest }) => {

  const { formatMessage } = useIntl();

  return (
    <>
      <h2>{formatMessage({ id: 'route.create.define.api.request' })}</h2>
      <Step1 {...rest} form={form1} disabled />
      {!redirect && (
        <>
          <h2 style={style}>{formatMessage({ id: 'route.create.define.api.backend.server' })}</h2>
          <Step2 {...rest} form={form2} disabled />
          <h2 style={style}>{formatMessage({ id: 'route.create.plugin.configuration' })}</h2>
          <PluginPage data={rest.data.step3Data.plugins} disabled />
        </>
      )}
    </>
  );
};

export default CreateStep4;
