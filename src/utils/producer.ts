import { type ICleanerOptions, clean } from 'fast-clean';
import { produce } from 'immer';
import { pipe } from 'rambdax';

export const deepCleanEmptyKeys = <T extends object>(
  obj: T,
  opts?: ICleanerOptions
) =>
  clean(obj, {
    nullCleaner: true,
    cleanInPlace: true,
    ...opts,
  });

export const produceDeepCleanEmptyKeys = (opts: ICleanerOptions = {}) =>
  produce((draft) => {
    deepCleanEmptyKeys(draft, opts);
  });

  type PipeParams = Parameters<typeof pipe>;
  type R = PipeParams extends [PipeParams[0], ...infer R] ? R : never;
  export const pipeProduce = <T extends object>(...funcs: R) => {
    return produce((draft: T) =>
      pipe(...funcs, produceDeepCleanEmptyKeys())(draft)
    );
  };
