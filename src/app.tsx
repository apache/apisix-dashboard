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
import { RequestConfig, history } from 'umi';
import {
  BasicLayoutProps,
  Settings as LayoutSettings,
  TopNavHeaderProps,
} from '@ant-design/pro-layout';

import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';
import { queryCurrent } from '@/services/user';
import { getMenuData, errorHandler } from '@/helpers';
import defaultSettings from '../config/defaultSettings';

export async function getInitialState(): Promise<{
  currentUser?: API.CurrentUser;
  settings?: LayoutSettings;
}> {
  const token = localStorage.getItem('token');
  if (!token) {
    history.replace(`/user/login?redirect=${encodeURIComponent(window.location.pathname)}`);
  }

  const currentUser = await queryCurrent();
  return {
    currentUser,
    settings: defaultSettings,
  };
}

export const layout = ({
  initialState,
}: {
  initialState: { settings?: LayoutSettings };
}): BasicLayoutProps & TopNavHeaderProps => {
  return {
    headerRender: undefined,
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    footerRender: () => <Footer />,
    menuHeaderRender: undefined,
    menuDataRender: getMenuData,
    ...initialState?.settings,
  };
};

export const request: RequestConfig = {
  prefix: '/apisix/admin',
  errorHandler,
  credentials: 'same-origin',
  requestInterceptors: [
    (url, options) => {
      const newOptions = { ...options };
      newOptions.headers = {
        ...options.headers,
        Authorization: localStorage.getItem('token') || '',
      };
      return {
        url,
        options: { ...newOptions, interceptors: true },
      };
    },
  ],
  responseInterceptors: [
    async (res) => {
      if (!res.ok) {
        // NOTE: http code >= 400, using errorHandler
        return res;
      }

      const data = await res.json();
      const { code = -1 } = data as Res<any>;
      if (code !== 0) {
        // eslint-disable-next-line
        return Promise.reject({ response: res, data });
      }
      return data;
    },
  ],
};
