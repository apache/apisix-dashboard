/**
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

import type { TablePaginationConfig } from 'antd';
import { useCallback, useMemo } from 'react';

import type { FileRoutesByTo } from '@/routeTree.gen';
import type { APISIXListResponse } from '@/types/schema/apisix/type';
import { pageSearchSchema } from '@/types/schema/pageSearch';

import type { UseSearchParams } from './useSearchParams';

type ListPageKeys = `${keyof FilterKeys<FileRoutesByTo, 's'>}/`;
type Props<T> = {
  data: APISIXListResponse<T>;
  /** if params is from useSearchParams, refetch is not needed */
  refetch?: () => void;
} & Pick<UseSearchParams<ListPageKeys>, 'params' | 'setParams'>;

export const useTablePagination = <T>(props: Props<T>) => {
  const { data, refetch, setParams } = props;
  const params = useMemo(
    () => pageSearchSchema.parse(props.params),
    [props.params]
  );
  const { page, page_size } = params;

  const onChange: TablePaginationConfig['onChange'] = useCallback(
    (page: number, pageSize: number) => {
      setParams({ page, page_size: pageSize });
      refetch?.();
    },
    [refetch, setParams]
  );

  const pagination = {
    current: page,
    pageSize: page_size,
    total: data.total ?? 0,
    showSizeChanger: true,
    onChange: onChange,
  } as TablePaginationConfig;
  return pagination;
};
