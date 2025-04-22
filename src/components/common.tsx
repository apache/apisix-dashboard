import { NavLink, NavLinkProps } from '@mantine/core';

import * as React from 'react';
import { createLink, LinkComponent } from '@tanstack/react-router';

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
