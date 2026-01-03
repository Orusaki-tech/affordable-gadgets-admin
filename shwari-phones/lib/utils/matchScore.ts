/**
 * Product Match Score Calculator
 * Calculates how well a product matches user's criteria
 */

export interface MatchCriteria {
  priceMin?: number;
  priceMax?: number;
  storage?: number[];
  ram?: number[];
  condition?: string[];
  brand?: string[];
  minRating?: number;
  mustBeInStock?: boolean;
}

export interface ProductForMatching {
  id: number;
  product_name: string;
  min_price: number | null;
  max_price: number | null;
  available_units_count: number;
  // Add more fields as needed
}

export interface MatchResult {
  product: ProductForMatching;
  score: number;
  breakdown: {
    price: number;
    specs: number;
    availability: number;
    rating: number;
  };
}

/**
 * Calculate match score for a product
 */
export function calculateMatchScore(
  product: ProductForMatching,
  criteria: MatchCriteria,
  units: any[] // InventoryUnit[]
): MatchResult {
  let priceScore = 0;
  let specsScore = 0;
  let availabilityScore = 0;
  let ratingScore = 50; // Default rating score (can be enhanced with actual ratings)

  // Price matching (40% weight)
  if (criteria.priceMin !== undefined && criteria.priceMax !== undefined) {
    const productMin = product.min_price || 0;
    const productMax = product.max_price || 0;
    
    if (productMin >= criteria.priceMin && productMax <= criteria.priceMax) {
      priceScore = 100; // Perfect match
    } else if (productMin <= criteria.priceMax && productMax >= criteria.priceMin) {
      // Partial overlap
      const overlap = Math.min(productMax, criteria.priceMax) - Math.max(productMin, criteria.priceMin);
      const range = Math.max(productMax, criteria.priceMax) - Math.min(productMin, criteria.priceMin);
      priceScore = (overlap / range) * 100;
    } else {
      // No overlap - calculate distance
      const distance = Math.min(
        Math.abs(productMin - criteria.priceMax),
        Math.abs(productMax - criteria.priceMin)
      );
      const range = criteria.priceMax - criteria.priceMin;
      priceScore = Math.max(0, 100 - (distance / range) * 100);
    }
  } else {
    priceScore = 50; // No price criteria = neutral score
  }

  // Specs matching (30% weight)
  let specMatches = 0;
  let specTotal = 0;

  if (criteria.storage && criteria.storage.length > 0) {
    specTotal++;
    const hasMatchingStorage = units.some(unit => 
      unit.storage_gb && criteria.storage!.includes(unit.storage_gb)
    );
    if (hasMatchingStorage) specMatches++;
  }

  if (criteria.ram && criteria.ram.length > 0) {
    specTotal++;
    const hasMatchingRam = units.some(unit => 
      unit.ram_gb && criteria.ram!.includes(unit.ram_gb)
    );
    if (hasMatchingRam) specMatches++;
  }

  if (criteria.condition && criteria.condition.length > 0) {
    specTotal++;
    const hasMatchingCondition = units.some(unit => 
      criteria.condition!.includes(unit.condition)
    );
    if (hasMatchingCondition) specMatches++;
  }

  if (criteria.brand && criteria.brand.length > 0) {
    specTotal++;
    // Brand matching would be on product level
    // This is a placeholder - you'd need to pass brand info
  }

  specsScore = specTotal > 0 ? (specMatches / specTotal) * 100 : 50;

  // Availability matching (20% weight)
  if (criteria.mustBeInStock) {
    availabilityScore = product.available_units_count > 0 ? 100 : 0;
  } else {
    availabilityScore = product.available_units_count > 0 ? 100 : 50;
  }

  // Calculate weighted total score
  const totalScore = (
    priceScore * 0.4 +
    specsScore * 0.3 +
    availabilityScore * 0.2 +
    ratingScore * 0.1
  );

  return {
    product,
    score: Math.round(totalScore),
    breakdown: {
      price: Math.round(priceScore),
      specs: Math.round(specsScore),
      availability: Math.round(availabilityScore),
      rating: Math.round(ratingScore),
    },
  };
}

/**
 * Calculate match scores for multiple products
 */
export function calculateMatchScores(
  products: ProductForMatching[],
  criteria: MatchCriteria,
  unitsMap: Record<number, any[]> // productId -> InventoryUnit[]
): MatchResult[] {
  return products
    .map(product => {
      const units = unitsMap[product.id] || [];
      return calculateMatchScore(product, criteria, units);
    })
    .sort((a, b) => b.score - a.score); // Sort by score descending
}







