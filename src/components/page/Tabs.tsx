import {
  Tabs as MTabs,
  type TabsProps as MTabsProps,
  type TabsListProps,
} from '@mantine/core';

export type TabsItem = {
  value: string;
  label: string;
  content: React.ReactNode;
};
export type TabsProps = {
  defaultValue?: string;
  items: TabsItem[];
  listProps?: TabsListProps;
} & MTabsProps;

export const Tabs = (props: TabsProps) => {
  const { defaultValue, items, listProps, ...rest } = props;
  return (
    <MTabs defaultValue={defaultValue || items[0].value} {...rest}>
      <MTabs.List {...listProps}>
        {items.map((item) => (
          <MTabs.Tab key={item.value} value={item.value}>
            {item.label}
          </MTabs.Tab>
        ))}
      </MTabs.List>
      {items.map((item) => (
        <MTabs.Panel key={item.value} value={item.value}>
          {item.content}
        </MTabs.Panel>
      ))}
    </MTabs>
  );
};
