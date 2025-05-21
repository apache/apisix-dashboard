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
    <Card withBorder radius="md" p="md" data-testid={`plugin-${name}`}>
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
            size="compact-xs"
            variant="light"
            color="blue"
            onClick={() => onAdd?.(name)}
          >
            {t('form.btn.add')}
          </Button>
        )}
        {mode === 'view' && (
          <Button
            size="compact-xs"
            variant="light"
            onClick={() => onView?.(name)}
          >
            {t('form.btn.view')}
          </Button>
        )}
        {mode === 'edit' && (
          <>
            <Button
              size="compact-xs"
              variant="light"
              color="blue"
              onClick={() => onEdit?.(name)}
            >
              {t('form.btn.edit')}
            </Button>
            <Button
              size="compact-xs"
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
