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
  logout() {},
};

export default LoginMethodExample;
