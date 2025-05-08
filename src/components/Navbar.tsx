import { AppShellNavbar, NavLink, type NavLinkProps } from '@mantine/core';
import { createLink } from '@tanstack/react-router';
import type { FC } from 'react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { navRoutes } from '@/config/navRoutes';

const MantineLinkComponent = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  (props, ref) => {
    return <NavLink ref={ref} {...props} />;
  }
);
MantineLinkComponent.displayName = 'MantineLinkComponent';

const CreatedLinkComponent = createLink(MantineLinkComponent);

interface NavbarLinkProps extends NavLinkProps {
  to: string;
}

export const NavbarLink: FC<NavbarLinkProps> = (props) => {
  return (
    <CreatedLinkComponent
      key={props.to}
      preload="intent"
      href={props.to}
      {...props}
    />
  );
};

export const Navbar = () => {
  const { t } = useTranslation();
  return (
    <AppShellNavbar>
      {navRoutes.map((route) => (
        <NavbarLink
          {...route}
          key={route.to}
          label={t(`navbar.${route.label}`)}
        />
      ))}
    </AppShellNavbar>
  );
};
