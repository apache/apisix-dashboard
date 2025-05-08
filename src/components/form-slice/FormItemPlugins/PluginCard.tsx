import { Button, Card,Group, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

export type PluginCardProps = {
  name: string;
  desc?: string;
  mode: 'add' | 'edit' | 'view';
  onAdd?: (name: string) => void;
  onEdit?: (name: string) => void;
  onDelete?: (name: string) => void;
  onView?: (name: string) => void;
};

export const PluginCard = (props: PluginCardProps) => {
  const { name, desc, mode, onAdd, onEdit, onView, onDelete } = props;
  const { t } = useTranslation();
  return (
    <Card withBorder radius="md" p="md">
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify="space-between">
          <Group>
            <Text fw={500}>{name}</Text>
          </Group>
        </Group>
      </Card.Section>

      <Text size="sm" c="dimmed" mt="xs">
        {desc}
      </Text>

      <Group mt="md" justify="flex-end">
        {mode === 'add' && (
          <Button
            size="xs"
            variant="light"
            color="blue"
            onClick={() => onAdd?.(name)}
          >
            {t('form.btn.add')}
          </Button>
        )}
        {mode === 'view' && (
          <Button size="xs" variant="light" onClick={() => onView?.(name)}>
            {t('form.btn.view')}
          </Button>
        )}
        {mode === 'edit' && (
          <>
            <Button
              size="xs"
              variant="light"
              color="blue"
              onClick={() => onEdit?.(name)}
            >
              {t('form.btn.edit')}
            </Button>
            <Button
              size="xs"
              variant="light"
              color="red"
              onClick={() => onDelete?.(name)}
            >
              {t('form.btn.delete')}
            </Button>
          </>
        )}
      </Group>
    </Card>
  );
};
