import { RouteConfig } from 'vue-router'
import Layout from '@/layout/index.vue'

const tableRoutes: RouteConfig = {
  path: '/schema/ssl',
  component: Layout,
  name: 'SchemaSSL',
  meta: {
    title: 'SchemaSSL',
    icon: 'table'
  },
  redirect: '/schema/ssl/list',
  children: [
    {
      path: 'list',
      component: () => import('@/views/schema/ssl/list.vue'),
      name: 'SchemaSSLList',
      meta: { title: 'SchemaSSLList' }
    }, {
      path: 'edit/:username',
      component: () => import('@/views/schema/ssl/edit.vue'),
      name: 'SchemaSSLEdit',
      meta: {
        title: 'SchemaSSLEdit',
        hidden: true
      }
    }, {
      path: 'create',
      component: () => import('@/views/schema/ssl/edit.vue'),
      name: 'SchemaSSLCreate',
      meta: {
        title: 'SchemaSSLCreate',
        hidden: true
      }
    }
  ]
}

export default tableRoutes
