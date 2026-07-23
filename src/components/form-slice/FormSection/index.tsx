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
import { clsx } from 'clsx';
import { debounce } from 'rambdax';
import {
  createContext,
  type PropsWithChildren,
  type ReactNode,
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

  // refresh TOC when children change, and again on unmount — a section
  // that disappears must also drop out of the TOC
  useShallowEffect(() => {
    refreshTOC();
    return refreshTOC;
  }, [children]);

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
            block: 'start',
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
  // one stable debounced function, invoked through the ref so it always
  // reaches Mantine's latest reinitialize. The previous version built a
  // debounced wrapper on every call and discarded it — the TOC only kept
  // refreshing because React treated that discarded return value as an
  // effect CLEANUP and invoked it on the next change (see #3417).
  const refreshTOC = useMemo(() => {
    const run = debounce(() => reinitializeRef.current(), 200);
    return () => run(undefined);
  }, []);

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
