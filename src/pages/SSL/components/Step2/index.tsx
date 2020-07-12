import React from 'react';

import { FormInstance } from 'antd/es/form';
import CertificateForm from '@/pages/SSL/components/CertificateForm';

type Props = {
  form: FormInstance;
};

const Step: React.FC<Props> = ({ form }) => {
  return (
    <div className="container">
      <CertificateForm mode="VIEW" form={form} />
    </div>
  );
};
export default Step;
