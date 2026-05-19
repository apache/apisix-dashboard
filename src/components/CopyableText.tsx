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
import { CheckOutlined, CopyOutlined } from '@ant-design/icons';
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

export type CopyableTextProps = {
  text: string;
  children?: ReactNode;
  emptyPlaceholder?: ReactNode;
};

const wrapperStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  maxWidth: '100%',
};

const copyButtonStyle: CSSProperties = {
  border: 'none',
  background: 'transparent',
  color: '#1677ff',
  cursor: 'pointer',
  padding: 0,
  display: 'inline-flex',
  alignItems: 'center',
  lineHeight: 1,
};

const srOnlyStyle: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

const fallbackCopy = (value: string) => {
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);
  return copied;
};

const writeToClipboard = async (value: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  if (!fallbackCopy(value)) {
    throw new Error('Failed to copy text');
  }
};

export const CopyableText = (props: CopyableTextProps) => {
  const { text, children, emptyPlaceholder = '-' } = props;
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const copiedResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const announceId = useId();

  useEffect(() => {
    return () => {
      if (copiedResetTimer.current) {
        clearTimeout(copiedResetTimer.current);
      }
    };
  }, []);

  const hasValue = text.trim().length > 0;
  const displayContent = children ?? (hasValue ? text : emptyPlaceholder);

  const onCopy = async () => {
    if (!hasValue) {
      return;
    }

    try {
      await writeToClipboard(text);
      setCopied(true);
      if (copiedResetTimer.current) {
        clearTimeout(copiedResetTimer.current);
      }
      copiedResetTimer.current = setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <span style={wrapperStyle}>
      <span>{displayContent}</span>
      {hasValue && (
        <>
          <button
            type="button"
            onClick={onCopy}
            style={copyButtonStyle}
            title={copied ? t('copy_success') : t('copy')}
            aria-label={`${copied ? t('copy_success') : t('copy')}: ${text}`}
            aria-describedby={announceId}
          >
            {copied ? (
              <CheckOutlined aria-hidden="true" />
            ) : (
              <CopyOutlined aria-hidden="true" />
            )}
          </button>
          <span id={announceId} aria-live="polite" style={srOnlyStyle}>
            {copied ? t('copy_success') : ''}
          </span>
        </>
      )}
    </span>
  );
};
