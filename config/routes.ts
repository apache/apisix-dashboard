const routes = [
  {
    path: '/',
    redirect: '/ssl',
  },
  {
    name: 'metrics',
    path: '/metrics',
    component: './Metrics/Metrics',
    icon: 'AreaChartOutlined',
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
        redirect: '/routes/list',
      },
      {
        path: '/routes/list',
        name: 'list',
        icon: 'BarsOutlined',
        component: './Route/List',
        hideInMenu: true,
      },
      {
        path: '/routes/create',
        name: 'create',
        component: './Route/Create',
        hideInMenu: true,
      },
      {
        path: '/routes/:rid/edit',
        name: 'edit',
        component: './Route/Create',
        hideInMenu: true,
      },
    ],
  },
  {
    name: 'consumer',
    path: '/consumer',
    icon: 'BarsOutlined',
    routes: [
      {
        path: '/consumer',
        redirect: '/Consumer/list',
      },
      {
        path: '/consumer/list',
        name: 'list',
        icon: 'BarsOutlined',
        component: './Consumer/List',
        hideInMenu: true,
      },
      {
        path: '/consumer/create',
        name: 'create',
        component: './Consumer/Create',
        hideInMenu: true,
      },
      {
        path: '/consumer/:rid/edit',
        name: 'edit',
        component: './Consumer/Create',
        hideInMenu: true,
      },
    ],
  },
  {
    component: './404',
  },
];

export default routes;
