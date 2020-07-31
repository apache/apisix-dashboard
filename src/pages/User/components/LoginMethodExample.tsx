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
      message: '示例登录方式，仅作为登录方式扩展例子，无法使用',
      data,
    };
  },
};

export default LoginMethodExample;
