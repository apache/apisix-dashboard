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

import { postProtoReq } from '@/apis/protos';
import { FormSubmitBtn } from '@/components/form/Btn';
import { FormPartProto } from '@/components/form-slice/FormPartProto';
import { JSONEditorView } from '@/components/page/JSONEditorView';
import PageHeader from '@/components/page/PageHeader';
import { PreviewJSONModal } from '@/components/page/PreviewJSONModal';
import { req } from '@/config/req';
import type { APISIXType } from '@/types/schema/apisix';
import { APISIXProtos } from '@/types/schema/apisix/protos';
import IconCode from '~icons/material-symbols/code';

// Search params schema
const searchSchema = z.object({
  mode: z.enum(['form', 'json']).optional().default('form'),
});

// Proto creation template
const PROTO_TEMPLATE = {
  content: '',
};

const defaultValues: APISIXType['ProtoPost'] = {
  content: '',
};

type Props = {
  onSuccess: () => Promise<void>;
};

// Preview JSON button component (needs form context)
const PreviewJSONButton = () => {
  const { t } = useTranslation();
  const [opened, { open, close }] = useDisclosure(false);
  const { getValues } = useFormContext<APISIXType['ProtoPost']>();
  const [previewJson, setPreviewJson] = useState('{}');

  const handlePreview = () => {
    const formData = getValues();
    setPreviewJson(JSON.stringify(formData, null, 2));
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

const ProtoAddForm = (props: Props) => {
  const { onSuccess } = props;
  const { t } = useTranslation();
  const router = useRouter();

  const postProto = useMutation({
    mutationFn: (d: APISIXType['ProtoPost']) => postProtoReq(req, d),
    async onSuccess() {
      notifications.show({
        message: t('info.add.success', { name: t('protos.singular') }),
        color: 'green',
      });
      await onSuccess();
    },
  });

  const form = useForm({
    resolver: zodResolver(APISIXProtos.ProtoPost),
    shouldUnregister: true,
    shouldFocusError: true,
    defaultValues,
    mode: 'onChange',
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((d) => postProto.mutateAsync(d))}>
        <FormPartProto />
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

const ProtoAddJSON = (props: Props) => {
  const { onSuccess } = props;
  const { t } = useTranslation();
  const [jsonValue, setJsonValue] = useState(
    JSON.stringify(PROTO_TEMPLATE, null, 2)
  );

  const postProto = useMutation({
    mutationFn: (d: APISIXType['ProtoPost']) => postProtoReq(req, d),
    async onSuccess() {
      notifications.show({
        message: t('info.add.success', { name: t('protos.singular') }),
        color: 'green',
      });
      await onSuccess();
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
      await postProto.mutateAsync(dataToCreate);
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
      isSaving={postProto.isPending}
    />
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mode } = useSearch({ from: '/protos/add' });

  const handleSuccess = () => navigate({ to: '/protos' });

  const isJsonMode = mode === 'json';
  const title = isJsonMode
    ? `${t('info.add.title', { name: t('protos.singular') })} (JSON)`
    : t('info.add.title', { name: t('protos.singular') });

  return (
    <>
      <PageHeader title={title} />
      {isJsonMode ? (
        <ProtoAddJSON onSuccess={handleSuccess} />
      ) : (
        <ProtoAddForm onSuccess={handleSuccess} />
      )}
    </>
  );
}

export const Route = createFileRoute('/protos/add')({
  component: RouteComponent,
  validateSearch: searchSchema,
});
