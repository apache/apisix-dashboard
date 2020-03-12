type ActionType = 'get' | 'set' | 'delete' | 'create';

interface Node<T> {
  createdIndex: number;
  key: string;
  modifiedIndex: number;
  value: T;
}

interface Data<T> {
  action: ActionType;
  node: {
    modifiedIndex: number;
    createdIndex: number;
    key: string;
    dir: boolean;
    nodes: Node<T>[];
  };
}

const key2id = (key: string) => parseInt(key.replace(/^(0+)/, ''), 10);

/**
 * Transform data from fetch list api.
 */
export const transformFetchListData = <T>(data: Data<T>): Array<Node<T> & { displayKey: string }> =>
  data.node.nodes
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
