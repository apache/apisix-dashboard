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
import { Button, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useNavigate, useRouter , useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { postRouteRawReq, postRouteReq } from '@/apis/routes';
import { FormSubmitBtn } from '@/components/form/Btn';
import { FormPartRoute } from '@/components/form-slice/FormPartRoute';
import {
  RoutePostSchema,
  type RoutePostType,
} from '@/components/form-slice/FormPartRoute/schema';
import { produceRoute } from '@/components/form-slice/FormPartRoute/util';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { JSONEditorView } from '@/components/page/JSONEditorView';
import PageHeader from '@/components/page/PageHeader';
import { PreviewJSONModal } from '@/components/page/PreviewJSONModal';
import { req } from '@/config/req';
import type { APISIXType } from '@/types/schema/apisix';
import IconCode from '~icons/material-symbols/code';

// Search params schema
const searchSchema = z.object({
  mode: z.enum(['form', 'json']).optional().default('form'),
});

// Route creation template with minimum required fields (JSON format)
const ROUTE_TEMPLATE = {
  name: '',
  uri: '/*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  upstream: {
    type: 'roundrobin',
    nodes: {
      'httpbin.org:80': 1,
    },
  },
};

// Form default values (array format for nodes)
const FORM_DEFAULT_VALUES: Partial<RoutePostType> = {
  uri: '/*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  upstream: {
    type: 'roundrobin',
    nodes: [
      {
        host: 'httpbin.org',
        port: 80,
        weight: 1,
        priority: 0,
      },
    ],
  },
};

type Props = {
  navigate: (res: APISIXType['RespRouteDetail']) => Promise<void>;
  defaultValues?: Partial<RoutePostType>;
};

// Preview JSON button component (needs form context)
const PreviewJSONButton = () => {
  const { t } = useTranslation();
  const [opened, { open, close }] = useDisclosure(false);
  const { getValues } = useFormContext<RoutePostType>();
  const [previewJson, setPreviewJson] = useState('{}');

  const handlePreview = () => {
    const formData = getValues();
    // Transform form data to API format for preview
    const apiData = produceRoute(formData);
    setPreviewJson(JSON.stringify(apiData, null, 2));
    open();
  };

  return (
    <>
      <Button
        variant="light"
        leftSection={<IconCode />}
        onClick={handlePreview}
      >
        {t('form.view.previewJSON')}
      </Button>
      <PreviewJSONModal opened={opened} onClose={close} json={previewJson} />
    </>
  );
};

export const RouteAddForm = (props: Props) => {
  const { navigate, defaultValues } = props;
  const { t } = useTranslation();
  const router = useRouter();

  const postRoute = useMutation({
    mutationFn: (d: RoutePostType) => postRouteReq(req, produceRoute(d)),
    async onSuccess(res) {
      notifications.show({
        message: t('info.add.success', { name: t('routes.singular') }),
        color: 'green',
      });
      await navigate(res);
    },
  });

  const form = useForm({
    resolver: zodResolver(RoutePostSchema),
    shouldUnregister: true,
    shouldFocusError: true,
    mode: 'all',
    defaultValues,
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((d) => postRoute.mutateAsync(d))}>
        <FormPartRoute />
        <Group mt="xl" justify="space-between">
          <PreviewJSONButton />
          <Group>
            <Button variant="outline" onClick={() => router.history.back()}>
              {t('form.btn.cancel')}
            </Button>
            <FormSubmitBtn>{t('form.btn.save')}</FormSubmitBtn>
          </Group>
        </Group>
      </form>
    </FormProvider>
  );
};

const RouteAddJSON = (props: Props) => {
  const { navigate } = props;
  const { t } = useTranslation();
  const [jsonValue, setJsonValue] = useState(
    JSON.stringify(ROUTE_TEMPLATE, null, 2)
  );

  const postRoute = useMutation({
    mutationFn: (
      d: Omit<APISIXType['Route'], 'id' | 'create_time' | 'update_time'>
    ) => postRouteRawReq(req, d),
    async onSuccess(res) {
      notifications.show({
        message: t('info.add.success', { name: t('routes.singular') }),
        color: 'green',
      });
      await navigate(res);
    },
    onError(error) {
      notifications.show({
        message: error instanceof Error ? error.message : t('form.view.jsonParseError'),
        color: 'red',
      });
    },
  });

  const handleSave = async (): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonValue);
      // Remove fields that should not be sent on create
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, create_time: _ct, update_time: _ut, ...dataToCreate } = parsed;
      await postRoute.mutateAsync(dataToCreate);
      return true;
    } catch (error) {
      notifications.show({
        message: error instanceof Error ? error.message : t('form.view.jsonParseError'),
        color: 'red',
      });
      return false;
    }
  };

  return (
    <JSONEditorView
      value={jsonValue}
      readOnly={false}
      onSave={handleSave}
      onChange={setJsonValue}
      isSaving={postRoute.isPending}
    />
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mode } = useSearch({ from: '/routes/add' });

  const navigateToDetail = (res: APISIXType['RespRouteDetail']) =>
    navigate({
      to: '/routes/detail/$id',
      params: { id: res.data.value.id },
    });

  const isJsonMode = mode === 'json';
  const title = isJsonMode
    ? `${t('info.add.title', { name: t('routes.singular') })} (JSON)`
    : t('info.add.title', { name: t('routes.singular') });

  return (
    <>
      <PageHeader title={title} />
      {isJsonMode ? (
        <RouteAddJSON navigate={navigateToDetail} />
      ) : (
        <FormTOCBox>
          <RouteAddForm
            navigate={navigateToDetail}
            defaultValues={FORM_DEFAULT_VALUES}
          />
        </FormTOCBox>
      )}
    </>
  );
}

export const Route = createFileRoute('/routes/add')({
  component: RouteComponent,
  validateSearch: searchSchema,
});
