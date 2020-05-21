import React from 'react';
import { notification } from 'antd';
import { RequestConfig } from 'umi';
import { BasicLayoutProps, Settings as LayoutSettings } from '@ant-design/pro-layout';

import { getAdminAPIConfig } from '@/utils/setting';
import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';

export const layout = ({
  initialState,
}: {
  initialState: { settings?: LayoutSettings };
}): BasicLayoutProps => {
  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    footerRender: () => <Footer />,
    menuHeaderRender: undefined,
    ...initialState?.settings,
  };
};

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

/**
 * 异常处理程序
 */
const errorHandler = (error: { response: Response; data: any }): Promise<Response> => {
  const { response } = error;
  if (response && response.status) {
    const errorText = error.data.message || error.data.error_msg || codeMessage[response.status];

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

const adminAPIConfig = getAdminAPIConfig();
export const request: RequestConfig = {
  errorHandler,
  credentials: 'same-origin',
  headers: {
    'X-ADMIN-API-SCHEMA': adminAPIConfig.schema,
    'X-ADMIN-API-HOST': adminAPIConfig.host,
    'X-ADMIN-API-PATH': adminAPIConfig.path,
    'X-API-KEY': adminAPIConfig.key,
  },
};
