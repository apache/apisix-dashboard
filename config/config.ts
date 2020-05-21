import { defineConfig } from 'umi';

import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';

const { REACT_APP_ENV, NETLIFY_DEMO, NODE_ENV } = process.env;

const getRequestPrefix = () => {
  if (NETLIFY_DEMO) return '/api';
  if (NODE_ENV === 'development') return '/api';
  return '';
}

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
  base: '/dashboard/',
  publicPath: '/',
  define: {
    REACT_APP_ENV: REACT_APP_ENV || false,
    ADMIN_API_SCHEMA: 'http',
    ADMIN_API_HOST: '127.0.0.1:9080',
    ADMIN_API_PATH: '/apisix/admin/',
    API_KEY: '',
    API_REQUEST_PREFIX: getRequestPrefix(),
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
});
