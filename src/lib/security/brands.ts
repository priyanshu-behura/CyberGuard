/**
 * CYBERGUARD Centralized Known Brand Knowledge Base & Look-Alike Detection
 *
 * All brand definitions and authentic domain mappings are centralized here.
 * Adding new brands requires updating only this file.
 */

export interface BrandInfo {
  key: string;
  name: string;
  domains: string[];
  keywords: string[];
  commonSubdomains?: string[];
}

/**
 * Centralized known brands configuration as requested by Requirement 2.
 */
export const knownBrands: Record<string, string[]> = {
  instagram: ["instagram.com"],
  paypal: ["paypal.com"],
  google: ["google.com"],
  facebook: ["facebook.com", "fb.com"],
  microsoft: ["microsoft.com", "live.com", "office.com", "office365.com"],
  amazon: ["amazon.com"],
  github: ["github.com"],
  apple: ["apple.com", "icloud.com"],
  linkedin: ["linkedin.com"],
  netflix: ["netflix.com"],
  whatsapp: ["whatsapp.com"],
  telegram: ["telegram.org"],
  samsung: ["samsung.com"],
  adobe: ["adobe.com"],
  dropbox: ["dropbox.com"],
};

/**
 * Extended brand metadata for rich classification and display.
 */
export const BRAND_CATALOG: Record<string, BrandInfo> = {
  instagram: {
    key: "instagram",
    name: "Instagram",
    domains: ["instagram.com"],
    keywords: ["instagram"],
  },
  paypal: {
    key: "paypal",
    name: "PayPal",
    domains: ["paypal.com"],
    keywords: ["paypal"],
  },
  google: {
    key: "google",
    name: "Google",
    domains: ["google.com"],
    keywords: ["google"],
  },
  facebook: {
    key: "facebook",
    name: "Facebook",
    domains: ["facebook.com", "fb.com"],
    keywords: ["facebook"],
  },
  microsoft: {
    key: "microsoft",
    name: "Microsoft",
    domains: ["microsoft.com", "live.com", "office.com", "office365.com"],
    keywords: ["microsoft", "office365"],
  },
  amazon: {
    key: "amazon",
    name: "Amazon",
    domains: ["amazon.com"],
    keywords: ["amazon"],
  },
  github: {
    key: "github",
    name: "GitHub",
    domains: ["github.com"],
    keywords: ["github"],
  },
  apple: {
    key: "apple",
    name: "Apple",
    domains: ["apple.com", "icloud.com"],
    keywords: ["apple", "icloud"],
  },
  linkedin: {
    key: "linkedin",
    name: "LinkedIn",
    domains: ["linkedin.com"],
    keywords: ["linkedin"],
  },
  netflix: {
    key: "netflix",
    name: "Netflix",
    domains: ["netflix.com"],
    keywords: ["netflix"],
  },
  whatsapp: {
    key: "whatsapp",
    name: "WhatsApp",
    domains: ["whatsapp.com"],
    keywords: ["whatsapp"],
  },
  telegram: {
    key: "telegram",
    name: "Telegram",
    domains: ["telegram.org"],
    keywords: ["telegram"],
  },
  samsung: {
    key: "samsung",
    name: "Samsung",
    domains: ["samsung.com"],
    keywords: ["samsung"],
  },
  adobe: {
    key: "adobe",
    name: "Adobe",
    domains: ["adobe.com"],
    keywords: ["adobe"],
  },
  dropbox: {
    key: "dropbox",
    name: "Dropbox",
    domains: ["dropbox.com"],
    keywords: ["dropbox"],
  },
};

/**
 * Checks whether a given root domain is an authentic, registered domain for a brand.
 */
export function isLegitimateDomainForBrand(brandKey: string, rootDomain: string): boolean {
  const normDomain = rootDomain.toLowerCase().trim();
  const domains = knownBrands[brandKey.toLowerCase()];
  if (!domains) return false;
  return domains.some(
    (d) => normDomain === d.toLowerCase() || normDomain.endsWith(`.${d.toLowerCase()}`)
  );
}

/**
 * Finds a brand by checking if the given root domain belongs to any known brand.
 */
export function findBrandByDomain(domain: string): BrandInfo | null {
  const normDomain = domain.toLowerCase().trim();
  for (const [key, brand] of Object.entries(BRAND_CATALOG)) {
    if (
      brand.domains.some(
        (d) => normDomain === d.toLowerCase() || normDomain.endsWith(`.${d.toLowerCase()}`)
      )
    ) {
      return brand;
    }
  }
  return null;
}

/**
 * Calculates Levenshtein Distance between two strings for typosquatting detection.
 */
export function calculateLevenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Normalizes visual homoglyphs and leetspeak substitutions:
 * 0 -> o
 * 1, | -> l
 * rn -> m
 * vv -> w
 * 5 -> s
 * 3 -> e
 */
export function normalizeHomoglyphs(str: string): string {
  return str
    .toLowerCase()
    .replace(/rn/g, "m")
    .replace(/vv/g, "w")
    .replace(/0/g, "o")
    .replace(/[1|!]/g, "l")
    .replace(/5/g, "s")
    .replace(/3/g, "e")
    .replace(/@/g, "a")
    .replace(/4/g, "a");
}

export interface LookalikeDetectionResult {
  brandKey: string;
  brandName: string;
  matchType:
    | "exact_subdomain_impersonation"
    | "typosquatting_substitution"
    | "typosquatting_edit_distance"
    | "hyphenated_brand_lure"
    | "brand_keyword_in_unauthorized_domain";
  matchedString: string;
  actualRootDomain: string;
  explanation: string;
}

