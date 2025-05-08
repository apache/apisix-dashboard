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
