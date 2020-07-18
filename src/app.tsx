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
import { getMenuData, errorHandler, getBaseURL } from '@/helpers';
import defaultSettings from '../config/defaultSettings';

export async function getInitialState(): Promise<{
  currentUser?: API.CurrentUser;
  settings?: LayoutSettings;
}> {
  // 如果是设置页面，不执行
  if (history.location.pathname !== '/settings') {
    try {
      const currentUser = await queryCurrent();
      return {
        currentUser,
        settings: defaultSettings,
      };
    } catch (error) {
      history.push('/settings');
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
  prefix: getBaseURL(),
  errorHandler,
  credentials: 'same-origin',
};
