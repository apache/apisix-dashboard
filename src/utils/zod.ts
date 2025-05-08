import { xor } from 'rambdax';
import { type RefinementCtx, z } from 'zod';
import { init } from 'zod-empty';

// ref: https://github.com/colinhacks/zod/issues/61#issuecomment-1741983149
export const zOneOf =
  <
    A,
    K1 extends Extract<keyof A, string>,
    K2 extends Extract<keyof A, string>,
    R extends A &
      (
        | (Required<Pick<A, K1>> & { [P in K2]: undefined })
        | (Required<Pick<A, K2>> & { [P in K1]: undefined })
      )
  >(
    key1: K1,
    key2: K2
  ): ((arg: A, ctx: RefinementCtx) => arg is R) =>
  (arg, ctx): arg is R => {
    if (xor(arg[key1] as boolean, arg[key2] as boolean)) {
      [key1, key2].forEach((key) => {
        ctx.addIssue({
          path: [key],
          code: z.ZodIssueCode.custom,
          message: `Either '${key1}' or '${key2}' must be filled, but not both`,
        });
      });
      return false;
    }
    return true;
  };

export const zGetDefault = init;
