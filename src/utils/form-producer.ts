import type { A6Type } from '@/types/schema/apisix';
import { produce } from 'immer';
import { all, map, values } from 'rambdax';

const allFalsy = (obj: object) =>
  all(
    Boolean,
    map((val) => !val, values(obj))
  );
type hasTimeout = Pick<A6Type['Route'], 'timeout'>;
export const produceTimeout = produce<Partial<hasTimeout>>((draft) => {
  if (draft.timeout && allFalsy(draft.timeout)) {
    delete draft.timeout;
  }
});
