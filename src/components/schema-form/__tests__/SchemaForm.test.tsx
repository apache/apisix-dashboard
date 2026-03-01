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

import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SchemaForm } from '../SchemaForm';
import type { JSONSchema } from '../types';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

describe('SchemaForm', () => {
  it('renders string fields', () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'API key' },
      },
      required: ['key'],
    };

    render(<SchemaForm schema={schema} />, { wrapper });
    expect(screen.getByLabelText(/key/i)).toBeInTheDocument();
  });

  it('renders number fields', () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        timeout: { type: 'integer', minimum: 1, default: 3 },
      },
    };

    render(<SchemaForm schema={schema} />, { wrapper });
    expect(screen.getByLabelText(/timeout/i)).toBeInTheDocument();
  });

  it('renders boolean fields', () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        ssl_verify: { type: 'boolean', default: true },
      },
    };

    render(<SchemaForm schema={schema} />, { wrapper });
    expect(screen.getByLabelText(/ssl verify/i)).toBeInTheDocument();
  });

  it('renders enum fields as select', () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        policy: {
          type: 'string',
          enum: ['local', 'redis', 'redis-cluster'],
          default: 'local',
        },
      },
    };

    render(<SchemaForm schema={schema} />, { wrapper });
    // Mantine Select renders label text + a combobox input
    expect(screen.getByText('Policy')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders nested object fields', () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        timeout: {
          type: 'object',
          properties: {
            connect: { type: 'number' },
            send: { type: 'number' },
            read: { type: 'number' },
          },
          required: ['connect', 'send', 'read'],
        },
      },
    };

    render(<SchemaForm schema={schema} />, { wrapper });
    expect(screen.getByText(/timeout/i)).toBeInTheDocument();
  });

  it('shows alert for empty schema', () => {
    render(<SchemaForm schema={{}} />, { wrapper });
    expect(screen.getByText(/no renderable schema/i)).toBeInTheDocument();
  });

  it('renders a key-auth-like schema', () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        header: { type: 'string', default: 'apikey' },
        query: { type: 'string', default: 'apikey' },
        hide_credentials: { type: 'boolean', default: false },
      },
    };

    render(<SchemaForm schema={schema} />, { wrapper });
    expect(screen.getByLabelText(/header/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/query/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hide credentials/i)).toBeInTheDocument();
  });

  it('renders password input for encrypt fields', () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        client_id: { type: 'string' },
        client_secret: { type: 'string' },
      },
      encrypt_fields: ['client_secret'],
    };

    render(<SchemaForm schema={schema} />, { wrapper });
    expect(screen.getByLabelText(/client id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/client secret/i)).toBeInTheDocument();
  });

  it('renders submit button when onSubmit is provided', () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        key: { type: 'string' },
      },
    };

    render(<SchemaForm schema={schema} onSubmit={() => {}} />, { wrapper });
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('does not render submit button when onSubmit is not provided', () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        key: { type: 'string' },
      },
    };

    render(<SchemaForm schema={schema} />, { wrapper });
    expect(screen.queryByRole('button', { name: /submit/i })).not.toBeInTheDocument();
  });
});
