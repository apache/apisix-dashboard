import { AppShell, AppShellNavbar, Burger } from '@mantine/core';
import { createRootRoute, HeadContent, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { useDisclosure } from '@mantine/hooks';
import { navRoutes } from '../config/navRoutes';
import { NavbarLink } from '../components/common';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

type HeaderProps = {
  opened: boolean;
  toggle: () => void;
};
const Header: FC<HeaderProps> = (props) => {
  const { opened, toggle } = props;
  const { t } = useTranslation();
  return (
    <AppShell.Header>
      <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
      <div>{t('APISIX Dashboard')}</div>
    </AppShell.Header>
  );
};
const Navbar = () => {
  console.log('Navbar', navRoutes);

  return (
    <AppShellNavbar>
      {navRoutes.map((route) => (
        <NavbarLink key={route.to} {...route} />
      ))}
    </AppShellNavbar>
  );
};

const Root = () => {
  const [opened, { toggle }] = useDisclosure(false);
  return (
    <>
      <HeadContent />
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 250,
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
      <TanStackRouterDevtools />
    </>
  );
};

export const Route = createRootRoute({
  component: Root,
});
