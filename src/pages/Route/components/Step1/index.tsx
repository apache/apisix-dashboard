/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from 'react';
import { Form } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { FORM_ITEM_LAYOUT } from '@/pages/Route/constants';
import styles from '../../Create.less';

import MetaView from './MetaView';
import RequestConfigView from './RequestConfigView';
import MatchingRulesView from './MatchingRulesView';

interface Props extends RouteModule.Data {
  form: FormInstance;
  isEdit?: boolean;
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
