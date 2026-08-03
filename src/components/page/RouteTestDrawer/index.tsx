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
  ActionIcon,
  Alert,
  Badge,
  Button,
  Code,
  Collapse,
  CopyButton,
  Drawer,
  Group,
  ScrollArea,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getRouteQueryOptions } from '@/apis/hooks';
import IconClose from '~icons/tabler/x';

import { type LiveResult, sendLive } from './sendLive';
import {
  deriveFromRoute,
  HTTP_METHODS,
  METHODS_WITH_BODY,
  type TestHeader,
  type TestRequest,
  toCurl,
} from './util';

const GATEWAY_URL_KEY = 'test-request:gatewayUrl';

const statusColor = (status: number) => {
  if (status < 300) return 'green';
  if (status < 500) return 'yellow';
  return 'red';
};

const prettyBody = (body: string) => {
  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    return body;
  }
};

type Props = { opened: boolean; onClose: () => void; id: string };

export const RouteTestDrawer = (props: Props) => {
  const { opened, onClose, id } = props;
  const { t } = useTranslation();
  const routeQuery = useQuery({ ...getRouteQueryOptions(id), enabled: opened });
  const route = routeQuery.data?.value;

  const [gatewayUrl, setGatewayUrl] = useState(
    () => localStorage.getItem(GATEWAY_URL_KEY) ?? ''
  );
  const [req, setReq] = useState<TestRequest | null>(null);
  const [result, setResult] = useState<LiveResult | null>(null);
  const [sending, setSending] = useState(false);
  const [headersOpen, setHeadersOpen] = useState(false);
  const sendTokenRef = useRef(0);

  // Re-derive prefill whenever the drawer opens for a (freshly loaded) route.
  useEffect(() => {
    if (opened && route) {
      sendTokenRef.current++;
      setSending(false);
      setReq(deriveFromRoute(route));
      setResult(null);
    }
  }, [opened, route]);

  useEffect(() => {
    localStorage.setItem(GATEWAY_URL_KEY, gatewayUrl);
  }, [gatewayUrl]);

  const curl = useMemo(
    () => (req ? toCurl(req, gatewayUrl) : ''),
    [req, gatewayUrl]
  );

  const methodOptions = useMemo(() => {
    const declared = route?.methods ?? [];
    return (declared.length > 0 ? declared : HTTP_METHODS).map((m) => ({
      value: m,
      label: m,
    }));
  }, [route]);

  const patch = (next: Partial<TestRequest>) =>
    setReq((prev) => (prev ? { ...prev, ...next } : prev));

  const setHeader = (i: number, next: Partial<TestHeader>) =>
    setReq((prev) =>
      prev
        ? {
            ...prev,
            headers: prev.headers.map((h, idx) =>
              idx === i ? { ...h, ...next } : h
            ),
          }
        : prev
    );

  const canSend = gatewayUrl.trim() !== '' && !!req;
  const showBody = !!req && METHODS_WITH_BODY.has(req.method);
  const showWildcardHint = !!req && req.path.includes('*');

  const onSend = async () => {
    if (!req) return;
    const token = ++sendTokenRef.current;
    setSending(true);
    setResult(null);
    const r = await sendLive(req, gatewayUrl);
    if (sendTokenRef.current !== token) return; // a newer send or a reset superseded this one
    setResult(r);
    setSending(false);
  };

  return (
    <Drawer
      offset={0}
      radius="md"
      position="right"
      size="lg"
      opened={opened}
      onClose={onClose}
      closeButtonProps={{ 'aria-label': t('form.btn.cancel') }}
      title={t('test.title')}
      styles={{ body: { paddingTop: '12px' } }}
    >
      {req && (
        <Stack gap="sm">
          <TextInput
            label={t('test.gatewayUrl')}
            placeholder={t('test.gatewayUrlPlaceholder')}
            value={gatewayUrl}
            onChange={(e) => setGatewayUrl(e.currentTarget.value)}
          />

          <Group grow align="flex-start">
            <Select
              label={t('test.method')}
              data={methodOptions}
              value={req.method}
              onChange={(v) => v && patch({ method: v })}
              allowDeselect={false}
            />
            <TextInput
              label={t('test.path')}
              value={req.path}
              onChange={(e) => patch({ path: e.currentTarget.value })}
              {...(showWildcardHint && { description: t('test.wildcardHint') })}
            />
          </Group>

          <div>
            <Group justify="space-between" mb={4}>
              <Text size="sm" fw={500}>
                {t('test.headers')}
              </Text>
              <Button
                size="compact-xs"
                variant="light"
                onClick={() =>
                  patch({ headers: [...req.headers, { name: '', value: '' }] })
                }
              >
                {t('test.addHeader')}
              </Button>
            </Group>
            <Stack gap={6}>
              {req.headers.map((h, i) => (
                <Group key={i} gap={6} wrap="nowrap">
                  <TextInput
                    aria-label={`${t('test.headers')} ${i} name`}
                    placeholder="Header"
                    value={h.name}
                    onChange={(e) => setHeader(i, { name: e.currentTarget.value })}
                    style={{ flex: 1 }}
                  />
                  <TextInput
                    aria-label={`${t('test.headers')} ${i} value`}
                    placeholder="Value"
                    value={h.value}
                    onChange={(e) => setHeader(i, { value: e.currentTarget.value })}
                    style={{ flex: 1 }}
                  />
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    aria-label={t('test.removeHeader')}
                    onClick={() =>
                      patch({ headers: req.headers.filter((_, idx) => idx !== i) })
                    }
                  >
                    <IconClose />
                  </ActionIcon>
                </Group>
              ))}
            </Stack>
          </div>

          {showBody && (
            <Textarea
              label={t('test.body')}
              autosize
              minRows={3}
              value={req.body}
              onChange={(e) => patch({ body: e.currentTarget.value })}
            />
          )}

          <div>
            <Group justify="space-between" mb={4}>
              <Text size="sm" fw={500}>
                {t('test.curl')}
              </Text>
              <CopyButton value={curl}>
                {({ copied, copy }) => (
                  <Button size="compact-xs" variant="light" onClick={copy}>
                    {copied ? t('test.copied') : t('test.copy')}
                  </Button>
                )}
              </CopyButton>
            </Group>
            <Code block style={{ whiteSpace: 'pre' }}>
              {curl}
            </Code>
          </div>

          <Group justify="flex-end">
            <Button
              onClick={onSend}
              loading={sending}
              disabled={!canSend}
              {...(!canSend && { title: t('test.gatewayUrlRequired') })}
            >
              {t('test.send')}
            </Button>
          </Group>

          {result && (
            <div>
              <Text size="sm" fw={500} mb={4}>
                {t('test.response')}
              </Text>
              {result.ok ? (
                <Stack gap={6}>
                  <Group gap="xs">
                    <Badge color={statusColor(result.status)}>
                      {result.status} {result.statusText}
                    </Badge>
                    <Text size="sm" c="dimmed">
                      {/* eslint-disable-next-line i18next/no-literal-string -- "ms" is a universal unit symbol, not translatable copy */}
                      {result.durationMs} ms
                    </Text>
                  </Group>
                  {result.headers.length > 0 && (
                    <div>
                      <Button
                        size="compact-xs"
                        variant="subtle"
                        color="gray"
                        onClick={() => setHeadersOpen((o) => !o)}
                      >
                        {t('test.responseHeaders')}
                      </Button>
                      <Collapse in={headersOpen}>
                        <Code block style={{ whiteSpace: 'pre' }}>
                          {result.headers
                            .map(([k, v]) => `${k}: ${v}`)
                            .join('\n')}
                        </Code>
                      </Collapse>
                    </div>
                  )}
                  <ScrollArea.Autosize mah={300}>
                    <Code block style={{ whiteSpace: 'pre' }}>
                      {prettyBody(result.body)}
                    </Code>
                  </ScrollArea.Autosize>
                </Stack>
              ) : (
                <Alert color="yellow">{t('test.blocked')}</Alert>
              )}
            </div>
          )}
        </Stack>
      )}
    </Drawer>
  );
};
