const routes = [
  {
    path: '/',
    redirect: '/ssl',
  },
  {
    name: 'setting',
    path: '/setting',
    component: './Setting',
    layout: false,
    hideInMenu: true,
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
    name: 'routes',
    path: '/routes',
    icon: 'BarsOutlined',
    routes: [
      {
        path: '/routes',
        redirect: '/routes/create',
      },
      {
        path: '/routes/create',
        name: 'create',
        component: './Routes/Create',
        hideInMenu: true,
      },
    ],
  },
  {
    component: './404',
  },
];

export default routes;
