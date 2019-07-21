import request from '@/utils/request'

import { ISSLData } from '../types'

export const getSSLList = () =>
  request({
    url: '/ssl',
    method: 'GET'
  })

export const updateSSL = (id: string, data: any) =>
  request({
    url: `/ssl/${id}`,
    method: 'PUT',
    data
  })

export const getSSL = (id: string) =>
  request({
    url: `/ssl/${id}`,
    method: 'GET'
  })

export const removeSSL = (id: string) =>
  request({
    url: `/ssl/${id}`,
    method: 'DELETE'
  })

export const createSSL = (data: any) =>
  request({
    url: '/ssl',
    method: 'POST',
    data
  })
