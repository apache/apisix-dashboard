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
import { SegmentedControl, useMantineColorScheme, VisuallyHidden } from '@mantine/core';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import IconDarkMode from '~icons/material-symbols/dark-mode';
import IconDesktop from '~icons/material-symbols/desktop-windows';
import IconLightMode from '~icons/material-symbols/light-mode';

const TRANSITION_DURATION_MS = 200;
const COLOR_SCHEMES = ['light', 'dark', 'auto'] as const;

type ColorSchemeValue = (typeof COLOR_SCHEMES)[number];

const isColorSchemeValue = (value: string): value is ColorSchemeValue =>
  (COLOR_SCHEMES as readonly string[]).includes(value);

const iconStyle = { width: 14, height: 14 } as const;

export const ThemeToggle = () => {
  const { t } = useTranslation();
  const { colorScheme, setColorScheme } = useMantineColorScheme({
    keepTransitions: true,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const segmentData = [
    {
      value: 'light',
      label: (
        <>
          <VisuallyHidden>{t('settings.theme.light')}</VisuallyHidden>
          <IconLightMode style={iconStyle} />
        </>
      ),
    },
    {
      value: 'dark',
      label: (
        <>
          <VisuallyHidden>{t('settings.theme.dark')}</VisuallyHidden>
          <IconDarkMode style={iconStyle} />
        </>
      ),
    },
    {
      value: 'auto',
      label: (
        <>
          <VisuallyHidden>{t('settings.theme.auto')}</VisuallyHidden>
          <IconDesktop style={iconStyle} />
        </>
      ),
    },
  ];

  // Clean up pending transition timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        document.body.classList.remove('theme-transitioning');
      }
    };
  }, []);

  const handleChange = useCallback(
    (value: string) => {
      if (!isColorSchemeValue(value)) {
        return;
      }

      // Clear any pending transition timer from a previous rapid toggle
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      document.body.classList.add('theme-transitioning');
      setColorScheme(value);

      timerRef.current = setTimeout(() => {
        document.body.classList.remove('theme-transitioning');
        timerRef.current = null;
      }, TRANSITION_DURATION_MS);
    },
    [setColorScheme]
  );

  return (
    <SegmentedControl
      size="xs"
      value={colorScheme}
      onChange={handleChange}
      data={segmentData}
    />
  );
};
