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
import React, { useEffect, useState } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import SwaggerUI from 'swagger-ui-react';

import 'swagger-ui-react/swagger-ui.css';

import { fetchItemDebugInfo } from './service';

interface DebugProps {
  match: any;
}
const swaggerDataBase = {
  openapi: '3.0.1',
  info: {
    description: 'test apisix-dashboard',
    title: 'APISIX route online debug',
    license: {
      name: 'Apache 2.0',
      url: 'http://www.apache.org/licenses/LICENSE-2.0.html',
    },
  },
};

const Page: React.FC<DebugProps> = (props) => {
  const [swaggerData, setSwaggerData] = useState(swaggerDataBase);

  useEffect(() => {
    fetchItemDebugInfo(props.match.params.rid).then((data) => {
      setSwaggerData({ ...swaggerDataBase, ...data });
    });
  }, []);
  return (
    <PageHeaderWrapper title="在线调试">
      <SwaggerUI spec={swaggerData} />
    </PageHeaderWrapper>
  );
};

export default Page;
