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
import { UserModule } from '@/pages/User/typing';
import { Form, Input } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { UserOutlined, LockTwoTone } from '@ant-design/icons';
import { formatMessage } from '@@/plugin-locale/localeExports';
import { request } from '@@/plugin-request/request';

const formRef = React.createRef<FormInstance>();

const LoginMethodPassword: UserModule.LoginMethod = {
  id: 'password',
  name: formatMessage({ id: 'component.user.loginMethodPassword' }),
  render: () => {
    return (
      <Form ref={formRef} name="control-ref">
        <Form.Item
          name="username"
          rules={[
            {
              required: true,
              message: formatMessage({ id: 'component.user.loginMethodPassword.inputUsername' }),
            },
          ]}
        >
          <Input
            size="large"
            type="text"
            placeholder={formatMessage({ id: 'component.user.loginMethodPassword.username' })}
            prefix={
              <UserOutlined
                style={{
                  color: '#1890ff',
                }}
              />
            }
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: formatMessage({ id: 'component.user.loginMethodPassword.inputPassword' }),
            },
          ]}
        >
          <Input
            size="large"
            type="password"
            placeholder={formatMessage({ id: 'component.user.loginMethodPassword.password' })}
            prefix={<LockTwoTone />}
          />
        </Form.Item>
      </Form>
    );
  },
  getData(): UserModule.LoginData {
    if (formRef.current) {
      const data = formRef.current.getFieldsValue();
      return {
        username: data.username,
        password: data.password,
      };
    }
    return {};
  },
  checkData: async () => {
    if (formRef.current) {
      try {
        await formRef.current.validateFields();
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  },
  submit: async (data) => {
    if (data.username !== '' && data.password !== '') {
      try {
        const result = await request('/apisix/admin/user/login', {
          method: 'POST',
          requestType: 'form',
          prefix: '',
          data: {
            username: data.username,
            password: data.password,
          },
        });

        localStorage.setItem('token', result.data.token);
        return {
          status: true,
          message: formatMessage({ id: 'component.user.loginMethodPassword.success' }),
          data: [],
        };
      } catch (e) {
        return {
          status: false,
          message: formatMessage({ id: 'component.user.loginMethodPassword.incorrectPassword' }),
          data: [],
        };
      }
    } else {
      return {
        status: false,
        message: formatMessage({ id: 'component.user.loginMethodPassword.fieldInvalid' }),
        data: [],
      };
    }
  },
  logout: () => {
    localStorage.removeItem('token');
  },
};

export default LoginMethodPassword;
