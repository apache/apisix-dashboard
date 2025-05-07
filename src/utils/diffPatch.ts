import { produce } from 'immer';
import { diff } from 'just-diff';

const setNestedInPlace = <T extends object>(
  obj: T,
  path: (string | number)[],
  value: unknown
) => {
  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i] as keyof T;
    if (!current[key]) {
      // If the next path is a number, create an array; otherwise, create an object
      const nextKey = path[i + 1];
      current[key] = (typeof nextKey === 'number' ? [] : {}) as T[keyof T];
    }
    current = current[key] as T;
  }
  current[path[path.length - 1] as keyof T] = value as T[keyof T];
};

/**
 * Currently, the data accepted by apisix when using patch is not a traditional json patch, but a rather peculiar way.
 * Simply put, the value to be deleted needs to be set to null, and the rest of the object structure remains unchanged.
 * @documentation https://apisix.apache.org/docs/apisix/admin-api/#:~:text=PATCH
 */
export const diffPatch = <T extends object, R extends object>(
  oldObj: T,
  newObj: R
) => {
  const diffs = diff(oldObj, newObj);
  return produce(newObj, (draft) => {
    diffs.forEach((change) => {
      const { op, path } = change;
      if (op === 'remove') {
        setNestedInPlace(draft, path, null);
      }
    });
  });
};
