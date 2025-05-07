import { Tabs, type TabsItem } from '@/components/page/Tabs';
import { useLocation, useNavigate, useParams } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const DetailCredentialsTabs = () => {
  const { t } = useTranslation();
  const { username } = useParams({ strict: false });
  const navigate = useNavigate();
  const pathname = useLocation({
    select: (location) => location.pathname,
  });

  const items = useMemo(
    (): TabsItem[] => [
      {
        value: 'detail',
        label: t('consumers.detail.title'),
      },
      {
        value: 'credentials',
        label: t('consumers.credentials.title'),
      },
    ],
    [t]
  );
  return (
    <Tabs
      items={items}
      variant="outline"
      value={pathname.includes('credentials') ? 'credentials' : 'detail'}
      onChange={(v) => {
        navigate({
          to:
            v === 'credentials'
              ? '/consumers/detail/$username/credentials'
              : '/consumers/detail/$username',
          params: { username: username as string },
        });
      }}
    />
  );
};
