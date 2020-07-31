import React from 'react';
import { UserModule } from '@/pages/User/typing';
import { Form, Input } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { UserOutlined, LockTwoTone } from '@ant-design/icons';
import { formatMessage } from '@@/plugin-locale/localeExports';

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
    if (data.username === 'admin' && data.password === 'admin') {
      return {
        status: true,
        message: '登录成功',
        data: [],
      };
    }
    return {
      status: false,
      message: '用户名或密码错误',
      data: [],
    };
  },
};

export default LoginMethodPassword;
