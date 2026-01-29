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
import { createFileRoute, useParams } from '@tanstack/react-router';
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
import { TableActionMenu } from '@/components/page/TableActionMenu';
import { ToAddPageDropdown } from '@/components/page/ToAddPageBtn';
import { StreamRoutesErrorComponent } from '@/components/page-slice/stream_routes/ErrorComponent';
import { API_STREAM_ROUTES } from '@/config/constant';
import { queryClient } from '@/config/global';
import { req } from '@/config/req';
import { StreamRouteList } from '@/routes/stream_routes';
import { APISIX, type APISIXType } from '@/types/schema/apisix';
import { pageSearchSchema } from '@/types/schema/pageSearch';
import { CommonFormContext } from '@/utils/form-context';

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
  const { id } = useParams({ from: '/services/detail/$id/stream_routes/' });
  const [formDrawerOpened, { open: openFormDrawer, close: closeFormDrawer }] = useDisclosure(false);
  const [jsonDrawerOpened, { open: openJsonDrawer, close: closeJsonDrawer }] = useDisclosure(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  const handleFormEdit = (routeId: string) => {
    setSelectedRouteId(routeId);
    openFormDrawer();
  };

  const handleJsonEdit = (routeId: string) => {
    setSelectedRouteId(routeId);
    openJsonDrawer();
  };

  return (
    <>
      <PageHeader title={t('sources.streamRoutes')} />
      <StreamRouteList
        routeKey="/services/detail/$id/stream_routes/"
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
        defaultParams={{
          filter: {
            service_id: id,
          },
        }}
        AddButton={
          <ToAddPageDropdown
            to="/services/detail/$id/stream_routes/add"
            params={{ id }}
            label={t('info.add.title', { name: t('streamRoutes.singular') })}
          />
        }
      />

      {selectedRouteId && (
        <>
          <CommonFormContext.Provider value={{ readOnlyFields: ['service_id'] }}>
            <FormEditDrawer<APISIXType['StreamRoute'], APISIXType['StreamRoute']>
              opened={formDrawerOpened}
              onClose={closeFormDrawer}
              title={t('streamRoutes.singular')}
              queryOptions={getStreamRouteQueryOptions(selectedRouteId)}
              schema={APISIX.StreamRoute}
              toFormValues={toFormValues}
              toApiData={toApiData}
              onSave={(data) => putStreamRouteReq(req, data)}
              onSuccess={() => queryClient.invalidateQueries({ queryKey: ['streamRoutes'] })}
            >
              <FormSectionGeneral />
              <FormPartStreamRoute />
            </FormEditDrawer>
          </CommonFormContext.Provider>

          <JSONEditDrawer
            opened={jsonDrawerOpened}
            onClose={closeJsonDrawer}
            title={t('streamRoutes.singular')}
            queryOptions={getStreamRouteQueryOptions(selectedRouteId)}
            onSave={(data) => putStreamRouteReq(req, data as APISIXType['StreamRoute'])}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['streamRoutes'] })}
          />
        </>
      )}
    </>
  );
}

export const Route = createFileRoute('/services/detail/$id/stream_routes/')({
  component: StreamRouteComponent,
  errorComponent: StreamRoutesErrorComponent,
  validateSearch: pageSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    queryClient.ensureQueryData(getStreamRouteListQueryOptions(deps)),
});
