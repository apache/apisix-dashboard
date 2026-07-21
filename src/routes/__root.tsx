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
import { AppShell, Button, Code, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  createRootRoute,
  type ErrorComponentProps,
  HeadContent,
  Outlet,
  useRouter,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { useEffect } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';

import { Header } from '@/components/Header';
import { Navbar } from '@/components/Navbar';
import { SettingsModal } from '@/components/page/SettingsModal';
import {
  APPSHELL_HEADER_HEIGHT,
  APPSHELL_NAVBAR_WIDTH,
} from '@/config/constant';
import i18n from '@/config/i18n';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const RootShell = () => {
  const [opened, { toggle }] = useDisclosure(false);
  useDocumentTitle();
  return (
    <>
      <HeadContent />
      <AppShell
        header={{ height: APPSHELL_HEADER_HEIGHT }}
        navbar={{
          width: APPSHELL_NAVBAR_WIDTH,
          breakpoint: 'sm',
          collapsed: { mobile: !opened },
        }}
        padding="md"
      >
        <Header opened={opened} toggle={toggle} />

        <Navbar />

        <AppShell.Main>
          <Outlet />
        </AppShell.Main>
      </AppShell>
      {import.meta.env.MODE !== 'test' && (
        <>
          <TanStackRouterDevtools />
          <ReactQueryDevtools initialIsOpen={false} />
        </>
      )}
      <SettingsModal />
    </>
  );
};

const Root = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <RootShell />
    </I18nextProvider>
  );
};

const RootErrorContent = (props: ErrorComponentProps) => {
  const { error } = props;
  const { t } = useTranslation();
  const router = useRouter();
  // detail pages throw from useSuspenseQuery during render; unless the
  // query error-reset boundary is reset, react-query re-throws the cached
  // error on remount and the Retry button would loop back here
  const queryErrorResetBoundary = useQueryErrorResetBoundary();
  useEffect(() => {
    queryErrorResetBoundary.reset();
  }, [queryErrorResetBoundary]);
  return (
    <Stack align="center" justify="center" mih="60vh" gap="md" p="xl">
      <Text fw={700} size="lg">
        {t('error.title')}
      </Text>
      <Code block>{error.message}</Code>
      <Button onClick={() => router.invalidate()}>{t('error.retry')}</Button>
    </Stack>
  );
};

/**
 * Loader/render failures land here when no child route handles them.
 * The settings modal must stay mounted: on a fresh install every request
 * 401s until the admin key is entered, and the modal is the only way in.
 */
const RootError = (props: ErrorComponentProps) => (
  <I18nextProvider i18n={i18n}>
    <RootErrorContent {...props} />
    <SettingsModal />
  </I18nextProvider>
);

export const Route = createRootRoute({
  component: Root,
  errorComponent: RootError,
});
