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
import {
  Button,
  type ButtonProps,
  type PolymorphicComponentProps,
} from '@mantine/core';
import type { LinkProps } from '@tanstack/react-router';
import { useFormContext, useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { RouteLinkBtn } from '@/components/Btn';

export const FormSubmitBtn = (
  props: PolymorphicComponentProps<'button', ButtonProps>
) => {
  const form = useFormContext();
  const { isSubmitting } = useFormState(form);
  return <Button type="submit" loading={isSubmitting} {...props} />;
};

export type FormCancelBtnProps = Pick<LinkProps, 'to' | 'params'>;

/**
 * Abandon a form and go back to its list page. Rendered as a router link
 * so a dirty form routes it through the same navigation guard as any
 * other navigation — no separate confirmation code path.
 */
export const FormCancelBtn = ({ to, params }: FormCancelBtnProps) => {
  const { t } = useTranslation();
  return (
    <RouteLinkBtn variant="outline" to={to} params={params}>
      {t('form.btn.cancel')}
    </RouteLinkBtn>
  );
};
