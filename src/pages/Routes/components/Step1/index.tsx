import React from 'react';
import { Form } from 'antd';

import { FORM_ITEM_LAYOUT } from '@/pages/Routes/constants';
import styles from '../../Create.less';

import MetaView from './MetaView';
import RequestConfigView from './RequestConfigView';
import MatchingRulesView from './MatchingRulesView';

const Step1: React.FC<RouteModule.Data> = (props) => {
  const { data, form } = props;

  return (
    <>
      <Form
        {...FORM_ITEM_LAYOUT}
        form={form}
        layout="horizontal"
        className={styles.stepForm}
        initialValues={data.step1Data}
      >
        <MetaView {...props} />
        <RequestConfigView {...props} />
      </Form>
      <MatchingRulesView {...props} />
    </>
  );
};

export default Step1;
