from fastapi import APIRouter
import httpx
import os
import re

router = APIRouter()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
LLM_MODEL = os.getenv("LLM_MODEL", "llama-3.1-8b-instant")


@router.post("/chat")
async def chat(req: dict):
    domain = req.get("domain", "")
    intent = req.get("intent", "")
    message = req.get("message", "")
    history = req.get("history", [])
    
    # Try Groq API first if key is available
    if GROQ_API_KEY:
        try:
            reply = await _groq_chat(domain, intent, message, history)
            return {"reply": reply}
        except Exception as e:
            print(f"Groq API error: {e}")
    
    # Fallback to context-aware responses
    reply = _context_aware_reply(intent, domain, message)
    return {"reply": reply}


async def _groq_chat(domain: str, intent: str, message: str, history: list) -> str:
    """Use Groq API for chat responses."""
    system_prompt = _get_system_prompt(intent, domain)
    
    messages = [{"role": "system", "content": system_prompt}]
    
    # Add conversation history (last 6 messages)
    for h in history[-6:]:
        messages.append({"role": h["role"], "content": h["content"]})
    
    messages.append({"role": "user", "content": message})
    
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": LLM_MODEL,
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 500
                }
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"Groq API error: {e}")
        raise


def _get_system_prompt(intent: str, domain: str) -> str:
    """Generate system prompt based on user intent."""
    base = f"You are a DNS security expert assistant helping with domain: {domain}. "
    
    if "I own" in intent:
        return base + "Provide specific, actionable security advice for domain owners. Focus on DNSSEC, email security (SPF/DKIM/DMARC), SSL/TLS, subdomain security, and monitoring. Be concise and technical."
    elif "report" in intent:
        return base + "Guide users through reporting DNS abuse. Provide specific resources and steps for reporting phishing, malware, spam, or WHOIS inaccuracies. Include relevant URLs and contact information."
    elif "learn" in intent:
        return base + "Explain DNS security concepts clearly with examples. Make technical topics accessible. Use analogies when helpful."
    else:
        return base + "Answer DNS security questions clearly and concisely. Cover topics like DNSSEC, email security, certificates, subdomains, threat intelligence, and abuse reporting."


