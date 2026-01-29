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

import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface SafeTabSwitchProps {
  /** Whether there are unsaved changes */
  isDirty: boolean;
  /** Current active tab value */
  activeTab: string;
  /** Callback when tab change is requested */
  onTabChange: (tab: string) => void;
  /** Optional: Callback to save before switching (returns true if save succeeded) */
  onSave?: () => Promise<boolean>;
  /** Optional: Callback when user confirms discarding changes */
  onDiscard?: () => void;
  /** Whether save is in progress */
  isSaving?: boolean;
  /** Children (should contain Tabs component) */
  children: ReactNode;
}

/**
 * SafeTabSwitch Component
 *
 * Wraps tab navigation to intercept changes when there are unsaved edits.
 * Shows a confirmation modal with options to:
 * - Save and Switch
 * - Discard and Switch
 * - Cancel
 *
 * @example
 * ```tsx
 * <SafeTabSwitch
 *   isDirty={unifiedState.isDirty}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   onSave={handleSave}
 *   onDiscard={handleDiscard}
 * >
 *   <Tabs value={activeTab}>...</Tabs>
 * </SafeTabSwitch>
 * ```
 */
export const SafeTabSwitch = (props: SafeTabSwitchProps) => {
  const {
    isDirty,
    activeTab,
    onTabChange,
    onSave,
    onDiscard,
    isSaving = false,
    children,
  } = props;

  const { t } = useTranslation();
  const [
    warningOpened,
    { open: openWarning, close: closeWarning },
  ] = useDisclosure(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [isSavingLocal, setIsSavingLocal] = useState(false);

  /**
   * Handle tab change request
   * If dirty, show warning modal instead of switching immediately
   */
  const handleTabChangeRequest = useCallback(
    (newTab: string) => {
      if (newTab === activeTab) return;

      if (isDirty) {
        setPendingTab(newTab);
        openWarning();
      } else {
        onTabChange(newTab);
      }
    },
    [activeTab, isDirty, onTabChange, openWarning]
  );

  /**
   * Handle "Discard and Switch" action
   */
  const handleDiscard = useCallback(() => {
    if (pendingTab) {
      onDiscard?.();
      onTabChange(pendingTab);
      setPendingTab(null);
    }
    closeWarning();
  }, [pendingTab, onDiscard, onTabChange, closeWarning]);

  /**
   * Handle "Save and Switch" action
   */
  const handleSaveAndSwitch = useCallback(async () => {
    if (!onSave || !pendingTab) return;

    setIsSavingLocal(true);
    try {
      const success = await onSave();
      if (success) {
        onTabChange(pendingTab);
        setPendingTab(null);
        closeWarning();
      }
      // If save failed, keep modal open so user can try again or discard
    } finally {
      setIsSavingLocal(false);
    }
  }, [onSave, pendingTab, onTabChange, closeWarning]);

  /**
   * Handle "Cancel" action
   */
  const handleCancel = useCallback(() => {
    setPendingTab(null);
    closeWarning();
  }, [closeWarning]);

  const isAnySaving = isSaving || isSavingLocal;

  return (
    <>
      {/* Wrap children and intercept tab changes */}
      <div
        onClick={(e) => {
          // Intercept clicks on tab buttons
          const target = e.target as HTMLElement;
          const tabButton = target.closest('[role="tab"]');

          if (tabButton) {
            const tabValue = tabButton.getAttribute('data-value');
            if (tabValue && tabValue !== activeTab) {
              e.preventDefault();
              e.stopPropagation();
              handleTabChangeRequest(tabValue);
            }
          }
        }}
      >
        {children}
      </div>

      {/* Warning Modal */}
      <Modal
        opened={warningOpened}
        onClose={handleCancel}
        title={t('form.view.unsavedChanges')}
        centered
        closeOnClickOutside={!isAnySaving}
        closeOnEscape={!isAnySaving}
      >
        <Stack gap="md">
          <Text size="sm">
            {t('form.view.unsavedChanges')}
          </Text>

          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              onClick={handleCancel}
              disabled={isAnySaving}
            >
              {t('form.btn.cancel')}
            </Button>

            <Button
              variant="outline"
              color="red"
              onClick={handleDiscard}
              disabled={isAnySaving}
            >
              {t('form.view.discardAndSwitch')}
            </Button>

            {onSave && (
              <Button
                onClick={handleSaveAndSwitch}
                loading={isAnySaving}
              >
                {t('form.view.saveAndSwitch')}
              </Button>
            )}
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

/**
 * Context for SafeTabSwitch to allow child components to request tab changes
 */
export interface SafeTabSwitchContextValue {
  requestTabChange: (tab: string) => void;
  activeTab: string;
  isDirty: boolean;
}
