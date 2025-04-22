import { AppShellNavbar, NavLink, NavLinkProps } from '@mantine/core';

import * as React from 'react';
import { createLink, LinkComponent } from '@tanstack/react-router';
import { navRoutes } from '../config/navRoutes';
import { useTranslation } from 'react-i18next';

const MantineLinkComponent = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  (props, ref) => {
    return <NavLink ref={ref} {...props} />;
  }
);

const CreatedLinkComponent = createLink(MantineLinkComponent);

export const NavbarLink: LinkComponent<typeof MantineLinkComponent> = (
  props
) => {
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
