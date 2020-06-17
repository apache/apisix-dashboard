type ActionType = 'get' | 'set' | 'delete' | 'create';

interface Node<T> {
  createdIndex: number;
  key: string;
  modifiedIndex: number;
  value: T;
}

export interface ListItem<T> extends Node<T> {
  displayKey: string;
  id?: number;
}

/**
 * Transform data from fetch target item.
 */
export const transformFetchItemData = <T>(data: { node: Node<T>; action: ActionType }) => {
  const result = data.node.key.match(/\/([0-9]+)/);
  if (result) {
    const [, key] = result;
    /* eslint no-param-reassign: ["error", { "props": false }] */
    data.node.key = key;
  }
  return data.node;
};
