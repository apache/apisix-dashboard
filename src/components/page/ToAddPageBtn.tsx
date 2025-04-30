import { type FileRouteTypes } from '@tanstack/react-router';
import { RouteLinkBtn } from '@/components/Btn';
import IconPlus from '~icons/material-symbols/add';

type ToAddPageBtnProps = {
  to: FileRouteTypes['to'];
  label: string;
};

/**
 * A reusable "Add" button component that navigates to a specified route
 */
export const ToAddPageBtn = ({ to: routeId, label }: ToAddPageBtnProps) => {
  return (
    <RouteLinkBtn
      leftSection={<IconPlus />}
      size="compact-sm"
      variant="gradient"
      to={routeId}
    >
      {label}
    </RouteLinkBtn>
  );
};

export default ToAddPageBtn;
