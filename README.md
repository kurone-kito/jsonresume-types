# 📦 `@kurone-kito/jsonresume-types`

TypeScript type definition for [JSON Resume](http://jsonresume.org)

## Pros

- No dependencies (only devDependencies)
- No logic (only type definition)

## System requirement

- Node.js: Any of the following versions
  - Iron LTS (`^20.11.x`)
  - Jod LTS `^22.x.x` or
  - Latest `>=24.x.x`

## Usage

```sh
npm install -D @kurone-kito/jsonresume-types
```

```ts
import type { ResumeSchema } from '@kurone-kito/jsonresume-types';

export const render = (json: ResumeSchema) => {
  // ...
};
```

## Contributing

Welcome to contribute to this repository! For more details,
please refer to [CONTRIBUTING.md](.github/CONTRIBUTING.md).

The declaration file `index.d.ts` is generated at build time. Do not commit this
file to the repository; run `pnpm run build` to create it when needed.

## License

MIT
