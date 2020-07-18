const routes = [
  {
    path: '/',
    component: './Metrics',
  },
  {
    path: '/metrics',
    component: './Metrics',
  },
  {
    path: '/routes/list',
    component: './Route/List',
  },
  {
    path: '/routes/create',
    component: './Route/Create',
  },
  {
    path: '/routes/:rid/edit',
    component: './Route/Create',
  },
  {
    path: '/ssl/:id/edit',
    component: './SSL/Create',
  },
  {
    path: '/ssl/list',
    component: './SSL/List',
  },
  {
    path: '/ssl/create',
    component: './SSL/Create',
  },
  {
    path: '/upstream/list',
    component: './Upstream/List',
  },
  {
    path: '/upstream/create',
    component: './Upstream/Create',
  },
  {
    path: '/upstream/:id/edit',
    component: './Upstream/Create',
  },
  {
    path: '/consumer/list',
    component: './Consumer/List',
  },
  {
    path: '/consumer/create',
    component: './Consumer/Create',
  },
  {
    path: '/consumer/:id/edit',
    component: './Consumer/Create',
  },
  {
    path: '/settings',
    component: './Setting',
  },
  {
    component: './404',
  },
];

export default routes;
