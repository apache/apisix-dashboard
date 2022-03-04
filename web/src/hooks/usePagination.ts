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
import { useEffect, useState } from 'react';
import { useLocation, history } from 'umi';
import querystring from 'query-string';

export default function usePagination() {
  const location = useLocation();
  const [paginationConfig, setPaginationConfig] = useState({ pageSize: 10, current: 1 });
  useEffect(() => {
    const { page = 1, pageSize = 10 } = querystring.parse(location.search);
    setPaginationConfig({ pageSize: Number(pageSize), current: Number(page) });
  }, [location.search]);

  const savePageList = (page = 1, pageSize = 10) => {
    history.replace(`${location.pathname}?page=${page}&pageSize=${pageSize}`);
  };

  return { paginationConfig, savePageList };
}
