import {
  Fieldset,
  Group,
  TableOfContents,
  type FieldsetProps,
} from '@mantine/core';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type FC,
  type PropsWithChildren,
} from 'react';
import classes from './style.module.css';

export type SectionProps = FieldsetProps;

const SectionDepthCtx = createContext<number>(0);

const SectionDepthProvider = SectionDepthCtx.Provider;

// `form-section` class is for TableOfContents
const tocSelector = 'form-section';
const tocValue = 'data-label';
const tocDepth = 'data-depth';

export const FormSection: FC<FieldsetProps> = (props) => {
  const { className } = props;
  const parentDepth = useContext(SectionDepthCtx);
  const depth = useMemo(() => parentDepth + 1, [parentDepth]);

  const newClass = `${tocSelector} ${classes.root} ${className}`;
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

  useEffect(() => {
    reinitializeRef.current();
  }, []);
  return (
    <Group
      grow
      preventGrowOverflow={false}
      wrap="nowrap"
      align="start"
      gap={30}
    >
      <TableOfContents
        variant="light"
        color="blue"
        size="xs"
        radius="sm"
        maw={240}
        mt={10}
        scrollSpyOptions={{
          selector: `.${tocSelector}`,
          getDepth: (el) => Number(el.getAttribute(tocDepth)),
          getValue: (el) => el.getAttribute(tocValue) || '',
        }}
      />
      {children}
    </Group>
  );
};
