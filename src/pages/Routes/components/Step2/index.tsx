import React from 'react';

import RequestRewriteView from './RequestRewriteView';
import HttpHeaderRewriteView from './HttpHeaderRewriteView';

const Step2: React.FC<RouteModule.Data> = (props) => {
  return (
    <>
      <RequestRewriteView form={props.form} {...props} />
      <HttpHeaderRewriteView {...props} />
    </>
  );
};

export default Step2;
