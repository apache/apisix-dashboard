import request from '@/utils/request'
import { IServiceData } from '../types'

export const getServiceList = () =>
  request({
    url: '/services',
    method: 'get'
  })

export const updateService = (id: string, data: any) =>
  request({
    url: `/services/${id}`,
    method: 'PUT',
    data
  })

export const getService = (id: string) =>
  request({
    url: `/services/${id}`,
    method: 'GET'
  })

export const removeService = (id: string) =>
  request({
    url: `/services/${id}`,
    method: 'DELETE'
  })

export const createService = (data: any) =>
  request({
    url: '/services',
    method: 'POST',
    data
  })
