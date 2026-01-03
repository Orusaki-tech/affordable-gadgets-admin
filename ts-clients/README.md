# TypeScript API Clients (Generated from openapi.yaml)

This folder contains tooling to generate fully typed TypeScript clients for all backend endpoints using your `openapi.yaml`.

## Generator: typescript-axios
We use OpenAPI Generator to emit an Axios-based client with TypeScript types for requests and responses.

## Prerequisites
- Node.js 18+
- npm or yarn or pnpm

## Install generator (one-time)
```bash
npm install --save-dev @openapitools/openapi-generator-cli
```

## Generate clients
```bash
# From this directory
npx openapi-generator-cli generate \
  -i ../../openapi.yaml \
  -g typescript-axios \
  -o ./generated \
  --additional-properties=supportsES6=true,withoutPrefixEnums=true,enumPropertyNaming=original
```

This will create `./generated/` with:
- API classes (one per tag/path)
- Models and type definitions for all schemas
- Configuration helpers

## Using the generated client
Example (React/TypeScript):
```ts
import { Configuration, ProductsApi } from './generated';

const config = new Configuration({ basePath: 'http://localhost:8000/api/inventory' });
const productsApi = new ProductsApi(config);

async function loadProducts() {
  const res = await productsApi.listProductTemplates();
  // Lists are paginated: res.data.results
  return res.data.results;
}
```

## Auth header (Token)
```ts
import { Configuration } from './generated';

const token = localStorage.getItem('token');
const cfg = new Configuration({
  basePath: 'http://localhost:8000/api/inventory',
  accessToken: token ? `Token ${token}` : undefined,
});
```

Alternatively, pass an Axios instance with an interceptor to inject `Authorization: Token <key>`.

## Regenerate on API changes
Any time `openapi.yaml` changes, rerun the generate command to update types and endpoints.

## Notes
- The generator does not manage state; pair it with React Query/Redux for caching and loading states.
- For multiple frontends, you can copy `./generated` into each project or publish it as a private shared package.


