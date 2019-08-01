import { RouteConfig } from 'vue-router'
import Layout from '@/layout/index.vue'

const tableRoutes: RouteConfig = {
  path: '/schema/services',
  component: Layout,
  name: 'SchemaServices',
  meta: {
    title: 'SchemaServices',
    icon: 'table'
  },
  redirect: '/schema/services/list',
  children: [
    {
      path: 'list',
      component: () => import('@/views/schema/service/list.vue'),
      name: 'SchemaServiceList',
      meta: { title: 'SchemaServiceList' }
    }, {
      path: 'edit/:id',
      component: () => import('@/views/schema/service/edit.vue'),
      name: 'SchemaServiceEdit',
      meta: {
        title: 'SchemaServiceEdit',
        hidden: true
      }
    }, {
      path: 'create',
      component: () => import('@/views/schema/service/edit.vue'),
      name: 'SchemaServiceCreate',
      meta: {
        title: 'SchemaServiceCreate',
        hidden: true
      }
    }
  ]
}

export default tableRoutes
