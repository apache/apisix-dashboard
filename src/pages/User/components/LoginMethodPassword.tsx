import React from 'react';
import { UserModule } from '@/pages/User/typing';
import { Form, Input } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { UserOutlined, LockTwoTone } from '@ant-design/icons';

const formRef = React.createRef<FormInstance>();

const LoginMethodPassword: UserModule.LoginMethod = {
  id: 'password',
  name: '账户密码登录',
  render: () => {
    return (
      <Form ref={formRef} name="control-ref">
        <Form.Item
          name="username"
          rules={[
            {
              required: true,
              message: '请输入用户名!',
            },
          ]}
        >
          <Input
            size="large"
            type="text"
            placeholder="用户名"
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
              message: '请输入密码！',
            },
          ]}
        >
          <Input size="large" type="password" placeholder="密码" prefix={<LockTwoTone />} />
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
    return {
      status: true,
      message: '登录成功',
      data,
    };
  },
};

export default LoginMethodPassword;
