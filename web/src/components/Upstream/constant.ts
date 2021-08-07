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

export const removeBtnStyle = {
  display: 'flex',
  alignItems: 'center',
};

export enum AlgorithmEnum {
  chash = 'chash',
  roundrobin = 'roundrobin',
  ewma = 'ewma',
  least_conn = 'least_conn',
}

export enum HashOnEnum {
  vars = 'vars',
  header = 'header',
  cookie = 'cookie',
  consumer = 'consumer',
  vars_combinations = 'vars_combinations',
}

export enum CommonHashKeyEnum {
  remote_addr = 'remote_addr',
  host = 'host',
  uri = 'uri',
  server_name = 'server_name',
  server_addr = 'server_addr',
  request_uri = 'request_uri',
  query_string = 'query_string',
  remote_port = 'remote_port',
  hostname = 'hostname',
  arg_id = 'arg_id',
}

export enum SchemeEnum {
  grpc = 'grpc',
  grpcs = 'grpcs',
  http = 'http',
  https = 'https',
}

export enum PassHostEnum {
  pass = 'pass',
  node = 'node',
  rewrite = 'rewrite',
}
