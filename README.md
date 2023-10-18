# 📦 `@kurone-kito/jsonresume-types`

TypeScript type definition for [JSON Resume](http://jsonresume.org)

## Pros

- No dependencies (only devDependencies)
- No logic (only type definition)

## System requirement

- Node.js >= v18.18

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