def _context_aware_reply(intent: str, domain: str, message: str) -> str:
    """Enhanced context-aware chatbot for DNS security."""
    msg = message.lower()
    
    # Extract keywords for better context matching
    keywords = re.findall(r'\b\w+\b', msg)
    
    # DNSSEC queries
    if any(w in keywords for w in ["dnssec", "secure", "signing", "validation"]):
        if any(w in keywords for w in ["enable", "setup", "configure", "implement", "how"]):
            return (
                f"**Setting up DNSSEC for {domain}:**\n\n"
                "1. **At your DNS provider:** Generate a Key Signing Key (KSK) and Zone Signing Key (ZSK)\n"
                "2. **Sign your zone:** Your DNS records will be cryptographically signed with RRSIG records\n"
                "3. **At your registrar:** Add the DS (Delegation Signer) record to the parent zone\n"
                "4. **Verify:** Use `dig +dnssec {domain}` to confirm RRSIG records are present\n\n"
                "Popular providers with DNSSEC support: Cloudflare, Route53, Google Cloud DNS, Namecheap."
            )
        elif any(w in keywords for w in ["fail", "broken", "error", "invalid", "problem"]):
            return (
                f"**Troubleshooting DNSSEC for {domain}:**\n\n"
                "Common issues:\n"
                "• **DS record mismatch:** Ensure the DS record at your registrar matches your KSK\n"
                "• **Expired signatures:** RRSIG records have TTLs — check if they need renewal\n"
                "• **Clock skew:** DNSSEC validation is time-sensitive\n"
                "• **Missing DNSKEY:** Verify DNSKEY records are published in your zone\n\n"
                "Test with: `dig +dnssec {domain}` and check for SERVFAIL status."
            )
        return (
            f"**DNSSEC for {domain}:**\n\n"
            "DNSSEC adds cryptographic signatures to DNS records, preventing:\n"
            "• DNS cache poisoning\n"
            "• Man-in-the-middle attacks\n"
            "• DNS spoofing\n\n"
            "It uses a chain of trust from root DNS servers down to your domain. "
            "Ask me 'how to enable DNSSEC' or 'troubleshoot DNSSEC' for specific guidance."
        )
    
    # Email security (SPF, DKIM, DMARC)
    if any(w in keywords for w in ["spf", "dkim", "dmarc", "email", "mail", "spam", "spoofing"]):
        if "spf" in keywords:
            return (
                f"**SPF (Sender Policy Framework) for {domain}:**\n\n"
                "SPF is a TXT record that lists authorized mail servers:\n\n"
                "```\nv=spf1 include:_spf.google.com ~all\n```\n\n"
                "• `v=spf1` = version\n"
                "• `include:` = authorized mail provider\n"
                "• `~all` = soft fail (suspicious), `-all` = hard fail (reject)\n\n"
                "Add this TXT record at your DNS provider. Test with: `dig TXT {domain}`"
            )
        elif "dkim" in keywords:
            return (
                f"**DKIM (DomainKeys Identified Mail) for {domain}:**\n\n"
                "DKIM adds a cryptographic signature to outgoing emails:\n\n"
                "1. Your mail server generates a public/private key pair\n"
                "2. Publish the public key as a TXT record: `selector._domainkey.{domain}`\n"
                "3. Your mail server signs outgoing emails with the private key\n"
                "4. Recipients verify the signature using your public key\n\n"
                "Most email providers (Gmail, Office365) handle DKIM setup automatically."
            )
        elif "dmarc" in keywords:
            return (
                f"**DMARC (Domain-based Message Authentication) for {domain}:**\n\n"
                "DMARC tells receivers what to do when SPF/DKIM fail:\n\n"
                "```\nv=DMARC1; p=quarantine; rua=mailto:dmarc@{domain}\n```\n\n"
                "• `p=none` = monitor only\n"
                "• `p=quarantine` = send to spam\n"
                "• `p=reject` = block entirely\n"
                "• `rua=` = aggregate reports email\n\n"
                "Add this TXT record at `_dmarc.{domain}`. Start with `p=none` to monitor."
            )
        return (
            f"**Email Security for {domain}:**\n\n"
            "Three key protocols:\n"
            "• **SPF:** Lists authorized mail servers (TXT record)\n"
            "• **DKIM:** Cryptographic email signatures\n"
            "• **DMARC:** Policy for SPF/DKIM failures\n\n"
            "Together they prevent email spoofing and phishing. "
            "Ask me about 'SPF', 'DKIM', or 'DMARC' individually for setup instructions."
        )
    
    # SSL/TLS certificates
    if any(w in keywords for w in ["ssl", "tls", "certificate", "cert", "https", "encryption"]):
        if any(w in keywords for w in ["transparency", "ct", "log", "monitor"]):
            return (
                f"**Certificate Transparency for {domain}:**\n\n"
                "CT logs publicly record all SSL/TLS certificates issued for your domain. "
                "This helps detect:\n"
                "• Unauthorized certificates\n"
                "• Misissued certificates\n"
                "• Phishing sites using similar domains\n\n"
                "**Monitor your domain:**\n"
                "• crt.sh: https://crt.sh/?q={domain}\n"
                "• Facebook CT Monitor: https://developers.facebook.com/tools/ct/\n"
                "• Censys: https://search.censys.io/\n\n"
                "Set up alerts for new certificate issuance."
            )
        return (
            f"**SSL/TLS Certificates for {domain}:**\n\n"
            "Certificates encrypt traffic between users and your server (HTTPS). "
            "Key points:\n"
            "• **Let's Encrypt:** Free automated certificates (90-day validity)\n"
            "• **Certificate Transparency:** All certs are logged publicly\n"
            "• **Wildcard certs:** Cover *.{domain} but increase risk if compromised\n\n"
            "Check your certificates: `openssl s_client -connect {domain}:443`\n"
            "Or visit: https://crt.sh/?q={domain}"
        )
    
    # Subdomains
    if any(w in keywords for w in ["subdomain", "sub", "enumeration", "discovery"]):
        if any(w in keywords for w in ["dangling", "takeover", "vulnerable", "hijack"]):
            return (
                f"**Subdomain Takeover Risk for {domain}:**\n\n"
                "Dangling subdomains point to decommissioned services (AWS S3, Heroku, GitHub Pages). "
                "Attackers can claim these services and serve malicious content.\n\n"
                "**Prevention:**\n"
                "1. Audit your DNS zone regularly\n"
                "2. Remove DNS records for decommissioned services\n"
                "3. Use tools like `subjack` or `SubOver` to scan for vulnerabilities\n\n"
                "**Check now:** Review all CNAME records pointing to external services."
            )
        return (
            f"**Subdomains of {domain}:**\n\n"
            "Subdomains expand your attack surface. Common issues:\n"
            "• **Dangling DNS:** CNAMEs pointing to deleted services\n"
            "• **Forgotten subdomains:** Old dev/staging environments\n"
            "• **Wildcard DNS:** *.{domain} can be exploited\n\n"
            "**Discovery methods:**\n"
            "• Certificate Transparency logs (crt.sh)\n"
            "• DNS brute-forcing (common names)\n"
            "• Search engines (Google dorks)\n\n"
            "Regularly audit and remove unused subdomains."
        )
    
    # WHOIS
    if any(w in keywords for w in ["whois", "registrar", "registration", "owner", "expiry", "expiration"]):
        if any(w in keywords for w in ["privacy", "redacted", "hidden", "protect"]):
            return (
                f"**WHOIS Privacy for {domain}:**\n\n"
                "WHOIS privacy (domain privacy/proxy) hides your personal information:\n"
                "• Name, address, phone, email are replaced with registrar's proxy details\n"
                "• Required under GDPR for EU registrants\n"
                "• Available as an add-on from most registrars\n\n"
                "**Note:** Abuse complaints can still reach you through the proxy. "
                "Some TLDs (.gov, .edu) don't allow privacy protection."
            )
        return (
            f"**WHOIS Information for {domain}:**\n\n"
            "WHOIS records contain:\n"
            "• Registrar and registration dates\n"
            "• Expiration date (renew before it expires!)\n"
            "• Nameservers\n"
            "• Contact information (often redacted for privacy)\n\n"
            "**Lookup tools:**\n"
            "• whois.domaintools.com\n"
            "• Your registrar's WHOIS lookup\n"
            "• Command line: `whois {domain}`\n\n"
            "Monitor for unauthorized WHOIS changes — sign of domain hijacking."
        )
    
    # Phishing & typosquatting
    if any(w in keywords for w in ["phish", "phishing", "typosquat", "fake", "spoof", "impersonat", "similar"]):
        if any(w in keywords for w in ["protect", "prevent", "defend", "monitor"]):
            return (
                f"**Protecting {domain} from Typosquatting:**\n\n"
                "**Defensive registration:**\n"
                "• Register common typos: {domain.replace('.com', '.co')}, {domain.replace('.', '-.')}\n"
                "• Register other TLDs: .net, .org, .io\n\n"
                "**Monitoring:**\n"
                "• Certificate Transparency alerts (crt.sh, Facebook CT)\n"
                "• Domain registration monitoring (DomainTools, Bolster)\n"
                "• Google Alerts for your brand name\n\n"
                "**Enforcement:**\n"
                "• UDRP (Uniform Domain Dispute Resolution Policy)\n"
                "• Trademark infringement claims\n"
                "• Report to registrar's abuse team"
            )
        return (
            f"**Typosquatting & Phishing Detection for {domain}:**\n\n"
            "Attackers register similar domains to deceive users:\n"
            "• Character substitution: {domain.replace('o', '0')}\n"
            "• Homoglyphs: {domain.replace('a', 'а')} (Cyrillic 'а')\n"
            "• Hyphenation: {domain.replace('.', '-.')}\n"
            "• Different TLDs: {domain.replace('.com', '.net')}\n\n"
            "**Report phishing:**\n"
            "• PhishTank: https://phishtank.org/\n"
            "• Google Safe Browsing: https://safebrowsing.google.com/\n"
            "• Registrar's abuse contact (from WHOIS)\n\n"
            "Ask me 'how to protect from typosquatting' for defensive strategies."
        )
    
    # Threat intelligence & blocklists
    if any(w in keywords for w in ["threat", "blocklist", "blacklist", "malware", "virus", "reputation", "score"]):
        return (
            f"**Threat Intelligence for {domain}:**\n\n"
            "Your domain is checked against multiple threat feeds:\n"
            "• **Spamhaus DBL:** Spam and malware domains\n"
            "• **PhishTank:** Verified phishing sites\n"
            "• **VirusTotal:** 90+ antivirus engines\n"
            "• **AbuseIPDB:** IP reputation database\n\n"
            "**If you're blocklisted:**\n"
            "1. Identify the source (compromised site, malware, spam)\n"
            "2. Clean your site and secure it\n"
            "3. Request delisting from each blocklist\n"
            "4. Monitor for re-infection\n\n"
            "Check your status: https://www.virustotal.com/gui/domain/{domain}"
        )
    
    # DNS records
    if any(w in keywords for w in ["dns", "record", "nameserver", "ns", "mx", "txt", "cname", "aaaa"]):
        if "mx" in keywords:
            return (
                f"**MX Records for {domain}:**\n\n"
                "MX (Mail Exchange) records specify your mail servers:\n\n"
                "```\n{domain}. IN MX 10 mail.{domain}.\n{domain}. IN MX 20 backup.{domain}.\n```\n\n"
                "• Lower priority number = higher priority\n"
                "• Always have a backup MX for redundancy\n"
                "• Pair with SPF, DKIM, DMARC for email security\n\n"
                "Query: `dig MX {domain}`"
            )
        elif "txt" in keywords:
            return (
                f"**TXT Records for {domain}:**\n\n"
                "TXT records store text data, commonly used for:\n"
                "• **SPF:** Email sender authorization\n"
                "• **DKIM:** Email signature public keys\n"
                "• **DMARC:** Email authentication policy\n"
                "• **Domain verification:** Google, Microsoft, etc.\n\n"
                "Query: `dig TXT {domain}`\n\n"
                "TXT records are critical for email security — ensure SPF/DKIM/DMARC are configured."
            )
        elif any(w in keywords for w in ["cname", "alias"]):
            return (
                f"**CNAME Records for {domain}:**\n\n"
                "CNAME (Canonical Name) creates an alias:\n\n"
                "```\nwww.{domain}. IN CNAME {domain}.\n```\n\n"
                "**Important:**\n"
                "• CNAME cannot coexist with other records at the same name\n"
                "• Don't use CNAME at the apex ({domain}) — use A/AAAA or ALIAS\n"
                "• Watch for dangling CNAMEs pointing to deleted services (subdomain takeover risk)\n\n"
                "Query: `dig CNAME www.{domain}`"
            )
        return (
            f"**DNS Records for {domain}:**\n\n"
            "Common record types:\n"
            "• **A:** IPv4 address (e.g., 192.0.2.1)\n"
            "• **AAAA:** IPv6 address\n"
            "• **MX:** Mail servers\n"
            "• **CNAME:** Alias to another domain\n"
            "• **TXT:** Text data (SPF, DKIM, DMARC)\n"
            "• **NS:** Nameservers\n"
            "• **SOA:** Zone authority and serial number\n\n"
            "Query all records: `dig {domain} ANY`\n"
            "Ask me about specific record types for detailed info."
        )
    
    # Abuse reporting
    if any(w in keywords for w in ["report", "abuse", "complaint", "takedown", "malicious"]):
        return (
            f"**Reporting Abuse for {domain}:**\n\n"
            "**1. Phishing:**\n"
            "• PhishTank: https://phishtank.org/add_web_phish.php\n"
            "• Google Safe Browsing: https://safebrowsing.google.com/safebrowsing/report_phish/\n"
            "• Microsoft: https://www.microsoft.com/en-us/wdsi/support/report-unsafe-site\n\n"
            "**2. Malware:**\n"
            "• Abuse.ch: https://abuse.ch/\n"
            "• VirusTotal: Upload samples at virustotal.com\n\n"
            "**3. WHOIS Inaccuracy:**\n"
            "• ICANN WICF: https://icann.org/wicf\n\n"
            "**4. Registrar Abuse:**\n"
            "• Find abuse contact: `whois {domain} | grep -i abuse`\n"
            "• Email the registrar's abuse team with evidence\n\n"
            "Include: domain name, abuse type, evidence (screenshots, URLs), and timestamps."
        )
    
    # Greetings
    if any(w in keywords for w in ["hello", "hi", "hey", "help", "start"]):
        return (
            f"👋 **Hi! I'm your DNS Security Assistant for {domain}.**\n\n"
            "I can help you with:\n"
            "• **DNSSEC** — cryptographic DNS security\n"
            "• **Email Security** — SPF, DKIM, DMARC setup\n"
            "• **SSL/TLS Certificates** — HTTPS and Certificate Transparency\n"
            "• **Subdomains** — enumeration and takeover prevention\n"
            "• **Typosquatting** — detection and protection\n"
            "• **Threat Intelligence** — blocklists and reputation\n"
            "• **Abuse Reporting** — how to report malicious domains\n\n"
            "Just ask me anything about DNS security!"
        )
    
    # Intent-based responses
    if "I own" in intent:
        return (
            f"**Securing {domain} — Owner's Checklist:**\n\n"
            "✅ **Enable DNSSEC** — prevents DNS spoofing\n"
            "✅ **Configure SPF, DKIM, DMARC** — stops email spoofing\n"
            "✅ **Monitor Certificate Transparency** — detect unauthorized SSL certs\n"
            "✅ **Audit subdomains** — remove dangling DNS records\n"
            "✅ **Register typosquats** — defensive domain registration\n"
            "✅ **Enable WHOIS privacy** — protect personal information\n"
            "✅ **Set up DNS monitoring** — alert on unauthorized changes\n\n"
            "Ask me about any specific topic for detailed guidance!"
        )
    elif "report" in intent:
        return (
            f"**I can help you report abuse for {domain}.**\n\n"
            "What type of abuse are you reporting?\n"
            "• **Phishing** — fake login pages, scams\n"
            "• **Malware** — virus distribution, drive-by downloads\n"
            "• **Spam** — unsolicited bulk email\n"
            "• **WHOIS inaccuracy** — false registration information\n"
            "• **Trademark infringement** — brand impersonation\n\n"
            "Tell me the abuse type and I'll guide you through the reporting process."
        )
    elif "learn" in intent:
        return (
            f"**Let's learn about DNS security for {domain}!**\n\n"
            "DNS security covers several key areas:\n"
            "• **Authentication** — DNSSEC validates DNS responses\n"
            "• **Email security** — SPF/DKIM/DMARC prevent spoofing\n"
            "• **Encryption** — SSL/TLS certificates for HTTPS\n"
            "• **Monitoring** — Certificate Transparency, threat feeds\n"
            "• **Defense** — Typosquat protection, subdomain audits\n\n"
            "What would you like to learn about? Ask me anything!"
        )
    
    # Default response
    return (
        f"**I'm here to help with DNS security for {domain}.**\n\n"
        "You can ask me about:\n"
        "• DNSSEC configuration and troubleshooting\n"
        "• Email security (SPF, DKIM, DMARC)\n"
        "• SSL/TLS certificates and Certificate Transparency\n"
        "• Subdomain security and takeover prevention\n"
        "• Typosquatting and phishing protection\n"
        "• Threat intelligence and blocklists\n"
        "• How to report abuse\n\n"
        "What would you like to know?"
    )
