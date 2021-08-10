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

import UpstreamForm from '@/components/Upstream';
import { fetchUpstreamList } from '@/components/Upstream/service';

const RequestRewriteView: React.FC<RouteModule.Step2PassProps> = ({
  form,
  upstreamRef,
  disabled,
  hasServiceId = false,
}) => {
  const [list, setList] = useState<UpstreamComponent.ResponseData[]>([]);
  useEffect(() => {
    fetchUpstreamList().then(({ data }) => setList(data as UpstreamComponent.ResponseData[]));
  }, []);
  return (
    <UpstreamForm
      ref={upstreamRef}
      form={form}
      disabled={disabled}
      list={list}
      showSelector
      required={!hasServiceId}
      key={1}
    />
  );
};

export default RequestRewriteView;
