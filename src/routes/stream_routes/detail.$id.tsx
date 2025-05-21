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

import { getStreamRouteQueryOptions } from '@/apis/hooks';
import { putStreamRouteReq } from '@/apis/stream_routes';
import { FormSubmitBtn } from '@/components/form/Btn';
import { FormPartStreamRoute } from '@/components/form-slice/FormPartStreamRoute';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';
import { DeleteResourceBtn } from '@/components/page/DeleteResourceBtn';
import PageHeader from '@/components/page/PageHeader';
import { API_STREAM_ROUTES } from '@/config/constant';
import { req } from '@/config/req';
import { APISIX, type APISIXType } from '@/types/schema/apisix';
import { pipeProduce } from '@/utils/producer';

type Props = {
  readOnly: boolean;
  setReadOnly: (v: boolean) => void;
};

const StreamRouteDetailForm = (props: Props) => {
  const { readOnly, setReadOnly } = props;
  const { t } = useTranslation();
  const { id } = useParams({ from: '/stream_routes/detail/$id' });

  const streamRouteQuery = useQuery(getStreamRouteQueryOptions(id));
  const { data: streamRouteData, isLoading, refetch } = streamRouteQuery;

  const form = useForm({
    resolver: zodResolver(APISIX.StreamRoute),
    shouldUnregister: true,
    shouldFocusError: true,
    mode: 'all',
    disabled: readOnly,
  });

  useEffect(() => {
    if (streamRouteData?.value && !isLoading) {
      form.reset(streamRouteData.value);
    }
  }, [streamRouteData, form, isLoading]);

  const putStreamRoute = useMutation({
    mutationFn: (d: APISIXType['StreamRoute']) =>
      putStreamRouteReq(req, pipeProduce()(d)),
    async onSuccess() {
      notifications.show({
        message: t('info.edit.success', { name: t('streamRoutes.singular') }),
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
      <form onSubmit={form.handleSubmit((d) => putStreamRoute.mutateAsync(d))}>
        <FormSectionGeneral />
        <FormPartStreamRoute />
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
  const { id } = useParams({ from: '/stream_routes/detail/$id' });
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title={t('info.edit.title', { name: t('streamRoutes.singular') })}
        {...(readOnly && {
          title: t('info.detail.title', { name: t('streamRoutes.singular') }),
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
                name={t('streamRoutes.singular')}
                target={id}
                api={`${API_STREAM_ROUTES}/${id}`}
                onSuccess={() => navigate({ to: '/stream_routes' })}
              />
            </Group>
          ),
        })}
      />
      <FormTOCBox>
        <StreamRouteDetailForm readOnly={readOnly} setReadOnly={setReadOnly} />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute('/stream_routes/detail/$id')({
  component: RouteComponent,
});
