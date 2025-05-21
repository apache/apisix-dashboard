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
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Group,Skeleton } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createFileRoute,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useBoolean } from 'react-use';

import { getRouteQueryOptions } from '@/apis/hooks';
import { putRouteReq } from '@/apis/routes';
import { FormSubmitBtn } from '@/components/form/Btn';
import { FormPartRoute } from '@/components/form-slice/FormPartRoute';
import { produceToUpstreamForm } from '@/components/form-slice/FormPartUpstream/util';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';
import { DeleteResourceBtn } from '@/components/page/DeleteResourceBtn';
import PageHeader from '@/components/page/PageHeader';
import { API_ROUTES } from '@/config/constant';
import { req } from '@/config/req';
import { APISIX, type APISIXType } from '@/types/schema/apisix';
import { produceRmUpstreamWhenHas } from '@/utils/form-producer';
import { pipeProduce } from '@/utils/producer';

type Props = {
  readOnly: boolean;
  setReadOnly: (v: boolean) => void;
};

const RouteDetailForm = (props: Props) => {
  const { readOnly, setReadOnly } = props;
  const { t } = useTranslation();
  const { id } = useParams({ from: '/routes/detail/$id' });

  const routeQuery = useQuery(getRouteQueryOptions(id));
  const { data: routeData, isLoading, refetch } = routeQuery;

  const form = useForm({
    resolver: zodResolver(APISIX.Route),
    shouldUnregister: true,
    shouldFocusError: true,
    mode: 'all',
    disabled: readOnly,
  });

  useEffect(() => {
    if (routeData?.value && !isLoading) {
      form.reset(
        produceToUpstreamForm(routeData.value.upstream || {}, routeData.value)
      );
    }
  }, [routeData, form, isLoading]);

  const putRoute = useMutation({
    mutationFn: (d: APISIXType['Route']) =>
      putRouteReq(req, pipeProduce(produceRmUpstreamWhenHas('service_id'))(d)),
    async onSuccess() {
      notifications.show({
        message: t('info.edit.success', { name: t('routes.singular') }),
        color: 'green',
      });
      await refetch();
      setReadOnly(true);
    },
  });

  if (isLoading) {
    return <Skeleton height={400} />;
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((d) => putRoute.mutateAsync(d))}>
        <FormSectionGeneral />
        <FormPartRoute />
        {!readOnly && (
          <Group>
            <FormSubmitBtn>{t('form.btn.save')}</FormSubmitBtn>
            <Button variant="outline" onClick={() => setReadOnly(true)}>
              {t('form.btn.cancel')}
            </Button>
          </Group>
        )}
      </form>
    </FormProvider>
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  const [readOnly, setReadOnly] = useBoolean(true);
  const { id } = useParams({ from: '/routes/detail/$id' });
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title={t('info.edit.title', { name: t('routes.singular') })}
        {...(readOnly && {
          title: t('info.detail.title', { name: t('routes.singular') }),
          extra: (
            <Group>
              <Button
                onClick={() => setReadOnly(false)}
                size="compact-sm"
                variant="gradient"
              >
                {t('form.btn.edit')}
              </Button>
              <DeleteResourceBtn
                mode="detail"
                name={t('routes.singular')}
                target={id}
                api={`${API_ROUTES}/${id}`}
                onSuccess={() => navigate({ to: '/routes' })}
              />
            </Group>
          ),
        })}
      />
      <FormTOCBox>
        <RouteDetailForm readOnly={readOnly} setReadOnly={setReadOnly} />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute('/routes/detail/$id')({
  component: RouteComponent,
});
