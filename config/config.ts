import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings'; // https://umijs.org/config/
import proxy from './proxy';

const { ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION, REACT_APP_ENV } = process.env;

export default defineConfig({
  antd: {},
  dva: {
    hmr: true,
  },
  locale: {
    default: 'zh-CN',
    antd: true,
    baseNavigator: true,
  },
  hash: true,
  targets: {
    ie: 11,
  },
  base: '/dashboard/',
  publicPath: '/dashboard/',
  // umi routes: https://umijs.org/zh/guide/router.html
  routes: [
    {
      path: '/user',
      component: '../layouts/UserLayout',
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
      component: '../layouts/SecurityLayout',
      routes: [
        {
          path: '/',
          component: '../layouts/BasicLayout',
          authority: ['admin', 'user'],
          routes: [
            {
              path: '/',
              redirect: '/welcome',
            },
            {
              path: '/welcome',
              name: 'welcome',
              icon: 'smile',
              component: './Welcome',
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
              icon: 'crown',
              routes: [
                {
                  path: '/ssl',
                  redirect: '/ssl/list',
                },
                {
                  path: '/ssl/list',
                  name: 'list',
                  component: './SSLModule/list',
                  hideInMenu: true,
                },
                {
                  path: '/ssl/:key/edit',
                  name: 'edit',
                  component: './SSLModule/detail',
                  hideInMenu: true,
                },
                {
                  path: '/ssl/create',
                  name: 'create',
                  component: './SSLModule/detail',
                  hideInMenu: true,
                },
              ],
            },
            {
              component: './404',
            },
          ],
        },
        {
          component: './404',
        },
      ],
    },
    {
      component: './404',
    },
  ],
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    'primary-color': defaultSettings.primaryColor,
  },
  define: {
    REACT_APP_ENV: REACT_APP_ENV || false,
    ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION:
      ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION || '', // preview.pro.ant.design only do not use in your production ; preview.pro.ant.design 专用环境变量，请不要在你的项目中使用它。
    ADMIN_API_SCHEMA: 'http',
    ADMIN_API_HOST: '127.0.0.1:9080',
    ADMIN_API_PATH: '/apisix/admin/',
    API_KEY: '',
  },
  ignoreMomentLocale: true,
  lessLoader: {
    javascriptEnabled: true,
  },
  cssLoader: {
    modules: true,
  },
  manifest: {
    basePath: '/',
  },
  proxy: proxy[REACT_APP_ENV || 'dev'],
  title: false,
});
