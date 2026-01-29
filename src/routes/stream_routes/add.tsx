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
import {
  createFileRoute,
  useNavigate,
  useRouter,
  useSearch,
} from '@tanstack/react-router';
import { useState } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { postStreamRouteReq } from '@/apis/stream_routes';
import { FormSubmitBtn } from '@/components/form/Btn';
import { produceRoute } from '@/components/form-slice/FormPartRoute/util';
import { FormPartStreamRoute } from '@/components/form-slice/FormPartStreamRoute';
import {
  StreamRoutePostSchema,
  type StreamRoutePostType,
} from '@/components/form-slice/FormPartStreamRoute/schema';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { JSONEditorView } from '@/components/page/JSONEditorView';
import PageHeader from '@/components/page/PageHeader';
import { PreviewJSONModal } from '@/components/page/PreviewJSONModal';
import { StreamRoutesErrorComponent } from '@/components/page-slice/stream_routes/ErrorComponent';
import { req } from '@/config/req';
import type { APISIXType } from '@/types/schema/apisix';
import IconCode from '~icons/material-symbols/code';

// Search params schema
const searchSchema = z.object({
  mode: z.enum(['form', 'json']).optional().default('form'),
});

// Stream Route creation template
const STREAM_ROUTE_TEMPLATE = {
  server_port: 9100,
  upstream: {
    type: 'roundrobin',
    nodes: {
      '127.0.0.1:9000': 1,
    },
  },
};

type Props = {
  navigate: (res: APISIXType['RespStreamRouteDetail']) => Promise<void>;
  defaultValues?: Partial<StreamRoutePostType>;
};

// Preview JSON button component (needs form context)
const PreviewJSONButton = () => {
  const { t } = useTranslation();
  const [opened, { open, close }] = useDisclosure(false);
  const { getValues } = useFormContext<StreamRoutePostType>();
  const [previewJson, setPreviewJson] = useState('{}');

  const handlePreview = () => {
    const formData = getValues();
    const apiData = produceRoute(formData);
    setPreviewJson(JSON.stringify(apiData, null, 2));
    open();
  };

  return (
    <>
      <Button variant="light" leftSection={<IconCode />} onClick={handlePreview}>
        {t('form.view.previewJSON')}
      </Button>
      <PreviewJSONModal opened={opened} onClose={close} json={previewJson} />
    </>
  );
};

export const StreamRouteAddForm = (props: Props) => {
  const { navigate, defaultValues } = props;
  const { t } = useTranslation();
  const router = useRouter();

  const postStreamRoute = useMutation({
    mutationFn: (d: StreamRoutePostType) =>
      postStreamRouteReq(req, produceRoute(d)),
    async onSuccess(res) {
      notifications.show({
        message: t('info.add.success', { name: t('streamRoutes.singular') }),
        color: 'green',
      });
      await navigate(res);
    },
  });

  const form = useForm({
    resolver: zodResolver(StreamRoutePostSchema),
    shouldUnregister: true,
    shouldFocusError: true,
    mode: 'all',
    defaultValues,
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((d) => postStreamRoute.mutateAsync(d))}>
        <FormPartStreamRoute />
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

const StreamRouteAddJSON = (props: Props) => {
  const { navigate } = props;
  const { t } = useTranslation();
  const [jsonValue, setJsonValue] = useState(
    JSON.stringify(STREAM_ROUTE_TEMPLATE, null, 2)
  );

  const postStreamRoute = useMutation({
    mutationFn: (d: Partial<APISIXType['StreamRoute']>) =>
      postStreamRouteReq(req, d),
    async onSuccess(res) {
      notifications.show({
        message: t('info.add.success', { name: t('streamRoutes.singular') }),
        color: 'green',
      });
      await navigate(res);
    },
    onError(error) {
      notifications.show({
        message:
          error instanceof Error ? error.message : t('form.view.jsonParseError'),
        color: 'red',
      });
    },
  });

  const handleSave = async (): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonValue);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, create_time: _ct, update_time: _ut, ...dataToCreate } = parsed;
      await postStreamRoute.mutateAsync(dataToCreate);
      return true;
    } catch (error) {
      notifications.show({
        message:
          error instanceof Error ? error.message : t('form.view.jsonParseError'),
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
      isSaving={postStreamRoute.isPending}
    />
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mode } = useSearch({ from: '/stream_routes/add' });

  const navigateToDetail = (res: APISIXType['RespStreamRouteDetail']) =>
    navigate({
      to: '/stream_routes/detail/$id',
      params: { id: res.data.value.id },
    });

  const isJsonMode = mode === 'json';
  const title = isJsonMode
    ? `${t('info.add.title', { name: t('streamRoutes.singular') })} (JSON)`
    : t('info.add.title', { name: t('streamRoutes.singular') });

  return (
    <>
      <PageHeader title={title} />
      {isJsonMode ? (
        <StreamRouteAddJSON navigate={navigateToDetail} />
      ) : (
        <FormTOCBox>
          <StreamRouteAddForm navigate={navigateToDetail} />
        </FormTOCBox>
      )}
    </>
  );
}

export const Route = createFileRoute('/stream_routes/add')({
  component: RouteComponent,
  errorComponent: StreamRoutesErrorComponent,
  validateSearch: searchSchema,
});
