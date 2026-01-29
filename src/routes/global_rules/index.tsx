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
import { Badge, CloseButton, Group, TextInput } from '@mantine/core';
import { useDebouncedCallback, useDisclosure } from '@mantine/hooks';
import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { putGlobalRuleReq } from '@/apis/global_rules';
import { getGlobalRuleListQueryOptions, getGlobalRuleQueryOptions, useGlobalRuleList } from '@/apis/hooks';
import { FormPartGlobalRules } from '@/components/form-slice/FormPartGlobalRules';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';
import { FormEditDrawer } from '@/components/page/FormEditDrawer';
import { JSONEditDrawer } from '@/components/page/JSONEditDrawer';
import PageHeader from '@/components/page/PageHeader';
import { TableActionMenu } from '@/components/page/TableActionMenu';
import { ToAddPageDropdown } from '@/components/page/ToAddPageBtn';
import { AntdConfigProvider } from '@/config/antdConfigProvider';
import { API_GLOBAL_RULES } from '@/config/constant';
import { queryClient } from '@/config/global';
import { req } from '@/config/req';
import { APISIX, type APISIXType } from '@/types/schema/apisix';
import { pageSearchSchema } from '@/types/schema/pageSearch';
import { pipeProduce } from '@/utils/producer';
import IconSearch from '~icons/material-symbols/search';

// Transform API data to form values
const toFormValues = (data: Record<string, unknown>): APISIXType['GlobalRulePut'] => {
  return data as APISIXType['GlobalRulePut'];
};

// Transform form values to API data
const toApiData = (formData: APISIXType['GlobalRulePut']): APISIXType['GlobalRulePut'] => {
  return pipeProduce()(formData) as APISIXType['GlobalRulePut'];
};

function RouteComponent() {
  const { t } = useTranslation();
  const { data, isLoading, refetch, pagination, setParams } = useGlobalRuleList();
  const [formDrawerOpened, { open: openFormDrawer, close: closeFormDrawer }] = useDisclosure(false);
  const [jsonDrawerOpened, { open: openJsonDrawer, close: closeJsonDrawer }] = useDisclosure(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = useDebouncedCallback((value: string) => {
    setParams({ name: value || undefined, page: 1 });
  }, 300);

  const handleClear = () => {
    setSearchValue('');
    setParams({ name: undefined });
  };

  const handleFormEdit = useCallback((id: string) => {
    setSelectedId(id);
    openFormDrawer();
  }, [openFormDrawer]);

  const handleJsonEdit = useCallback((id: string) => {
    setSelectedId(id);
    openJsonDrawer();
  }, [openJsonDrawer]);

  const columns = useMemo<
    ProColumns<APISIXType['RespGlobalRuleItem']>[]
  >(() => {
    return [
      {
        dataIndex: ['value', 'id'],
        title: 'ID',
        key: 'id',
        valueType: 'text',
      },
      {
        dataIndex: ['value', 'plugins'],
        title: t('form.plugins.label'),
        key: 'plugins',
        render: (_, record) => {
          const plugins = record.value.plugins;
          if (!plugins || Object.keys(plugins).length === 0) return '-';
          const pluginNames = Object.keys(plugins);
          return (
            <Group gap={4}>
              {pluginNames.slice(0, 3).map((name) => (
                <Badge key={name} size="xs" variant="light">{name}</Badge>
              ))}
              {pluginNames.length > 3 && (
                <Badge size="xs" color="gray">+{pluginNames.length - 3}</Badge>
              )}
            </Group>
          );
        },
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
            resourceName={t('globalRules.singular')}
            resourceTarget={record.value.id}
            deleteApi={`${API_GLOBAL_RULES}/${record.value.id}`}
            onDeleteSuccess={refetch}
            onFormEdit={() => handleFormEdit(record.value.id)}
            onJsonEdit={() => handleJsonEdit(record.value.id)}
          />
        ),
      },
    ];
  }, [t, refetch, handleFormEdit, handleJsonEdit]);

  return (
    <>
      <PageHeader title={t('sources.globalRules')} />
      <AntdConfigProvider>
        <ProTable
          columns={columns}
          dataSource={data.list}
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
                      to="/global_rules/add"
                      label={t('info.add.title', {
                        name: t('globalRules.singular'),
                      })}
                    />
                  ),
                },
              ],
            },
          }}
        />
      </AntdConfigProvider>

      {selectedId && (
        <>
          <FormEditDrawer<APISIXType['GlobalRulePut'], APISIXType['GlobalRulePut']>
            opened={formDrawerOpened}
            onClose={closeFormDrawer}
            title={t('globalRules.singular')}
            queryOptions={getGlobalRuleQueryOptions(selectedId)}
            schema={APISIX.GlobalRulePut}
            toFormValues={toFormValues}
            toApiData={(d) => toApiData({ ...d, id: selectedId })}
            onSave={(data) => putGlobalRuleReq(req, data)}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['globalRules'] })}
          >
            <FormSectionGeneral />
            <FormPartGlobalRules />
          </FormEditDrawer>

          <JSONEditDrawer
            opened={jsonDrawerOpened}
            onClose={closeJsonDrawer}
            title={t('globalRules.singular')}
            queryOptions={getGlobalRuleQueryOptions(selectedId)}
            onSave={(data) => putGlobalRuleReq(req, data as APISIXType['GlobalRulePut'])}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['globalRules'] })}
          />
        </>
      )}
    </>
  );
}

export const Route = createFileRoute('/global_rules/')({
  component: RouteComponent,
  validateSearch: pageSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    queryClient.ensureQueryData(getGlobalRuleListQueryOptions(deps)),
});
