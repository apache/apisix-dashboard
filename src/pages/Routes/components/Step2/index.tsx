import React from 'react';
import { Form } from 'antd';

import RequestRewriteView from './RequestRewriteView';
import HttpHeaderRewriteView from './HttpHeaderRewriteView';

const Step2: React.FC<RouteModule.Data> = (props) => {
  const [form] = Form.useForm();

  return (
    <>
      <RequestRewriteView form={form} {...props} />
      <HttpHeaderRewriteView form={form} {...props} />
    </>
  );
};

export default Step2;
