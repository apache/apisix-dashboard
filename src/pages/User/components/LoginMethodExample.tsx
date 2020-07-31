import React from 'react';
import { UserModule } from '@/pages/User/typing';
import { formatMessage } from '@@/plugin-locale/localeExports';

const LoginMethodExample: UserModule.LoginMethod = {
  id: 'example',
  name: formatMessage({ id: 'component.user.loginMethodExample' }),
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
      message: formatMessage({ id: 'component.user.loginMethodExample.message' }),
      data,
    };
  },
};

export default LoginMethodExample;
