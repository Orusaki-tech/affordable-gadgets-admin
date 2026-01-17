# API Client Generation

This admin frontend uses the shared TypeScript API client generated from the backend's OpenAPI specification.

## Regenerating API Clients

When the backend API changes:

1. **Regenerate the OpenAPI spec in the backend and rebuild the shared client**
2. **Run the sync script from the workspace root:**
   ```bash
   ./scripts/sync-api.sh
   ```

This will regenerate the OpenAPI spec and rebuild the shared client package used by all frontends.

## Manual Generation

If you prefer to generate manually:

```bash
npx openapi-typescript-codegen \
  --input ../affordable-gadgets-backend/openapi.yaml \
  --output ../packages/api-client/src \
  --client axios
```

## Notes

- The generated clients live in `packages/api-client`
- Always commit the generated files to version control
- `openapi.yaml` is generated in the backend and should not be edited here
