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
  type TableOfContentsProps,
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import clsx from 'clsx';
import { debounce } from 'rambdax';
import {
  createContext,
  type PropsWithChildren,
  type ReactNode,
  useCallback,
  useContext,
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

const FormTOCCtx = createContext<{
  refreshTOC: () => void;
}>({
  refreshTOC: () => {},
});

export type FormSectionProps = Omit<FieldsetProps, 'form'> & {
  extra?: ReactNode;
};

const LegendGroup = ({
  legend,
  extra,
}: {
  legend: ReactNode;
  extra?: ReactNode;
}) => {
  if (!legend && !extra) {
    return null;
  }
  return (
    <Group>
      {legend}
      {extra}
    </Group>
  );
};

export const FormSection = (props: FormSectionProps) => {
  const { className, legend, extra, children, ...restProps } = props;
  const parentDepth = useContext(SectionDepthCtx);
  const { refreshTOC } = useContext(FormTOCCtx);
  const depth = useMemo(() => parentDepth + 1, [parentDepth]);
  const dataAttrs = useMemo(
    () => ({
      [tocValue]: legend,
      [tocDepth]: depth,
    }),
    [legend, depth]
  );

  // refresh TOC when children changes
  useShallowEffect(refreshTOC, [children]);

  return (
    <SectionDepthProvider value={depth}>
      <Fieldset
        className={clsx(tocSelector, classes.root, className)}
        legend={<LegendGroup legend={legend} extra={extra} />}
        {...restProps}
        {...dataAttrs}
      >
        {children}
      </Fieldset>
    </SectionDepthProvider>
  );
};

const TOC = (props: Pick<TableOfContentsProps, 'reinitializeRef'>) => {
  return (
    <TableOfContents
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
      {...props}
    />
  );
};

export type FormTOCBoxProps = PropsWithChildren;

export const FormTOCBox = (props: FormTOCBoxProps) => {
  const { children } = props;
  const reinitializeRef = useRef(() => {});
  const refreshTOC = useCallback(
    () => debounce(reinitializeRef.current, 200),
    []
  );

  return (
    <Group
      preventGrowOverflow={false}
      wrap="nowrap"
      align="start"
      gap={30}
      style={{ paddingInlineEnd: '10%', position: 'relative' }}
    >
      <TOC reinitializeRef={reinitializeRef} />
      <div style={{ width: '80%' }}>
        <FormTOCCtx.Provider value={{ refreshTOC }}>
          {children}
        </FormTOCCtx.Provider>
      </div>
    </Group>
  );
};
