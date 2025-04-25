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
} from 'react';
import classes from './style.module.css';
import { useMount } from 'react-use';
import { APPSHELL_HEADER_HEIGHT } from '@/config/constant';

export type FormSectionProps = Omit<FieldsetProps, 'form'>;

const SectionDepthCtx = createContext<number>(0);

const SectionDepthProvider = SectionDepthCtx.Provider;

// `form-section` class is for TableOfContents
const tocSelector = 'form-section';
const tocValue = 'data-label';
const tocDepth = 'data-depth';

export const FormSection: FC<FormSectionProps> = (props) => {
  const { className } = props;
  const parentDepth = useContext(SectionDepthCtx);
  const depth = useMemo(() => parentDepth + 1, [parentDepth]);

  const newClass = `${tocSelector} ${classes.root} ${className || ''}`;
  return (
    <SectionDepthProvider value={depth}>
      <Fieldset
        {...props}
        className={newClass}
        {...{
          [tocValue]: props.legend,
          [tocDepth]: depth,
        }}
      />
    </SectionDepthProvider>
  );
};

export const FormSectionTOCBox: FC<PropsWithChildren> = ({ children }) => {
  const reinitializeRef = useRef(() => {});

  useMount(() => {
    reinitializeRef.current();
  });

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
