import { RequestData } from '@ant-design/pro-table';

type ActionType = 'get' | 'set' | 'delete' | 'create';

interface Node<T> {
  createdIndex: number;
  key: string;
  modifiedIndex: number;
  value: T;
}

interface ListData<T> {
  action: ActionType;
  node: {
    modifiedIndex: number;
    createdIndex: number;
    key: string;
    dir: boolean;
    nodes: Node<T>[];
  };
}

export interface ListItem<T> extends Node<T> {
  displayKey: string;
}

const key2id = (key: string) => parseInt(key.replace(/^(0+)/, ''), 10);

/**
 * Transform data from fetch list api.
 */
export const transformFetchListData = <T>(data: ListData<T>): RequestData<ListItem<T>> => {
  const results = data.node.nodes
    .map(node => {
      const result = node.key.match(/\/([0-9]+)/);
      let displayKey = '';

      if (result) {
        const [, key] = result;
        displayKey = key2id(key).toString();
      }
      return {
        ...node,
        displayKey,
      };
    })
    .filter(item => item.displayKey);

  return {
    data: results,
    total: results.length,
  };
};

/**
 * Transform data from fetch target item.
 */
export const transformFetchItemData = <T>(data: { node: Node<T>; action: ActionType }) => data.node;
