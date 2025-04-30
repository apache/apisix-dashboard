import { InputWrapper, Text, type InputWrapperProps } from '@mantine/core';
import dayjs from 'dayjs';

type FormDisplayDateProps = InputWrapperProps & {
  date: dayjs.ConfigType;
};
const format = 'YYYY-MM-DD HH:mm:ss';
export const FormDisplayDate = (props: FormDisplayDateProps) => {
  const { date, ...rest } = props;
  const d = typeof date === 'number' ? date * 1000 : date;
  return (
    <InputWrapper {...rest}>
      <Text size="sm" c="gray.6">
        {d ? dayjs(d).format(format) : '-'}
      </Text>
    </InputWrapper>
  );
};
