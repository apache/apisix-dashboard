import request from '@/utils/request'

export const updateStream = (id: string, data: any) =>
  request({
    url: `/upstreams/${id}`,
    method: 'PUT',
    data
  })

export const getUpstream = (id: string) =>
  request({
    url: `/upstreams/${id}`,
    method: 'GET'
  })

export const removeUpstream = (id: string) =>
  request({
    url: `/upstreams/${id}`,
    method: 'DELETE'
  })

export const createUpstream = (data: any) =>
  request({
    url: `/upstreams`,
    method: 'POST',
    data
  })

export const getUpstreamList = () =>
  request({
    url: `/upstreams`,
    method: 'GET'
  })
