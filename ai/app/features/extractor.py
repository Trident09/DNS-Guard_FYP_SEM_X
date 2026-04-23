"""
Feature extraction for DNS threat scoring.
Produces a fixed-length feature vector from domain + DNS data.
"""
import math
import re
from typing import Any


# High-risk TLDs based on abuse statistics
HIGH_RISK_TLDS = {
    "tk", "ml", "ga", "cf", "gq", "xyz", "top", "club", "online",
    "site", "icu", "buzz", "cyou", "fun", "live",
}

COMMON_BRANDS = [
    "paypal", "google", "microsoft", "apple", "amazon", "facebook",
    "netflix", "instagram", "twitter", "linkedin", "bankofamerica",
    "chase", "wellsfargo", "dropbox", "adobe",
]


def _entropy(s: str) -> float:
    if not s:
        return 0.0
    freq = {c: s.count(c) / len(s) for c in set(s)}
    return -sum(p * math.log2(p) for p in freq.values())


def _digit_ratio(s: str) -> float:
    return sum(c.isdigit() for c in s) / max(len(s), 1)


def _consonant_ratio(s: str) -> float:
    consonants = set("bcdfghjklmnpqrstvwxyz")
    return sum(c in consonants for c in s.lower()) / max(len(s), 1)


def extract(domain: str, dns_data: dict[str, Any]) -> list[float]:
    """Returns a list of floats (feature vector)."""
    parts = domain.lower().split(".")
    tld = parts[-1] if len(parts) > 1 else ""
    sld = parts[-2] if len(parts) > 1 else parts[0]
    records: dict = dns_data.get("records", {})
    dnssec: dict = dns_data.get("dnssec", {})

    txt_records = " ".join(records.get("TXT", []))

    features = [
        # --- Lexical (12) ---
        len(domain),                                          # 0: domain length
        len(sld),                                             # 1: SLD length
        domain.count("."),                                    # 2: subdomain depth
        domain.count("-"),                                    # 3: hyphen count
        _entropy(sld),                                        # 4: SLD entropy
        _digit_ratio(sld),                                    # 5: digit ratio in SLD
        _consonant_ratio(sld),                                # 6: consonant ratio
        float(bool(re.search(r"\d{4,}", sld))),               # 7: long digit sequence
        float(tld in HIGH_RISK_TLDS),                         # 8: high-risk TLD
        float(any(b in sld for b in COMMON_BRANDS)),          # 9: brand impersonation
        float(bool(re.search(r"(login|secure|verify|update|account|confirm)", sld))),  # 10: phish keywords
        float(bool(re.search(r"(free|win|prize|lucky|bonus)", sld))),                  # 11: spam keywords

        # --- DNS Records (14) ---
        float(bool(records.get("A"))),                        # 12: has A record
        float(bool(records.get("AAAA"))),                     # 13: has AAAA record
        float(bool(records.get("MX"))),                       # 14: has MX record
        len(records.get("NS", [])),                           # 15: NS count
        len(records.get("A", [])),                            # 16: A record count (fast-flux indicator)
        float(bool(records.get("SOA"))),                      # 17: has SOA
        float(bool(records.get("CNAME"))),                    # 18: has CNAME
        float("v=spf1" in txt_records),                       # 19: SPF present
        float("v=DMARC1" in txt_records),                     # 20: DMARC present
        float("v=DKIM1" in txt_records),                      # 21: DKIM present
        float("include:" in txt_records),                     # 22: SPF includes
        float(len(records.get("A", [])) > 5),                 # 23: fast-flux (many A records)
        float(len(records.get("NS", [])) > 6),                # 24: many NS servers
        float(not records.get("MX") and bool(records.get("A"))),  # 25: no MX but has A

        # --- DNSSEC (3) ---
        float(dnssec.get("dnskey", False)),                   # 26: DNSKEY present
        float(dnssec.get("rrsig", False)),                    # 27: RRSIG present
        float(dnssec.get("ds", False)),                       # 28: DS present

        # --- Derived / Composite (7) ---
        float(not dnssec.get("dnskey") and not dnssec.get("rrsig")),  # 29: no DNSSEC at all
        float("v=spf1" not in txt_records and bool(records.get("MX"))),  # 30: MX but no SPF
        float("v=DMARC1" not in txt_records and bool(records.get("MX"))),  # 31: MX but no DMARC
        float(len(sld) > 20),                                 # 32: very long SLD
        float(_entropy(sld) > 3.5),                           # 33: high entropy (DGA-like)
        float(domain.count(".") > 3),                         # 34: deep subdomain
        float(
            any(b in domain and b not in sld for b in COMMON_BRANDS)
        ),                                                    # 35: brand in subdomain not SLD

        # --- Padding to 40 (reserved for future features) ---
        0.0, 0.0, 0.0, 0.0,                                  # 36-39
    ]

    return features


FEATURE_NAMES = [
    "domain_length", "sld_length", "subdomain_depth", "hyphen_count",
    "sld_entropy", "digit_ratio", "consonant_ratio", "long_digit_seq",
    "high_risk_tld", "brand_impersonation", "phish_keywords", "spam_keywords",
    "has_a_record", "has_aaaa_record", "has_mx_record", "ns_count",
    "a_record_count", "has_soa", "has_cname", "spf_present",
    "dmarc_present", "dkim_present", "spf_includes", "fast_flux",
    "many_ns", "no_mx_has_a", "dnskey_present", "rrsig_present",
    "ds_present", "no_dnssec", "mx_no_spf", "mx_no_dmarc",
    "very_long_sld", "high_entropy_sld", "deep_subdomain", "brand_in_subdomain",
    "reserved_36", "reserved_37", "reserved_38", "reserved_39",
]
