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

export const rmDoubleUnderscoreKeys = (obj: object) => {
  Object.keys(obj).forEach((key) => {
    const k = key as keyof typeof obj;
    if ((key as string).startsWith('__')) return delete obj[k];
    if (typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
      (obj[k] as object) = rmDoubleUnderscoreKeys(obj[k]);
    }
  });
  return obj;
};

export const produceRmDoubleUnderscoreKeys = produce((draft) => {
  rmDoubleUnderscoreKeys(draft);
});

type PipeParams = Parameters<typeof pipe>;
type R = PipeParams extends [PipeParams[0], ...infer R] ? R : never;
export const pipeProduce = (...funcs: R) => {
  return <T>(val: T) =>
    produce(val, (draft) =>
      pipe(
        ...funcs,
        produceRmDoubleUnderscoreKeys,
        produceDeepCleanEmptyKeys()
      )(draft)
    ) as T;
};
