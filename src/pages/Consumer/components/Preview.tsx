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
import React from 'react';
import { FormInstance } from 'antd/lib/form';

import PluginPage from '@/components/PluginPage';

import Step1 from './Step1';

type Props = {
  form1: FormInstance;
  plugins: PluginPage.PluginData;
};

const Page: React.FC<Props> = ({ form1, plugins }) => {
  return (
    <>
      <Step1 form={form1} disabled />
      <PluginPage data={plugins} disabled />
    </>
  );
};

export default Page;
