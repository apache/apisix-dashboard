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
