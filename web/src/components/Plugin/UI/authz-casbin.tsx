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
import { useIntl } from "umi";
import Form, { FormInstance } from "antd/es/form";
import React, { useState } from "react";
import { Radio, Input } from "antd";

type Props = {
  form: FormInstance;
  schema: Record<string, any> | undefined;
  ref?: any;
  disabled?: boolean
}

const FORM_ITEM_LAYOUT = {
  labelCol: {
    span: 7,
  },
  wrapperCol: {
    span: 8,
  },
};

const AuthzCasbin: React.FC<Props> = ({ form, schema }) => {
  const { formatMessage } = useIntl();
  const properties = schema?.properties
  const [value, setValue] = useState(1);
  const onChange = (e:any) => {
    setValue(e.target.value);
  };

  const [dian, setDian] = useState('houmian')
  const aa = () => {
    setDian('houmian')
  }

  const bb = () => {
    setDian('qianmian')
  }

  return (
    <Form form={form} {...FORM_ITEM_LAYOUT}>
      <Radio.Group onChange={onChange} value={value}>
        <Radio value={1} onClick={aa}>A</Radio>
        <Radio value={2} onClick={bb}>B</Radio>
      </Radio.Group>
      {dian === 'houmian' ?
        <>
          < Form.Item
            name="model_path"
            label="model_path"
            rules={
              [
                {
                  required: true,
                  message: `${formatMessage({ id: 'component.global.pleaseEnter' })} model_path`,
                },
              ]}
            initialValue={properties.model_path.default}
            tooltip={formatMessage({ id: 'component.pauginForm.authz-casbin.model_path.tooltip' })}
          >
            <Input />
          </Form.Item >
          <Form.Item
            name="policy_path"
            label="policy_path"

            rules={[
              {
                required: true,
                message: `${formatMessage({ id: 'component.global.pleaseEnter' })} policy_path`,
              },
            ]}
            initialValue={properties.policy_path.default}
            tooltip={formatMessage({ id: 'compoenet.pauginForm.authz-casbin.policy_path.tooltip' })}
          >

            <Input />
          </Form.Item>
          <Form.Item
            name="username"
            label="username"
            rules={[
              {
                required: true,
                message: `${formatMessage({ id: 'component.global.pleaseEnter' })} username`,
              },
            ]}
            initialValue={properties.username.defalt}
            tooltip={formatMessage({ id: 'compoenet.pauginForm.authz-casbin.username.tooltip' })}
          >
            <Input />
          </Form.Item>
        </>
        :
        <>
          <Form.Item
            name="model"
            label="model"
            rules={[
              {
                required: true,
                message: `${formatMessage({ id: 'component.global.pleaseEnter' })} model`,
              },
            ]}
            initialValue={properties.model_path.default}
            tooltip={formatMessage({ id: 'compoenet.pauginForm.authz-casbin.model.tooltip' })}
          >{ }
            <Input />
          </Form.Item>
          <Form.Item
            name="policy"
            label="policy"
            rules={[
              {
                required: true,
                message: `${formatMessage({ id: 'component.global.pleaseEnter' })} policy`,
              },
            ]}
            initialValue={properties.model_path.default}
            tooltip={formatMessage({ id: 'compoenet.pauginForm.authz-casbin.policy.tooltip' })}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="username"
            label="username"
            rules={[
              {
                required: true,
                message: `${formatMessage({ id: 'component.global.pleaseEnter' })} username`,
              },
            ]}
            initialValue={properties.username.defalt}
            tooltip={formatMessage({ id: 'compoenet.pauginForm.authz-casbin.username.tooltip' })}
          >
            <Input />
          </Form.Item>
        </>
      }
    </Form >
  );
};

export default AuthzCasbin
