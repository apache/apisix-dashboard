import { produce } from 'immer';
import { all, map, values } from 'rambdax';

import type { APISIXType } from '@/types/schema/apisix';

const allFalsy = (obj: object) =>
  all(
    Boolean,
    map((val) => !val, values(obj))
  );
type hasTimeout = Pick<APISIXType['Route'], 'timeout'>;
export const produceTimeout = produce<Partial<hasTimeout>>((draft) => {
  if (draft.timeout && allFalsy(draft.timeout)) {
    delete draft.timeout;
  }
});

export const produceTime = produce<Partial<APISIXType['Info']>>((draft) => {
  if (draft.create_time) delete draft.create_time;
  if (draft.update_time) delete draft.update_time;
});
