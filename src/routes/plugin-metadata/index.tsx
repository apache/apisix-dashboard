import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/components/page/PageHeader';
import { PluginMetadata } from '@/components/page-slice/plugin-metadata/PluginMetadata';

function RouteComponent() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader title={t('pluginMetadata.title')} />
      <PluginMetadata />
    </>
  );
}

export const Route = createFileRoute('/plugin-metadata/')({
  component: RouteComponent,
});
