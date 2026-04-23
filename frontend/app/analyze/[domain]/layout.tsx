import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { domain: string };
}): Promise<Metadata> {
  const domain = decodeURIComponent(params.domain);
  return {
    title: `${domain} — Threat Analysis`,
    description: `DNS threat intelligence report for ${domain}. Check DNSSEC, WHOIS, certificates, passive DNS, typosquatting, and more.`,
    openGraph: {
      title: `${domain} — DNS Guard Threat Report`,
      description: `Full DNS security analysis for ${domain}.`,
    },
  };
}

export default function AnalyzeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
