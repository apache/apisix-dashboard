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
import { defineConfig } from 'umi';

import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';

const { REACT_APP_ENV } = process.env;

export default defineConfig({
  hash: true,
  antd: {},
  dva: {
    hmr: true,
  },
  locale: {
    default: 'zh-CN',
    antd: true,
    baseNavigator: true,
  },
  dynamicImport: {
    loading: '@/components/PageLoading/index',
  },
  targets: {
    ie: 11,
  },
  routes,
  layout: {
    name: 'APISIX Dashboard',
    locale: true,
    logo: '/favicon.png',
  },
  base: '/',
  publicPath: '/dashboard/',
  define: {
    REACT_APP_ENV: REACT_APP_ENV || false,
  },
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    'primary-color': defaultSettings.primaryColor,
  },
  // @ts-ignore
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
  history: { type: 'hash' },
  chainWebpack: function (config, { webpack }) {
    const useHash = this.hash && process.env.NODE_ENV === 'production';

    // js files
    config.output
      .filename(useHash ? 'js/[name].[contenthash:8].js' : `js/[name].js`)
      .chunkFilename(useHash ? `js/[name].[contenthash:8].async.js` : `js/[name].js`)
      .end();

    // css files
    config.plugin('extract-css').tap((options) => {
      options[0].filename = useHash ? 'css/[name].[contenthash:8].css' : 'css/[name].css';
      options[0].chunkFilename = useHash
        ? 'css/[name].[contenthash:8].chunk.css'
        : 'css/[name].chunk.css';
      return options;
    });

    // svg
    config.module
      .rule('svg')
      .test(/\.(svg)(\?.*)?$/)
      .use('file-loader')
      .loader(require.resolve('file-loader'))
      .options({
        name: 'img/[name].[hash:8].[ext]',
        esModule: false,
      });
  },
});
