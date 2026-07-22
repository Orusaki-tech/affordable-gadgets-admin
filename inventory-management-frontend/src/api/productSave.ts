/**
 * Product create/update helpers.
 * Use JSON for structured payloads; fall back to multipart only when File/Blob fields are present.
 */
import { OpenAPI } from './core/OpenAPI';
import { isBlob, request } from './core/request';
import type { PatchedProductRequest } from './models/PatchedProductRequest';
import type { Product } from './models/Product';
import type { ProductRequest } from './models/ProductRequest';
import { ProductsService } from './services/ProductsService';

function payloadHasFiles(data: Record<string, unknown>): boolean {
  return Object.values(data).some((value) => value != null && isBlob(value));
}

export function patchProduct(
  id: number,
  data: PatchedProductRequest | Record<string, unknown>,
): Promise<Product> {
  if (payloadHasFiles(data as Record<string, unknown>)) {
    return ProductsService.productsPartialUpdate(id, data as PatchedProductRequest);
  }
  return request(OpenAPI, {
    method: 'PATCH',
    url: '/products/{id}/',
    path: { id },
    body: data,
    mediaType: 'application/json',
  });
}

export function createProduct(
  data: ProductRequest | Record<string, unknown>,
): Promise<Product> {
  if (payloadHasFiles(data as Record<string, unknown>)) {
    return ProductsService.productsCreate(data as ProductRequest);
  }
  return request(OpenAPI, {
    method: 'POST',
    url: '/products/',
    body: data,
    mediaType: 'application/json',
  });
}
