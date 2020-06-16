import React from 'react';
import { Form } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { FORM_ITEM_LAYOUT } from '@/pages/Routes/constants';
import styles from '../../Create.less';

import MetaView from './MetaView';
import RequestConfigView from './RequestConfigView';
import MatchingRulesView from './MatchingRulesView';

interface Props extends RouteModule.Data {
  form: FormInstance;
}

const Step1: React.FC<Props> = (props) => {
  const { data, form, onChange } = props;

  return (
    <>
      <Form
        {...FORM_ITEM_LAYOUT}
        form={form}
        layout="horizontal"
        className={styles.stepForm}
        onValuesChange={(field) => {
          if (field.redirectOption === 'forceHttps' || field.redirectOption === 'disabled') {
            form.setFieldsValue({ redirectURI: '' });
          }
          onChange({ ...data.step1Data, ...field });
        }}
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
