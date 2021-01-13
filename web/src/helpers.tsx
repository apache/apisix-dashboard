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
import type { MenuDataItem } from '@ant-design/pro-layout';
import { history } from 'umi';
import moment from 'moment';
import { InfoCircleOutlined } from '@ant-design/icons';

import { codeMessage } from './constants';
import IconFont from './components/IconFont';

export const getMenuData = (): MenuDataItem[] => {
  return [
    {
      name: 'metrics',
      path: '/metrics',
      icon: <IconFont name="icondashboard" />,
    },
    {
      name: 'service',
      path: '/service/list',
      icon: <IconFont name="iconconsumer" />,
    },
    {
      name: 'routes',
      path: '/routes/list',
      icon: <IconFont name="iconroute" />,
    },
    {
      name: 'upstream',
      path: '/upstream/list',
      icon: <IconFont name="iconserver" />,
    },
    {
      name: 'consumer',
      path: '/consumer/list',
      icon: <IconFont name="iconconsumer" />,
    },
    {
      name: 'plugin',
      path: '/plugin/list',
      icon: <IconFont name="iconconsumer" />,
    },
    {
      name: 'ssl',
      path: '/ssl/list',
      icon: <IconFont name="iconssl" />,
    },
    {
      name: 'setting',
      path: '/settings',
      icon: <IconFont name="iconsetting" />,
    },
    {
      name: 'serverinfo',
      path: '/serverinfo',
      icon: <InfoCircleOutlined />,
    },
  ];
};

export const isLoginPage = () => window.location.pathname.indexOf('/user/login') !== -1;

/**
 * 异常处理程序
 */
export const errorHandler = (error: { response: Response; data: any }): Promise<Response> => {
  const { response } = error;
  if (error && response && response.status) {
    // handle global rules
    if ([404].includes(response.status) && response.url.includes('/global_rules/')) {
      const responseCloned = { ...response } as any;
      responseCloned.status = 200;
      responseCloned.data = {
        code: 0,
        message: '',
        data: {
          plugins: {},
        },
      };
      return Promise.resolve(responseCloned);
    }

    if ([401].includes(response.status) && !isLoginPage()) {
      history.replace(`/user/logout?redirect=${encodeURIComponent(window.location.pathname)}`);
      return Promise.reject(response);
    }
    if ([401].includes(response.status) && isLoginPage()) return Promise.reject(response);

    // TODO: improve code message mapper
    const errorText = error.data?.message || codeMessage[response.status];
    notification.error({
      message: `Request Error Code: ${error.data.code}`,
      description: errorText,
    });
  } else if (!response) {
    notification.error({
      description: 'Network Error',
      message: '',
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

export const timestampToLocaleString = (timestamp: number) => {
  if (!timestamp) {
    // TODO: i18n
    return 'None';
  }

  return moment.unix(timestamp).format('YYYY-MM-DD HH:mm:ss');
};
