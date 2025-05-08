import { AppShell } from '@mantine/core';
import { HeadContent } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useDisclosure } from '@mantine/hooks';
import { Navbar } from '@/components/page/Navbar';
import { Header } from '@/components/Header';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/config/i18n';
import {
  APPSHELL_HEADER_HEIGHT,
  APPSHELL_NAVBAR_WIDTH,
} from '@/config/constant';
import type { PropsWithChildren } from 'react';

export const Layout = ({ children }: PropsWithChildren) => {
  const [opened, { toggle }] = useDisclosure(false);
  return (
    <I18nextProvider i18n={i18n}>
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

        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>
      <TanStackRouterDevtools />
      <ReactQueryDevtools initialIsOpen={false} />
    </I18nextProvider>
  );
};
