import React from 'react';

import Step1 from '../Step1';
import Step2 from '../Step2';
import CreateStep3 from '../CreateStep3';

interface Props extends RouteModule.Data {}

const CreateStep4: React.FC<Props> = (props) => {
  return (
    <>
      <Step1 {...props} disabled />
      <Step2 {...props} disabled />
      <CreateStep3 {...props} disabled />
    </>
  );
};

export default CreateStep4;
