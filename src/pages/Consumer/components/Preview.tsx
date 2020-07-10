import React from 'react';
import { FormInstance } from 'antd/lib/form';

import PluginPage from '@/components/PluginPage';

import Step1 from './Step1';

type Props = {
  form1: FormInstance;
  plugins: PluginPage.PluginData;
};

const Page: React.FC<Props> = ({ form1, plugins }) => {
  return (
    <>
      <Step1 form={form1} disabled />
      <PluginPage data={plugins} disabled />
    </>
  );
};

export default Page;
