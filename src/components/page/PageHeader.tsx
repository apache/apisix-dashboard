import { Box, Group, Stack,Text, Title } from '@mantine/core';
import { type FC } from 'react';

type PageHeaderProps = {
  title: string;
  desc?: string;
  extra?: React.ReactNode;
};

const PageHeader: FC<PageHeaderProps> = (props) => {
  const { title, desc, extra } = props;
  return (
    <Box py="md" mb="lg">
      <Group justify="space-between" align="center">
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
