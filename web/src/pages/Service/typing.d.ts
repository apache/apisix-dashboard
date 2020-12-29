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
declare namespace ServiceModule {
  type Entity = {
    name: string;
    desc: string;
    upstream: any;
    upstream_id: string;
    labels: string;
    enable_websocket: boolean;
    plugins: {
      [name: string]: any;
    };
  };

  type ResponseBody = {
    id: string;
    plugins: Record<string, any>;
    upstream_id: string;
    upstream: Record<string, any>;
    name: string;
    desc: string;
    enable_websocket: boolean;
  };

  type Step1PassProps = {
    form: FormInstance;
    upstreamForm: FormInstance;
    disabled?: boolean;
    upstreamRef: any;
  };
}
