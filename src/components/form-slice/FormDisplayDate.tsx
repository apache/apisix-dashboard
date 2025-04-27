import { InputWrapper, Text, type InputWrapperProps } from '@mantine/core';
import dayjs from 'dayjs';

type FormDisplayDateProps = InputWrapperProps & {
  date: dayjs.ConfigType;
};
export const FormDisplayDate = (props: FormDisplayDateProps) => {
  const { date, ...rest } = props;
  return (
    <InputWrapper {...rest}>
      <Text size="sm" c="gray.6">
        {dayjs(date).format('YYYY-MM-DD HH:mm:ss')}
      </Text>
    </InputWrapper>
  );
};
