import React from 'react';
import { RequestConfig, history } from 'umi';
import { BasicLayoutProps, Settings as LayoutSettings } from '@ant-design/pro-layout';

import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';
import { queryCurrent } from '@/services/user';
import { errorHandler, getBaseURL } from '@/helpers';
import defaultSettings from '../config/defaultSettings';

export async function getInitialState(): Promise<{
  currentUser?: API.CurrentUser;
  settings?: LayoutSettings;
}> {
  // 如果是设置页面，不执行
  if (history.location.pathname !== '/setting') {
    try {
      const currentUser = await queryCurrent();
      return {
        currentUser,
        settings: defaultSettings,
      };
    } catch (error) {
      history.push('/setting');
    }
  }
  return {
    settings: defaultSettings,
  };
}

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

export const request: RequestConfig = {
  prefix: getBaseURL(),
  errorHandler,
  credentials: 'same-origin',
};
