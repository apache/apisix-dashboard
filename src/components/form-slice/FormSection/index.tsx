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
  Fieldset,
  type FieldsetProps,
  Group,
  TableOfContents,
} from '@mantine/core';
import {
  createContext,
  type FC,
  type PropsWithChildren,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { APPSHELL_HEADER_HEIGHT } from '@/config/constant';

import classes from './style.module.css';

const SectionDepthCtx = createContext<number>(0);

const SectionDepthProvider = SectionDepthCtx.Provider;

// `form-section` class is for TableOfContents
const tocSelector = 'form-section';
const tocValue = 'data-label';
const tocDepth = 'data-depth';

export type FormSectionProps = Omit<FieldsetProps, 'form'> & {
  extra?: ReactNode;
};

export const FormSection: FC<FormSectionProps> = (props) => {
  const { className, legend, extra, ...restProps } = props;
  const parentDepth = useContext(SectionDepthCtx);
  const depth = useMemo(() => parentDepth + 1, [parentDepth]);

  const newClass = `${tocSelector} ${classes.root} ${className || ''}`;
  return (
    <SectionDepthProvider value={depth}>
      <Fieldset
        className={newClass}
        {...((legend || extra) && {
          legend: (
            <Group>
              {legend}
              {extra}
            </Group>
          ),
        })}
        {...restProps}
        {...{
          [tocValue]: legend,
          [tocDepth]: depth,
        }}
      />
    </SectionDepthProvider>
  );
};

export type FormTOCBoxProps = PropsWithChildren & {
  deps?: unknown[];
};

export const FormTOCBox = (props: FormTOCBoxProps) => {
  const { children, deps } = props;
  const reinitializeRef = useRef(() => {});

  useEffect(() => {
    reinitializeRef.current();
  }, [deps]);

  return (
    <Group
      preventGrowOverflow={false}
      wrap="nowrap"
      align="start"
      gap={30}
      style={{ paddingInlineEnd: '10%', position: 'relative' }}
    >
      <TableOfContents
        reinitializeRef={reinitializeRef}
        variant="light"
        color="blue"
        size="sm"
        radius="sm"
        style={{
          flexShrink: 0,
          position: 'sticky',
          top: APPSHELL_HEADER_HEIGHT + 20,
        }}
        w={200}
        mt={10}
        minDepthToOffset={0}
        depthOffset={20}
        scrollSpyOptions={{
          selector: `.${tocSelector}`,
          getDepth: (el) => Number(el.getAttribute(tocDepth)),
          getValue: (el) => el.getAttribute(tocValue) || '',
        }}
        getControlProps={({ data }) => ({
          onClick: () => {
            return data.getNode().scrollIntoView({
              behavior: 'smooth',
              block: 'end',
              inline: 'end',
            });
          },
          children: data.value,
        })}
      />
      <div style={{ width: '80%' }}>{children}</div>
    </Group>
  );
};
