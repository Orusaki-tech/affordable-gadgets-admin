# TypeScript API Clients (Generated from openapi.yaml)

This folder is deprecated. We now use the shared client package in `packages/api-client`.

## Generator: openapi-typescript-codegen (shared package)
The shared client is generated once and consumed by all frontends.

## Prerequisites
- Node.js 18+
- npm or yarn or pnpm

## Generate clients
```bash
# From the workspace root
./scripts/sync-api.sh
```

This will create `packages/api-client/src` and `packages/api-client/dist`.

## Using the generated client
Example (React/TypeScript):
```ts
import { OpenAPI, ProductsService } from '@shwari/api-client';

OpenAPI.BASE = 'http://localhost:8000';
const res = await ProductsService.productsList();

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
Any time `openapi.yaml` changes, rerun `./scripts/sync-api.sh`.

## Notes
- The generator does not manage state; pair it with React Query/Redux for caching and loading states.
- The shared client is already a local package under `packages/api-client`.


