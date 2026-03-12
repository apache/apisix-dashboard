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
import { SegmentedControl, useMantineColorScheme } from '@mantine/core';
import { useCallback, useEffect, useRef } from 'react';

import IconDarkMode from '~icons/material-symbols/dark-mode';
import IconDesktop from '~icons/material-symbols/desktop-windows';
import IconLightMode from '~icons/material-symbols/light-mode';

const TRANSITION_DURATION_MS = 250;

const iconStyle = { width: 14, height: 14 } as const;

const segmentData = [
  { value: 'light', label: <IconLightMode style={iconStyle} /> },
  { value: 'dark', label: <IconDarkMode style={iconStyle} /> },
  { value: 'auto', label: <IconDesktop style={iconStyle} /> },
];

export const ThemeToggle = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme({
    keepTransitions: true,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      // Clear any pending transition timer from a previous rapid toggle
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      document.body.classList.add('theme-transitioning');
      setColorScheme(value as 'light' | 'dark' | 'auto');

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
