const routes = [
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
];

export default routes;
