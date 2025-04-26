import {
  Fieldset,
  Group,
  TableOfContents,
  type FieldsetProps,
} from '@mantine/core';
import {
  createContext,
  useContext,
  useMemo,
  useRef,
  type FC,
  type PropsWithChildren,
  type ReactNode,
} from 'react';
import classes from './style.module.css';
import { APPSHELL_HEADER_HEIGHT } from '@/config/constant';
import { useDeepCompareEffect } from 'react-use';

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
        legend={
          extra ? (
            <Group>
              {legend}
              {extra}
            </Group>
          ) : (
            legend
          )
        }
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

  useDeepCompareEffect(() => {
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
        depthOffset={40}
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
