import { RouteLinkBtn } from '@/components/Btn';
import IconPlus from '~icons/material-symbols/add';
import { useTranslation } from 'react-i18next';
import type { FileRoutesByTo } from '@/routeTree.gen';
import type { LinkProps } from '@tanstack/react-router';

type FilterKeys<T, R extends string> = {
  [K in keyof T as K extends `${string}${R}` ? K : never]: T[K];
};
type ToAddPageBtnProps = {
  to: keyof FilterKeys<FileRoutesByTo, 'add'>;
  label: string;
} & Pick<LinkProps, 'params'>;

export const ToAddPageBtn = ({ to, params, label }: ToAddPageBtnProps) => {
  return (
    <RouteLinkBtn
      leftSection={<IconPlus />}
      size="compact-sm"
      variant="gradient"
      to={to}
      params={params}
    >
      {label}
    </RouteLinkBtn>
  );
};

type ToDetailPageBtnProps = {
  to: keyof FilterKeys<FileRoutesByTo, '$id'> | keyof FilterKeys<FileRoutesByTo, '$username'>;
} & Pick<LinkProps, 'params'>;
export const ToDetailPageBtn = (props: ToDetailPageBtnProps) => {
  const { params, to } = props;
  const { t } = useTranslation();
  return (
    <>
      <RouteLinkBtn size="xs" variant="transparent" to={to} params={params}>
        {t('view')}
      </RouteLinkBtn>
    </>
  );
};
