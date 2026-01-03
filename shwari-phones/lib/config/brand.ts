/**
 * Brand configuration
 * This can be updated later when design system is provided
 */
export const brandConfig = {
  code: process.env.NEXT_PUBLIC_BRAND_CODE || 'AFFORDABLE_GADGETS',
  name: process.env.NEXT_PUBLIC_BRAND_NAME || 'Affordable Gadgets',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
} as const;







