/**
 * Re-export URL Analyzer from centralized security library for backward compatibility.
 */

export * from "@/lib/security/url-analyzer";
export {
  knownBrands,
  BRAND_CATALOG,
  BRAND_CATALOG as KNOWN_BRANDS,
  isLegitimateDomainForBrand,
  detectBrandImpersonation,
} from "@/lib/security/brands";
