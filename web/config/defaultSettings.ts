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
import { Settings as LayoutSettings } from '@ant-design/pro-layout';

const { SERVER_URL_DEV, SERVER_URL_TEST, REACT_APP_ENV } = process.env;
const defaultSettings = {
  navTheme: 'dark',
  primaryColor: '#1890ff',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: false,
  autoHideHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  menu: {
    locale: true,
  },
  title: 'APISIX Dashboard',
  pwa: false,
  iconfontUrl: '',
  serveUrlMap: {
    dev: SERVER_URL_DEV,
    test: SERVER_URL_TEST,
  },
} as LayoutSettings & {
  pwa: boolean;
  serveUrlMap: {
    dev: string;
    test: string;
  };
};

const { dev, test } = defaultSettings.serveUrlMap;
const throwPromptError = (message: TemplateStringsArray) => {
  throw new Error(
    `Please set '${message[0]}' in 'web/.env' file. Guide: https://apisix.apache.org/docs/dashboard/develop/#web`,
  );
};

if (REACT_APP_ENV === 'test' && !test) {
  throwPromptError`SERVER_URL_TEST`;
}

if (REACT_APP_ENV === 'dev' && !dev) {
  throwPromptError`SERVER_URL_DEV`;
}

export default defaultSettings;