const SECURITY_TERMS = [
  "login",
  "signin",
  "verify",
  "verification",
  "security",
  "support",
  "secure",
  "account",
  "auth",
  "confirm",
  "update",
  "recover",
  "help",
];

/**
 * Comprehensive lookalike and brand impersonation detection engine.
 *
 * Rules:
 * 1. Checks if the root domain itself is legitimate for the brand. If YES -> NO impersonation.
 * 2. Checks if a known brand keyword appears in subdomains while root domain is different.
 * 3. Checks if root domain uses character substitutions (e.g. paypa1.com, micros0ft.com, instagrarn.com).
 * 4. Checks if root domain uses hyphenated brand names (e.g. instagram-login.com, paypal-security.com).
 * 5. Checks if root domain has low edit distance to a known brand name (typosquatting).
 */
export function detectBrandImpersonation(
  hostname: string,
  rootDomain: string
): LookalikeDetectionResult | null {
  const normHost = hostname.toLowerCase().trim();
  const normRoot = rootDomain.toLowerCase().trim();
  const rootNameOnly = normRoot.split(".")[0]; // e.g. "example" from "example.com" or "paypa1" from "paypa1.com"

  for (const [key, brand] of Object.entries(BRAND_CATALOG)) {
    const isAuthentic = isLegitimateDomainForBrand(key, normRoot);

    // If root domain belongs to this brand, this is legitimate traffic for this brand.
    if (isAuthentic) {
      continue;
    }

    const brandKeyword = brand.keywords[0] || key;

    // A. Subdomain Impersonation
    // e.g. secure-instagram.example.com, instagram.example.com, instagram-login.example.com
    const subdomainParts = normHost.slice(0, normHost.length - normRoot.length).replace(/\.$/, "");
    if (subdomainParts) {
      // Check if brand keyword appears in subdomain
      const subTokens = subdomainParts.split(/[\.-]/);
      const containsBrandInSub = subTokens.includes(brandKeyword) || subdomainParts.includes(brandKeyword);

      if (containsBrandInSub) {
        return {
          brandKey: key,
          brandName: brand.name,
          matchType: "exact_subdomain_impersonation",
          matchedString: subdomainParts,
          actualRootDomain: normRoot,
          explanation: `The hostname uses the brand name '${brand.name}' in a subdomain while the registered root domain is '${normRoot}'.`,
        };
      }

      // Check homoglyph/typo in subdomain (e.g. paypa1.example.com)
      const normalizedSub = normalizeHomoglyphs(subdomainParts);
      if (normalizedSub.includes(brandKeyword) && !subdomainParts.includes(brandKeyword)) {
        return {
          brandKey: key,
          brandName: brand.name,
          matchType: "typosquatting_substitution",
          matchedString: subdomainParts,
          actualRootDomain: normRoot,
          explanation: `The subdomain contains a deceptive look-alike variation of '${brand.name}' with substituted characters while pointing to '${normRoot}'.`,
        };
      }
    }

    // B. Root Domain Homoglyph / Character Substitution
    // e.g. paypa1.com, micros0ft.com, instagrarn.com, amaz0n.com
    const normalizedRootName = normalizeHomoglyphs(rootNameOnly);

    // If normalized string equals brand or contains brand + security word
    if (normalizedRootName === brandKeyword && rootNameOnly !== brandKeyword) {
      return {
        brandKey: key,
        brandName: brand.name,
        matchType: "typosquatting_substitution",
        matchedString: normRoot,
        actualRootDomain: normRoot,
        explanation: `The domain '${normRoot}' uses character substitution (look-alike glyphs) mimicking the '${brand.name}' brand.`,
      };
    }

    // C. Hyphenated Brand + Security Lures in Root Domain
    // e.g. instagram-secure.com, instagram-login.com, paypal-security.com, amaz0n-support.com
    for (const term of SECURITY_TERMS) {
      const hyphenPattern1 = `${brandKeyword}-${term}`;
      const hyphenPattern2 = `${term}-${brandKeyword}`;

      if (rootNameOnly.includes(hyphenPattern1) || rootNameOnly.includes(hyphenPattern2)) {
        return {
          brandKey: key,
          brandName: brand.name,
          matchType: "hyphenated_brand_lure",
          matchedString: normRoot,
          actualRootDomain: normRoot,
          explanation: `The registered domain '${normRoot}' pairs the brand '${brand.name}' with a security or login term, a common tactic for phishing infrastructure.`,
        };
      }

      // Also check normalized homoglyph version of hyphenated pattern (e.g. micros0ft-login.com)
      if (normalizedRootName.includes(hyphenPattern1) || normalizedRootName.includes(hyphenPattern2)) {
        return {
          brandKey: key,
          brandName: brand.name,
          matchType: "typosquatting_substitution",
          matchedString: normRoot,
          actualRootDomain: normRoot,
          explanation: `The registered domain '${normRoot}' uses visual substitution and brand impersonation to impersonate '${brand.name}'.`,
        };
      }
    }

    // D. Edit Distance / Typosquatting (missing, extra, or transposed character)
    // e.g. instagran.com (dist 1), paypall.com (dist 1)
    if (rootNameOnly.length >= 4 && Math.abs(rootNameOnly.length - brandKeyword.length) <= 2) {
      const dist = calculateLevenshteinDistance(rootNameOnly, brandKeyword);
      if (dist === 1 && rootNameOnly !== brandKeyword) {
        return {
          brandKey: key,
          brandName: brand.name,
          matchType: "typosquatting_edit_distance",
          matchedString: normRoot,
          actualRootDomain: normRoot,
          explanation: `The domain '${normRoot}' is a slight typo/variation of the authentic '${brand.name}' domain, indicative of typosquatting.`,
        };
      }
    }
  }

  return null;
}
