import React from 'react';
import { Title, Text, Box, Group, Stack, useMantineTheme } from '@mantine/core';

interface PageHeaderProps {
  title: string;
  desc?: string;
  extra?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, desc, extra }) => {
  const theme = useMantineTheme();

  return (
    <Box
      py="md"
      mb="lg"
      style={{
        borderBottom: `1px solid ${theme.colors.gray[3]}`,
      }}
    >
      <Group justify="space-between" align="flex-start">
        <Stack gap="xs">
          <Title order={2}>{title}</Title>
          {desc && (
            <Text c="gray" size="sm">
              {desc}
            </Text>
          )}
        </Stack>
        {extra}
      </Group>
    </Box>
  );
};

export default PageHeader;
