import React from 'react';
import { FormInstance } from 'antd/lib/form';

import Step1 from './Step1';

type Props = {
  form1: FormInstance;
};

const Page: React.FC<Props> = ({ form1 }) => <Step1 form={form1} disabled />;

export default Page;
