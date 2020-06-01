import React from 'react';
import { Form } from 'antd';

import MetaView from './MetaView';
import RequestConfigView from './RequestConfigView';
import MatchingRulesView from './MatchingRulesView';

export const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 18,
  },
};

const Step1: React.FC<RouteModule.Data> = (props) => {
  const [form] = Form.useForm();
  return (
    <>
      <MetaView form={form} />
      <RequestConfigView form={form} {...props} />
      <MatchingRulesView form={form} {...props} />
    </>
  );
};

export default Step1;
