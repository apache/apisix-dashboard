import { Fieldset, type FieldsetProps } from '@mantine/core';
import type { FC } from 'react';
import classes from './style.module.css';

export const Section: FC<FieldsetProps> = (props) => {
  const { className } = props;
  const newClass = `form-section ${classes.root} ${className}`;
  return <Fieldset {...props} className={newClass} />;
};
