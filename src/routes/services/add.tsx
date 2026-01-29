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

import { postServiceReq, type ServicePostType } from '@/apis/services';
import { FormSubmitBtn } from '@/components/form/Btn';
import { FormPartService } from '@/components/form-slice/FormPartService';
import { ServicePostSchema } from '@/components/form-slice/FormPartService/schema';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { JSONEditorView } from '@/components/page/JSONEditorView';
import PageHeader from '@/components/page/PageHeader';
import { PreviewJSONModal } from '@/components/page/PreviewJSONModal';
import { req } from '@/config/req';
import type { APISIXType } from '@/types/schema/apisix';
import { produceRmUpstreamWhenHas } from '@/utils/form-producer';
import { pipeProduce } from '@/utils/producer';
import IconCode from '~icons/material-symbols/code';

// Search params schema
const searchSchema = z.object({
  mode: z.enum(['form', 'json']).optional().default('form'),
});

// Service creation template
const SERVICE_TEMPLATE = {
  name: '',
  upstream: {
    type: 'roundrobin',
    nodes: {
      'httpbin.org:80': 1,
    },
  },
};

type Props = {
  navigate: (res: APISIXType['RespServiceDetail']) => Promise<void>;
};

// Preview JSON button component (needs form context)
const PreviewJSONButton = () => {
  const { t } = useTranslation();
  const [opened, { open, close }] = useDisclosure(false);
  const { getValues } = useFormContext<ServicePostType>();
  const [previewJson, setPreviewJson] = useState('{}');

  const handlePreview = () => {
    const formData = getValues();
    const apiData = pipeProduce(produceRmUpstreamWhenHas('upstream_id'))(formData);
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

const ServiceAddForm = (props: Props) => {
  const { navigate } = props;
  const { t } = useTranslation();
  const router = useRouter();

  const postService = useMutation({
    mutationFn: (d: ServicePostType) =>
      postServiceReq(
        req,
        pipeProduce(produceRmUpstreamWhenHas('upstream_id'))(d)
      ),
    async onSuccess(res) {
      notifications.show({
        message: t('info.add.success', { name: t('services.singular') }),
        color: 'green',
      });
      await navigate(res);
    },
  });

  const form = useForm({
    resolver: zodResolver(ServicePostSchema),
    shouldUnregister: true,
    shouldFocusError: true,
    mode: 'all',
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((d) => postService.mutateAsync(d))}>
        <FormPartService />
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

const ServiceAddJSON = (props: Props) => {
  const { navigate } = props;
  const { t } = useTranslation();
  const [jsonValue, setJsonValue] = useState(
    JSON.stringify(SERVICE_TEMPLATE, null, 2)
  );

  const postService = useMutation({
    mutationFn: (d: Partial<APISIXType['Service']>) => postServiceReq(req, d),
    async onSuccess(res) {
      notifications.show({
        message: t('info.add.success', { name: t('services.singular') }),
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
      await postService.mutateAsync(dataToCreate);
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
      isSaving={postService.isPending}
    />
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mode } = useSearch({ from: '/services/add' });

  const navigateToDetail = (res: APISIXType['RespServiceDetail']) =>
    navigate({
      to: '/services/detail/$id',
      params: { id: res.data.value.id },
    });

  const isJsonMode = mode === 'json';
  const title = isJsonMode
    ? `${t('info.add.title', { name: t('services.singular') })} (JSON)`
    : t('info.add.title', { name: t('services.singular') });

  return (
    <>
      <PageHeader title={title} />
      {isJsonMode ? (
        <ServiceAddJSON navigate={navigateToDetail} />
      ) : (
        <FormTOCBox>
          <ServiceAddForm navigate={navigateToDetail} />
        </FormTOCBox>
      )}
    </>
  );
}

export const Route = createFileRoute('/services/add')({
  component: RouteComponent,
  validateSearch: searchSchema,
});
