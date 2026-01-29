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
import { useDisclosure } from '@mantine/hooks';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getStreamRouteListQueryOptions, getStreamRouteQueryOptions } from '@/apis/hooks';
import { putStreamRouteReq } from '@/apis/stream_routes';
import { produceRoute } from '@/components/form-slice/FormPartRoute/util';
import { FormPartStreamRoute } from '@/components/form-slice/FormPartStreamRoute';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';
import { FormEditDrawer } from '@/components/page/FormEditDrawer';
import { JSONEditDrawer } from '@/components/page/JSONEditDrawer';
import PageHeader from '@/components/page/PageHeader';
import { StreamRouteList } from '@/components/page/StreamRouteList';
import { TableActionMenu } from '@/components/page/TableActionMenu';
import { StreamRoutesErrorComponent } from '@/components/page-slice/stream_routes/ErrorComponent';
import { API_STREAM_ROUTES } from '@/config/constant';
import { queryClient } from '@/config/global';
import { req } from '@/config/req';
import { APISIX, type APISIXType } from '@/types/schema/apisix';
import { pageSearchSchema } from '@/types/schema/pageSearch';

// Transform API data to form values
const toFormValues = (data: Record<string, unknown>): APISIXType['StreamRoute'] => {
  return data as APISIXType['StreamRoute'];
};

// Transform form values to API data
const toApiData = (formData: APISIXType['StreamRoute']): APISIXType['StreamRoute'] => {
  return produceRoute(formData) as APISIXType['StreamRoute'];
};

function StreamRouteComponent() {
  const { t } = useTranslation();
  const [formDrawerOpened, { open: openFormDrawer, close: closeFormDrawer }] = useDisclosure(false);
  const [jsonDrawerOpened, { open: openJsonDrawer, close: closeJsonDrawer }] = useDisclosure(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleFormEdit = (id: string) => {
    setSelectedId(id);
    openFormDrawer();
  };

  const handleJsonEdit = (id: string) => {
    setSelectedId(id);
    openJsonDrawer();
  };

  return (
    <>
      <PageHeader title={t('sources.streamRoutes')} />
      <StreamRouteList
        routeKey="/stream_routes/"
        ActionMenu={({ record, refetch }) => (
          <TableActionMenu
            resourceName={t('streamRoutes.singular')}
            resourceTarget={record.value.id}
            deleteApi={`${API_STREAM_ROUTES}/${record.value.id}`}
            onDeleteSuccess={refetch}
            onFormEdit={() => handleFormEdit(record.value.id)}
            onJsonEdit={() => handleJsonEdit(record.value.id)}
          />
        )}
      />

      {selectedId && (
        <>
          <FormEditDrawer<APISIXType['StreamRoute'], APISIXType['StreamRoute']>
            opened={formDrawerOpened}
            onClose={closeFormDrawer}
            title={t('streamRoutes.singular')}
            queryOptions={getStreamRouteQueryOptions(selectedId)}
            schema={APISIX.StreamRoute}
            toFormValues={toFormValues}
            toApiData={toApiData}
            onSave={(data) => putStreamRouteReq(req, data)}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['streamRoutes'] })}
          >
            <FormSectionGeneral />
            <FormPartStreamRoute />
          </FormEditDrawer>

          <JSONEditDrawer
            opened={jsonDrawerOpened}
            onClose={closeJsonDrawer}
            title={t('streamRoutes.singular')}
            queryOptions={getStreamRouteQueryOptions(selectedId)}
            onSave={(data) => putStreamRouteReq(req, data as APISIXType['StreamRoute'])}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['streamRoutes'] })}
          />
        </>
      )}
    </>
  );
}

export const Route = createFileRoute('/stream_routes/')({
  component: StreamRouteComponent,
  errorComponent: StreamRoutesErrorComponent,
  validateSearch: pageSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    queryClient.ensureQueryData(getStreamRouteListQueryOptions(deps)),
});
