import React from 'react';
import { UserModule } from '@/pages/User/typing';

const LoginMethodTest: UserModule.LoginMethod = {
  id: 'test',
  name: '测试登录',
  render: () => {
    return <a href="https://www.example.com">example</a>;
  },
  getData(): UserModule.LoginData {
    return {};
  },
};

export default LoginMethodTest;
