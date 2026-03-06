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
import type { ProColumns } from '@ant-design/pro-components';
import { createFileRoute } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getProtoListQueryOptions, useProtoList } from '@/apis/hooks';
import { DeleteResourceBtn } from '@/components/page/DeleteResourceBtn';
import ResourceListPage from '@/components/page/ResourceListPage';
import { ToDetailPageBtn } from '@/components/page/ToAddPageBtn';
import { API_PROTOS } from '@/config/constant';
import { queryClient } from '@/config/global';
import type { APISIXType } from '@/types/schema/apisix';
import { pageSearchSchema } from '@/types/schema/pageSearch';

const RouteComponent = () => {
  const { t } = useTranslation();

  const { data, isLoading, pagination, refetch } = useProtoList();

  const columns = useMemo<
    ProColumns<APISIXType['RespProtoList']['data']['list'][number]>[]
  >(() => {
    return [
      {
        dataIndex: ['value', 'id'],
        title: 'ID',
        key: 'id',
        valueType: 'text',
      },
      {
        title: t('table.actions'),
        valueType: 'option',
        key: 'option',
        width: 120,
        render: (_, record) => [
          <ToDetailPageBtn
            key="detail"
            to="/protos/detail/$id"
            params={{ id: record.value.id }}
          />,
          <DeleteResourceBtn
            key="delete"
            name={t('protos.singular')}
            target={record.value.id}
            api={`${API_PROTOS}/${record.value.id}`}
            onSuccess={refetch}
          />,
        ],
      },
    ];
  }, [t, refetch]);

  return (
    <ResourceListPage
      titleKey="sources.protos"
      columns={columns}
      queryData={{ data, isLoading, pagination, refetch }}
      rowKey="id"
      addPageTo="/protos/add"
      resourceNameKey="protos.singular"
    />
  );
};

export const Route = createFileRoute('/protos/')({
  component: RouteComponent,
  validateSearch: pageSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    queryClient.ensureQueryData(getProtoListQueryOptions(deps)),
});
