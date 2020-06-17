import React from 'react';
import { FormInstance } from 'antd/es/form';

import RequestRewriteView from './RequestRewriteView';
import HttpHeaderRewriteView from './HttpHeaderRewriteView';

interface Props extends RouteModule.Data {
  form: FormInstance;
}

const Step2: React.FC<Props> = (props) => {
  return (
    <>
      <RequestRewriteView {...props} />
      <HttpHeaderRewriteView {...props} />
    </>
  );
};

export default Step2;
