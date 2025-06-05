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
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { getRouteListQueryOptions, useServiceRouteList } from '@/apis/hooks';
import PageHeader from '@/components/page/PageHeader';
import { RouteList } from '@/components/page-slice/routes/list';
import { queryClient } from '@/config/global';
import { pageSearchSchema } from '@/types/schema/pageSearch';

function RouteComponent() {
  const { t } = useTranslation();
  const req = useServiceRouteList();
  return (
    <>
      <PageHeader title={t('sources.routes')} />
      <RouteList
        detailTo="/services/detail/$id/routes/detail/$routeId"
        addTo="/services/detail/$id/routes/add"
        req={req}
      />
    </>
  );
}

export const Route = createFileRoute('/services/detail/$id/routes/')({
  component: RouteComponent,
  validateSearch: pageSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    queryClient.ensureQueryData(getRouteListQueryOptions(deps)),
});
