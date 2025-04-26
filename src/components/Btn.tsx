import { Button, type ButtonProps } from '@mantine/core';
import { createLink } from '@tanstack/react-router';
import { forwardRef } from 'react';

const MantineBtnLinkComponent = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    return <Button ref={ref} {...props} />;
  }
);
MantineBtnLinkComponent.displayName = 'RouteLinkBtn';

export const RouteLinkBtn = createLink(MantineBtnLinkComponent);
