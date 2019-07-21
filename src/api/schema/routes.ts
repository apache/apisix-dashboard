import request from '@/utils/request'
import { IRouteData } from '../types'

export const getList = () =>
  request({
    url: '/routes',
    method: 'GET'
  })

export const updateRouter = (id: string, data: any) =>
  request({
    url: `/routes/${id}`,
    method: 'PUT',
    data
  })

export const getRouter = (id: string) =>
  request({
    url: `/routes/${id}`,
    method: 'GET'
  })

export const removeRouter = (id: string) =>
  request({
    url: `/routes/${id}`,
    method: 'DELETE'
  })

export const createRouter = (data: any) =>
  request({
    url: '/routes',
    method: 'POST',
    data
  })
