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
import { ActionIcon } from '@mantine/core';
import { Spotlight, spotlight } from '@mantine/spotlight';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { navRoutes } from '@/config/navRoutes';
import IconClose from '~icons/material-symbols/close';
import IconDashboard from '~icons/material-symbols/dashboard-outline';
import IconSearch from '~icons/material-symbols/search';

export const GlobalSpotlight = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const actions = navRoutes.map((route) => ({
        id: route.to,
        label: t(`sources.${route.label}`),
        description: `Jump to ${t(`sources.${route.label}`)} dashboard`,
        leftSection: <IconDashboard style={{ width: 18, height: 18, opacity: 0.7 }} />,
        onClick: () => {
            navigate({ to: route.to });
        },
    }));

    return (
        <Spotlight
            actions={actions}
            nothingFound={t('noData')}
            highlightQuery
            scrollAreaProps={{ type: 'always', offsetScrollbars: true, mah: 400 }}
            searchProps={{
                leftSection: <IconSearch style={{ width: 22, height: 22 }} />,
                placeholder: 'Search resources... (Ctrl + K)',
                rightSectionPointerEvents: 'all',
                rightSection: (
                    <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={(e) => {
                            e.preventDefault();
                            spotlight.close();
                        }}
                    >
                        <IconClose style={{ width: 18, height: 18 }} />
                    </ActionIcon>
                ),
            }}
        />
    );
};
