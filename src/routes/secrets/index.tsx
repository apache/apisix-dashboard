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
import { ProTable } from '@ant-design/pro-components';
import { CloseButton, TextInput } from '@mantine/core';
import { useDebouncedCallback, useDisclosure } from '@mantine/hooks';
import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getSecretListQueryOptions, getSecretQueryOptions, useSecretList } from '@/apis/hooks';
import { putSecretReq } from '@/apis/secrets';
import { FormPartSecret } from '@/components/form-slice/FormPartSecret';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';
import { FormEditDrawer } from '@/components/page/FormEditDrawer';
import { JSONEditDrawer } from '@/components/page/JSONEditDrawer';
import PageHeader from '@/components/page/PageHeader';
import { TableActionMenu } from '@/components/page/TableActionMenu';
import { ToAddPageDropdown } from '@/components/page/ToAddPageBtn';
import { AntdConfigProvider } from '@/config/antdConfigProvider';
import { API_SECRETS } from '@/config/constant';
import { queryClient } from '@/config/global';
import { req } from '@/config/req';
import { APISIX, type APISIXType } from '@/types/schema/apisix';
import { pageSearchSchema } from '@/types/schema/pageSearch';
import { pipeProduce } from '@/utils/producer';
import IconSearch from '~icons/material-symbols/search';

// Transform API data to form values
const toFormValues = (data: Record<string, unknown>): APISIXType['Secret'] => {
  return data as APISIXType['Secret'];
};

// Transform form values to API data
const toApiData = (formData: APISIXType['Secret']): APISIXType['Secret'] => {
  return pipeProduce()(formData) as APISIXType['Secret'];
};

type SelectedSecret = {
  id: string;
  manager: APISIXType['Secret']['manager'];
};

function RouteComponent() {
  const { t } = useTranslation();
  const { data, isLoading, refetch, pagination, setParams } = useSecretList();
  const [formDrawerOpened, { open: openFormDrawer, close: closeFormDrawer }] = useDisclosure(false);
  const [jsonDrawerOpened, { open: openJsonDrawer, close: closeJsonDrawer }] = useDisclosure(false);
  const [selectedSecret, setSelectedSecret] = useState<SelectedSecret | null>(null);
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = useDebouncedCallback((value: string) => {
    setParams({ name: value || undefined, page: 1 });
  }, 300);

  const handleClear = () => {
    setSearchValue('');
    setParams({ name: undefined });
  };

  const handleFormEdit = useCallback((id: string, manager: APISIXType['Secret']['manager']) => {
    setSelectedSecret({ id, manager });
    openFormDrawer();
  }, [openFormDrawer]);

  const handleJsonEdit = useCallback((id: string, manager: APISIXType['Secret']['manager']) => {
    setSelectedSecret({ id, manager });
    openJsonDrawer();
  }, [openJsonDrawer]);

  const columns = useMemo<
    ProColumns<APISIXType['RespSecretList']['data']['list'][number]>[]
  >(() => {
    return [
      {
        dataIndex: ['value', 'id'],
        title: 'ID',
        key: 'id',
        valueType: 'text',
        ellipsis: true,
      },
      {
        dataIndex: ['value', 'manager'],
        title: t('form.secrets.manager'),
        key: 'manager',
        valueType: 'text',
      },
      {
        dataIndex: ['value', 'update_time'],
        title: t('table.updateTime'),
        key: 'update_time',
        valueType: 'dateTime',
        sorter: true,
        renderText: (text) => {
          if (!text) return '-';
          return new Date(Number(text) * 1000).toISOString();
        },
      },
      {
        title: t('table.actions'),
        valueType: 'option',
        key: 'option',
        width: 80,
        render: (_, record) => (
          <TableActionMenu
            resourceName={t('secrets.singular')}
            resourceTarget={record.value.id}
            deleteApi={`${API_SECRETS}/${record.value.manager}/${record.value.id}`}
            onDeleteSuccess={refetch}
            onFormEdit={() => handleFormEdit(record.value.id, record.value.manager)}
            onJsonEdit={() => handleJsonEdit(record.value.id, record.value.manager)}
          />
        ),
      },
    ];
  }, [t, refetch, handleFormEdit, handleJsonEdit]);

  return (
    <>
      <PageHeader title={t('sources.secrets')} />
      <AntdConfigProvider>
        <ProTable
          columns={columns}
          dataSource={data?.list || []}
          rowKey="id"
          loading={isLoading}
          search={false}
          options={{
            reload: () => refetch(),
            density: true,
            setting: true,
          }}
          pagination={pagination}
          cardProps={{ bodyStyle: { padding: 0 } }}
          toolbar={{
            search: (
              <TextInput
                placeholder={t('form.search')}
                leftSection={<IconSearch />}
                rightSection={searchValue && <CloseButton size="sm" onClick={handleClear} />}
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  handleSearch(e.target.value);
                }}
                style={{ width: 250 }}
              />
            ),
            menu: {
              type: 'inline',
              items: [
                {
                  key: 'add',
                  label: (
                    <ToAddPageDropdown
                      to="/secrets/add"
                      label={t('info.add.title', { name: t('secrets.singular') })}
                    />
                  ),
                },
              ],
            },
          }}
        />
      </AntdConfigProvider>

      {selectedSecret && (
        <>
          <FormEditDrawer<APISIXType['Secret'], APISIXType['Secret']>
            opened={formDrawerOpened}
            onClose={closeFormDrawer}
            title={t('secrets.singular')}
            queryOptions={getSecretQueryOptions(selectedSecret)}
            schema={APISIX.Secret}
            toFormValues={toFormValues}
            toApiData={toApiData}
            onSave={(data) => putSecretReq(req, data)}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['secrets'] })}
          >
            <FormSectionGeneral />
            <FormPartSecret readOnlyManager />
          </FormEditDrawer>

          <JSONEditDrawer
            opened={jsonDrawerOpened}
            onClose={closeJsonDrawer}
            title={t('secrets.singular')}
            queryOptions={getSecretQueryOptions(selectedSecret)}
            onSave={(data) => putSecretReq(req, data as APISIXType['Secret'])}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['secrets'] })}
          />
        </>
      )}
    </>
  );
}

export const Route = createFileRoute('/secrets/')({
  component: RouteComponent,
  validateSearch: pageSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    queryClient.ensureQueryData(getSecretListQueryOptions(deps)),
});
