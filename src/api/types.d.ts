/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export interface IArticleData {
  id: number
  status: string
  title: string
  abstractContent: string
  fullContent: string
  sourceURL: string
  imageURL: string
  timestamp: string | number
  platforms: string[]
  disableComment: boolean
  importance: number
  author: string
  reviewer: string
  type: string
  pageviews: number
}

export interface IRoleData {
  key: string
  name: string
  description: string
  routes: any
}

export interface ITransactionData {
  orderId: string
  timestamp: string | number
  username: string
  price: number
  status: string
}

export interface IUserData {
  id: number
  username: string
  password: string
  name: string
  email: string
  phone: string
  avatar: string
  introduction: string
  roles: string[]
}

export type TypeID = number | string
export type TypePlugin = object

export interface IConsumerData {
  username: string
  plugins?: TypePlugin
}

export enum EnumRouteMethod {
  GET,
  PUT,
  POST,
  DELETE
}
export interface IRouteData {
  // TODO: https://github.com/iresty/apisix/blob/7953e5bb755bf7481b07a177f94d674f8b344741/lua/apisix/core/schema.lua#L175
  // TODO: https://github.com/iresty/apisix/blob/7953e5bb755bf7481b07a177f94d674f8b344741/lua/apisix/core/schema.lua#L149
  methods: []
  plugins: TypePlugin
  upstream: IUpstreamData
  uri: string
  host: string
  remote_addr: string
  service_id: TypeID
  upstream_id: TypeID
  id: TypeID
}

// TODO: https://github.com/iresty/apisix/blob/7953e5bb755bf7481b07a177f94d674f8b344741/lua/apisix/core/schema.lua#L193
export interface IServiceData {
  id: TypeID
  plugins: TypePlugin
  upstream: IUpstreamData
  upstream_id: TypeID
}

export interface ISSLData {
  cert: string
  key: string
  sni: string
}

export enum EnumUpstreamType {
  chash,
  roundrobin
}

export enum EnumUpstreamKey {
  remote_addr
}
export interface IUpstreamData {
  nodes: object
  type: EnumUpstreamType
  key?: EnumUpstreamKey
  id?: TypeID
}

export enum EnumAction {
  get,
  set,
  delete,
  create
}

export interface IDataWrapper<T> {
  node: {
    value: T
  },
  action: EnumAction
}
