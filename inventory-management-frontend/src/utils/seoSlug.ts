const PRODUCT_TYPE_SUFFIXES = ['ph', 'lt', 'tb', 'ac'] as const;
const MAX_SEO_SLUG_LENGTH = 60;
const MAX_SEO_SLUG_TOKENS = 10;

export function isMissing(value?: string | null): boolean {
  return !value || value.trim() === '' || value.trim().toUpperCase() === 'N/A';
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function slugTokens(value: string): string[] {
  return slugify(value).split('-').filter(Boolean);
}

function stripLeadingDuplicateTokens(prefixTokens: string[], tokens: string[]): string[] {
  if (!prefixTokens.length || !tokens.length) return tokens;
  let shared = 0;
  const maxShared = Math.min(prefixTokens.length, tokens.length);
  while (shared < maxShared && prefixTokens[shared] === tokens[shared]) {
    shared += 1;
  }
  return tokens.slice(shared);
}

function stripTrailingTypeSuffix(slug: string): string {
  for (const suffix of PRODUCT_TYPE_SUFFIXES) {
    if (slug.endsWith(`-${suffix}`)) {
      return slug.slice(0, -(suffix.length + 1));
    }
  }
  return slug;
}

function trimSlug(slug: string): string {
  if (slug.length <= MAX_SEO_SLUG_LENGTH) return slug;
  const tokens = slug.split('-');
  const trimmed = tokens.slice(0, MAX_SEO_SLUG_TOKENS).join('-');
  if (trimmed.length <= MAX_SEO_SLUG_LENGTH) return trimmed;
  return trimmed.slice(0, MAX_SEO_SLUG_LENGTH).replace(/-+$/, '');
}

function mergeTokens(...tokenGroups: string[][]): string[] {
  const merged: string[] = [];
  for (const group of tokenGroups) {
    for (const token of group) {
      if (!token) continue;
      if (merged.at(-1) === token) continue;
      if (merged.includes(token)) continue;
      merged.push(token);
    }
  }
  return merged;
}

function primaryDescriptor(brand: string, modelSeries: string, productName: string): string {
  const candidates: Array<[number, string]> = [];
  if (!isMissing(modelSeries)) candidates.push([slugTokens(modelSeries).length, modelSeries]);
  if (!isMissing(productName)) candidates.push([slugTokens(productName).length, productName]);
  if (!isMissing(brand)) candidates.push([slugTokens(brand).length, brand]);
  if (!candidates.length) return '';
  return candidates.sort((a, b) => b[0] - a[0])[0][1];
}

export function buildSeoProductSlug({
  brand = '',
  modelSeries = '',
  productName = '',
}: {
  brand?: string;
  modelSeries?: string;
  productName?: string;
}): string {
  const brandValue = brand.trim();
  const modelSeriesValue = modelSeries.trim();
  const productNameValue = productName.trim();

  if (isMissing(brandValue) && isMissing(modelSeriesValue) && isMissing(productNameValue)) {
    return '';
  }

  const brandTokenList = slugTokens(brandValue);
  const primary = primaryDescriptor(brandValue, modelSeriesValue, productNameValue);
  let descriptorTokens = stripLeadingDuplicateTokens(brandTokenList, slugTokens(primary));

  if (!isMissing(productNameValue) && !isMissing(modelSeriesValue)) {
    const nameTokens = stripLeadingDuplicateTokens(
      descriptorTokens,
      stripLeadingDuplicateTokens(brandTokenList, slugTokens(productNameValue)),
    );
    const extraTokens = nameTokens.filter((token) => !descriptorTokens.includes(token));
    if (extraTokens.length > 0 && extraTokens.length <= 4) {
      descriptorTokens = mergeTokens(descriptorTokens, extraTokens);
    }
  }

  const slugTokensMerged = brandTokenList.length
    ? mergeTokens(brandTokenList, descriptorTokens)
    : descriptorTokens;

  let slug = slugTokensMerged.join('-');
  slug = stripTrailingTypeSuffix(slug);

  if (!slug) {
    slug = slugify(productNameValue || modelSeriesValue || brandValue);
  }

  slug = slug.replace(/-{2,}/g, '-').replace(/(^-|-$)/g, '');
  return trimSlug(slug);
}
