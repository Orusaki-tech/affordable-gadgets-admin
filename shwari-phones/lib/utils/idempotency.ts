/**
 * Idempotency utilities for order creation
 */

/**
 * Generate a unique idempotency key for order creation
 * Format: timestamp-randomString
 */
export function generateIdempotencyKey(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
}

/**
 * Get or create idempotency key for a specific order request
 * Uses sessionStorage to persist key across page refreshes/retries
 */
export function getIdempotencyKey(orderData: any): string {
  if (typeof window === 'undefined') {
    return generateIdempotencyKey();
  }
  
  // Create a hash of order data to identify same order attempts
  const orderHash = JSON.stringify({
    items: orderData.order_items?.map((item: any) => ({
      inventory_unit_id: item.inventory_unit_id,
      quantity: item.quantity,
    })),
    customer_phone: orderData.customer_phone,
  });
  
  const storageKey = `idempotency_${btoa(orderHash).substring(0, 50)}`;
  const existingKey = sessionStorage.getItem(storageKey);
  
  if (existingKey) {
    return existingKey;
  }
  
  const newKey = generateIdempotencyKey();
  sessionStorage.setItem(storageKey, newKey);
  return newKey;
}
