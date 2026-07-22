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
/* eslint-disable react-refresh/only-export-components */
import { MantineProvider } from '@mantine/core';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { FormProvider, useForm, type UseFormProps } from 'react-hook-form';

/**
 * Wraps a component with MantineProvider alone.
 * Use for components that need Mantine's theme context but not a form.
 */
export const renderWithMantine = (ui: ReactElement, options?: RenderOptions) =>
    render(<MantineProvider>{ui}</MantineProvider>, options);

type FormWrapperProps = {
    children: ReactElement;
    defaultValues?: UseFormProps['defaultValues'];
};

/**
 * FormWrapper provides both MantineProvider and FormProvider contexts.
 * Required for any SchemaForm component since they use useController / useFormContext.
 */
export const FormWrapper = ({ children, defaultValues }: FormWrapperProps) => {
    const methods = useForm({ defaultValues });
    return (
        <MantineProvider>
            <FormProvider {...methods}>{children}</FormProvider>
        </MantineProvider>
    );
};

/**
 * Renders a component inside FormProvider + MantineProvider.
 * Returns all render result utilities plus the form methods via the wrapper.
 */
export const renderWithForm = (
    ui: ReactElement,
    {
        defaultValues,
        ...options
    }: RenderOptions & { defaultValues?: UseFormProps['defaultValues'] } = {}
) =>
    render(ui, {
        wrapper: ({ children }) => (
            <FormWrapper defaultValues={defaultValues}>{children as ReactElement}</FormWrapper>
        ),
        ...options,
    });
