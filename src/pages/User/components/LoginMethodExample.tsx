import React from 'react';
import { UserModule } from '@/pages/User/typing';

const LoginMethodExample: UserModule.LoginMethod = {
  id: 'example',
  name: '示例登录',
  render: () => {
    return <a href="https://www.example.com">example</a>;
  },
  getData(): UserModule.LoginData {
    return {};
  },
  checkData: async () => {
    return true;
  },
  submit: async (data) => {
    return {
      status: false,
      message: '示例登录方式，无法使用',
      data,
    };
  },
};

export default LoginMethodExample;
