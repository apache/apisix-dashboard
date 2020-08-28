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
import { notification } from 'antd';
import { MenuDataItem } from '@ant-design/pro-layout';
import { history } from 'umi';

import { codeMessage } from './constants';
import IconFont from './iconfont';

export const getMenuData = (): MenuDataItem[] => {
  return [
    {
      name: 'metrics',
      path: '/metrics',
      icon: <IconFont type="icondashboard" />,
    },
    {
      name: 'routes',
      path: '/routes/list',
      icon: <IconFont type="iconroute" />,
    },
    {
      name: 'routegroup',
      path: '/routegroup/list',
      icon: <IconFont type="iconroute" />,
    },
    {
      name: 'ssl',
      path: '/ssl/list',
      icon: <IconFont type="iconSSLshuzizhengshu" />,
    },
    {
      name: 'upstream',
      path: '/upstream/list',
      icon: <IconFont type="iconupstream" />,
    },
    {
      name: 'consumer',
      path: '/consumer/list',
      icon: <IconFont type="iconfuwuliebiao" />,
    },
    {
      name: 'setting',
      path: '/settings',
      icon: <IconFont type="iconsetting" />,
    },
  ];
};

export const isLoginPage = () => window.location.pathname.indexOf('/user/login') !== -1;

/**
 * 异常处理程序
 */
export const errorHandler = (error: { response: Response; data: any }): Promise<Response> => {
  const { response } = error;
  if (response && response.status) {
    if ([401].includes(response.status) && !isLoginPage()) {
      history.replace(`/user/logout?redirect=${encodeURIComponent(window.location.pathname)}`);
      return Promise.reject(response);
    }
    if ([401].includes(response.status) && isLoginPage()) return Promise.reject(response);

    const errorText =
      error.data.msg || error.data.message || error.data.error_msg || codeMessage[response.status];

    notification.error({
      message: `请求错误，错误码： ${error.data.errorCode || response.status}`,
      description: errorText,
    });
  } else if (!response) {
    notification.error({
      description: '您的网络发生异常，无法连接服务器',
      message: '网络异常',
    });
  }
  return Promise.reject(response);
};

export const getUrlQuery: (key: string) => string | false = (key: string) => {
  const query = window.location.search.substring(1);
  const vars = query.split('&');

  for (let i = 0; i < vars.length; i += 1) {
    const pair = vars[i].split('=');
    if (pair[0] === key) return pair[1];
  }
  return false;
};
