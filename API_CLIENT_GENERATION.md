# API Client Generation

This admin frontend uses auto-generated TypeScript API clients from the backend's OpenAPI specification.

## Regenerating API Clients

When the backend API changes:

1. **Copy the latest `openapi.yaml` from the backend repository** to this repository's root
2. **Run the generation script:**
   ```bash
   ./scripts/generate-api.sh
   ```

This will regenerate all TypeScript API clients in `src/api/` based on the latest API specification.

## Manual Generation

If you prefer to generate manually:

```bash
npx openapi-typescript-codegen \
  --input ./openapi.yaml \
  --output ./src/api \
  --client axios
```

## Notes

- The generated clients are in `src/api/`
- Always commit the generated files to version control
- Update `openapi.yaml` whenever the backend API changes
