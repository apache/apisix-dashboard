import { Fieldset, type FieldsetProps } from '@mantine/core';
import type { FC } from 'react';
import classes from './style.module.css';

export type SectionProps = FieldsetProps;

export const Section: FC<FieldsetProps> = (props) => {
  const { className } = props;
  // `form-section` class is for TableOfContents
  const newClass = `form-section ${classes.root} ${className}`;
  return <Fieldset {...props} className={newClass} />;
};
