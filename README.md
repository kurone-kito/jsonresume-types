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

```TypeScript
import { ResumeSchema } from '@kurone-kito/jsonresume-types';

export const render = (json: ResumeSchema) => {
  // ...
};
```

## License

MIT
