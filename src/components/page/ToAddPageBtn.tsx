import { RouteLinkBtn } from '@/components/Btn';
import IconPlus from '~icons/material-symbols/add';
import { useTranslation } from 'react-i18next';
import type { FileRoutesByTo } from '@/routeTree.gen';

type FilterKeys<T, R extends string> = {
  [K in keyof T as K extends `${string}${R}` ? K : never]: T[K];
};
type ToAddPageBtnProps = {
  to: keyof FilterKeys<FileRoutesByTo, 'add'>;
  label: string;
};

export const ToAddPageBtn = ({ to, label }: ToAddPageBtnProps) => {
  return (
    <RouteLinkBtn
      leftSection={<IconPlus />}
      size="compact-sm"
      variant="gradient"
      to={to}
    >
      {label}
    </RouteLinkBtn>
  );
};

export default ToAddPageBtn;

type ToDetailPageBtnProps = {
  id: string;
  to: keyof FilterKeys<FileRoutesByTo, '$id'>;
};
export const ToDetailPageBtn = (props: ToDetailPageBtnProps) => {
  const { id, to } = props;
  const { t } = useTranslation();
  return (
    <>
      <RouteLinkBtn size="xs" variant="transparent" to={to} params={{ id }}>
        {t('view')}
      </RouteLinkBtn>
    </>
  );
};
