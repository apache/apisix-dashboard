import { RouteConfig } from 'vue-router'
import Layout from '@/layout/index.vue'

const tableUpstream: RouteConfig = {
  path: '/schema/upstream',
  component: Layout,
  name: 'SchemaUpstream',
  meta: {
    title: 'SchemaUpstream',
    icon: 'table'
  },
  redirect: '/schema/upstream/list',
  children: [
    {
      path: 'list',
      component: () => import('@/views/schema/upstream/list.vue'),
      name: 'SchemaUpstreamList',
      meta: { title: 'SchemaUpstreamList' }
    }, {
      path: 'edit/:id',
      component: () => import('@/views/schema/upstream/edit.vue'),
      name: 'SchemaUpstreamEdit',
      meta: {
        title: 'SchemaUpstreamEdit',
        hidden: true
      }
    }, {
      path: 'create',
      component: () => import('@/views/schema/upstream/edit.vue'),
      name: 'SchemaUpstreamCreate',
      meta: {
        title: 'SchemaUpstreamCreate',
        hidden: true
      }
    }
  ]
}

export default tableUpstream
