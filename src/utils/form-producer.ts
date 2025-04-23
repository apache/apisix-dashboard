import type { A6Type } from '@/types/schema/apisix';
import { produce } from 'immer';
import { all, map, values } from 'rambdax';

const allFalsy = (obj: object) =>
  all(
    Boolean,
    map((val) => !val, values(obj))
  );
type WithTimeout = Pick<A6Type.Route, 'timeout'>;
export const produceTimeout = produce<Partial<WithTimeout>>((draft) => {
  if (draft.timeout && allFalsy(draft.timeout)) {
    delete draft?.timeout;
  }
});
