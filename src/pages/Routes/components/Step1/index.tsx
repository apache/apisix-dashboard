import React from 'react';
import { Form } from 'antd';

import MetaView from './MetaView';
import RequestConfigView from './RequestConfigView';
import MatchingRulesView from './MatchingRulesView';

const Step1: React.FC<RouteModule.Data> = (props) => {
  const [form] = Form.useForm();
  return (
    <>
      <MetaView form={form} {...props} />
      <RequestConfigView form={form} {...props} />
      <MatchingRulesView {...props} />
    </>
  );
};

export default Step1;
