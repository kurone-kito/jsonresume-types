/**
 * Compile-time conformance test: type-checks the official JSON Resume
 * sample against the generated `ResumeSchema`, and asserts that an
 * obviously wrong shape is rejected instead of silently widening to
 * `any`.
 *
 * This file has no runtime behavior; `pnpm run test` (`tsc --noEmit`)
 * is the only thing that "runs" it. It must run after `pnpm run
 * build`, since `../index.d.ts` does not exist in a clean checkout —
 * see `.github/workflows/push-feature.yml` for that ordering.
 */

import sample from '@jsonresume/schema/sample.resume.json' with {
  type: 'json',
};
import type { ResumeSchema } from '../index.js';

/**
 * The schema package's own canonical example must be assignable to the
 * generated type: this is the property consumers actually depend on.
 */
export const resume: ResumeSchema = sample;

/**
 * A `basics.name` typed as `number` must fail to compile. Keeping the
 * property on its own line (rather than an object literal one-liner)
 * keeps `@ts-expect-error` attached to it regardless of how the
 * surrounding object gets reformatted.
 */
export const invalid: ResumeSchema = {
  basics: {
    // @ts-expect-error basics.name must be a string, not a number.
    name: 42,
  },
};
