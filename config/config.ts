import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';
import proxy from './proxy';

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
  layout: {
    name: 'APISIX Dashboard',
    locale: true,
    logo: '/favicon.png',
  },
  base: '/dashboard/',
  publicPath: '/',
  routes: [
    {
      path: '/user',
      layout: false,
      routes: [
        {
          name: 'login',
          path: '/user/login',
          component: './user/login',
        },
      ],
    },
    {
      path: '/',
      redirect: '/settings',
    },
    {
      name: 'settings',
      path: '/settings',
      icon: 'setting',
      component: './Settings',
    },
    {
      name: 'ssl',
      path: '/ssl',
      icon: 'BarsOutlined',
      routes: [
        {
          path: '/ssl',
          redirect: '/ssl/list',
        },
        {
          path: '/ssl/list',
          name: 'list',
          component: './ssl/List',
          hideInMenu: true,
        },
        {
          name: 'create',
          path: '/ssl/create',
          component: './ssl/Create',
          hideInMenu: true,
        },
      ],
    },
    {
      component: './404',
    },
  ],
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
