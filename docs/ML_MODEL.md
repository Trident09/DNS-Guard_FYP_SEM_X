# ML Model

## Overview

DNS Guard uses an ensemble threat scoring model that combines rule-based heuristics with an MLP neural network to produce a 0–100 threat score for any domain.

---

## Feature Vector (40 features)

Features are extracted from the domain string and its DNS records.

### Lexical Features (indices 0–11)

| # | Name | Description |
|---|---|---|
| 0 | `domain_length` | Total character length of the domain |
| 1 | `sld_length` | Length of the second-level domain (SLD) |
| 2 | `subdomain_depth` | Number of dots (subdomain nesting level) |
| 3 | `hyphen_count` | Number of hyphens in the domain |
| 4 | `sld_entropy` | Shannon entropy of the SLD — high entropy suggests DGA |
| 5 | `digit_ratio` | Ratio of digits to total characters in SLD |
| 6 | `consonant_ratio` | Ratio of consonants in SLD |
| 7 | `long_digit_seq` | 1 if SLD contains 4+ consecutive digits |
| 8 | `high_risk_tld` | 1 if TLD is in the high-risk list (tk, ml, xyz, top…) |
| 9 | `brand_impersonation` | 1 if SLD contains a known brand name |
| 10 | `phish_keywords` | 1 if SLD contains phishing keywords (login, secure, verify…) |
| 11 | `spam_keywords` | 1 if SLD contains spam keywords (free, win, prize…) |

### DNS Record Features (indices 12–25)

| # | Name | Description |
|---|---|---|
| 12 | `has_a_record` | A record present |
| 13 | `has_aaaa_record` | AAAA record present |
| 14 | `has_mx_record` | MX record present |
| 15 | `ns_count` | Number of NS records |
| 16 | `a_record_count` | Number of A records (>5 suggests fast-flux) |
| 17 | `has_soa` | SOA record present |
| 18 | `has_cname` | CNAME record present |
| 19 | `spf_present` | SPF TXT record present |
| 20 | `dmarc_present` | DMARC TXT record present |
| 21 | `dkim_present` | DKIM TXT record present |
| 22 | `spf_includes` | SPF record uses `include:` directive |
| 23 | `fast_flux` | More than 5 A records (fast-flux indicator) |
| 24 | `many_ns` | More than 6 NS servers |
| 25 | `no_mx_has_a` | Has A record but no MX (unusual for legitimate domains) |

### DNSSEC Features (indices 26–28)

| # | Name | Description |
|---|---|---|
| 26 | `dnskey_present` | DNSKEY record found |
| 27 | `rrsig_present` | RRSIG record found |
| 28 | `ds_present` | DS record found in parent zone |

### Composite Features (indices 29–35)

| # | Name | Description |
|---|---|---|
| 29 | `no_dnssec` | Neither DNSKEY nor RRSIG present |
| 30 | `mx_no_spf` | Has MX but no SPF — email spoofing possible |
| 31 | `mx_no_dmarc` | Has MX but no DMARC — no email auth policy |
| 32 | `very_long_sld` | SLD longer than 20 characters |
| 33 | `high_entropy_sld` | SLD entropy > 3.5 (DGA-like) |
| 34 | `deep_subdomain` | More than 3 dots (deep nesting) |
| 35 | `brand_in_subdomain` | Known brand appears in subdomain but not the SLD |

---

## Scoring

### Rule-Based Component

Each active feature contributes a weighted score:

| Impact | Features | Weight |
|---|---|---|
| High | `high_risk_tld`, `brand_impersonation`, `phish_keywords`, `fast_flux`, `brand_in_subdomain` | 3× |
| Medium | `no_dnssec`, `mx_no_spf`, `mx_no_dmarc`, `high_entropy_sld` | 2× |
| Low | All others | 1× |

### MLP Neural Network

A scikit-learn `MLPClassifier` trained on labeled domain datasets. The ensemble combines the rule score and MLP output with equal weighting.

### Verdict Thresholds

| Score | Verdict |
|---|---|
| 0–39 | Clean |
| 40–69 | Suspicious |
| 70–100 | Malicious |

---

## Feature Importance

Each `/score` response includes a `feature_importance` array — the top 8 features that contributed to the score, sorted by contribution value. This is used to render the SHAP-style bar chart in the UI and PDF report.

```json
[
  { "feature": "No Dnssec", "value": 20.0, "impact": "medium" },
  { "feature": "Mx No Spf",  "value": 20.0, "impact": "medium" },
  { "feature": "High Risk Tld", "value": 30.0, "impact": "high" }
]
```

---

## Updating the Model

To retrain or update the ML model:

1. Add labeled domain data to `data/raw/`
2. Update `ai/app/models/ensemble.py` with new training logic
3. Save the trained model to `ai/app/models/saved/`
4. Rebuild the AI service: `docker compose up --build -d ai`
