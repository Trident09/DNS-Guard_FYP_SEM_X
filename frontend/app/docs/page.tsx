"use client";
import { ArrowLeft, Shield, Search, FileText, AlertTriangle, Globe, Lock, Database, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DocsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto p-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Documentation
          </h1>
          <p className="text-gray-400 text-lg">
            Learn how to use DNS Guard to analyze domains for security threats and misconfigurations.
          </p>
        </div>

        {/* What is DNS Guard */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold">What is DNS Guard?</h2>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <p className="text-gray-300 leading-relaxed mb-4">
              DNS Guard is a comprehensive domain threat intelligence platform that analyzes domains for DNS abuse, 
              security misconfigurations, phishing attempts, typosquatting, and other threats. It combines multiple 
              data sources and machine learning to provide a complete security assessment.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Whether you&apos;re a security researcher, IT administrator, or just curious about a domain&apos;s reputation, 
              DNS Guard provides actionable insights in seconds.
            </p>
          </div>
        </section>

        {/* How to Use */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold">How to Use</h2>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Enter a Domain</h3>
                  <p className="text-gray-300">
                    Type any domain name (e.g., <code className="bg-gray-900 px-2 py-1 rounded text-blue-400">example.com</code>) 
                    into the search box on the home page.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Wait for Analysis</h3>
                  <p className="text-gray-300">
                    DNS Guard will perform a comprehensive scan checking DNS records, WHOIS data, SSL certificates, 
                    threat intelligence feeds, and more. This typically takes 5-15 seconds.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Review the Report</h3>
                  <p className="text-gray-300">
                    Examine the threat score, security findings, and detailed analysis across multiple categories. 
                    Use the AI chatbot for questions about specific findings.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Download PDF Report</h3>
                  <p className="text-gray-300">
                    Click the download button to generate a comprehensive PDF report for documentation or sharing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold">Key Features</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureCard
              icon={<AlertTriangle className="w-5 h-5" />}
              title="Threat Score"
              description="ML-based 0-100 risk score with explainable AI showing which factors contributed to the score."
            />
            <FeatureCard
              icon={<Lock className="w-5 h-5" />}
              title="DNSSEC Validation"
              description="Checks for DNSKEY, RRSIG, and DS records to verify DNS security extensions are properly configured."
            />
            <FeatureCard
              icon={<FileText className="w-5 h-5" />}
              title="WHOIS Analysis"
              description="Domain age, registrar info, expiry dates, and detection of newly registered or expiring domains."
            />
            <FeatureCard
              icon={<Shield className="w-5 h-5" />}
              title="Certificate Transparency"
              description="SSL certificate count, wildcard detection, and alerts for suspicious certificate issuance patterns."
            />
            <FeatureCard
              icon={<Database className="w-5 h-5" />}
              title="Passive DNS"
              description="Historical IP resolution data with fast-flux botnet detection."
            />
            <FeatureCard
              icon={<Search className="w-5 h-5" />}
              title="Typosquat Detection"
              description="Identifies domains that closely resemble popular brands using edit-distance algorithms."
            />
            <FeatureCard
              icon={<Globe className="w-5 h-5" />}
              title="Subdomain Enumeration"
              description="Discovers subdomains via brute-force and certificate transparency logs, flags suspicious patterns."
            />
            <FeatureCard
              icon={<Shield className="w-5 h-5" />}
              title="Threat Intelligence"
              description="Checks domain against Spamhaus DBL and PhishTank blocklists for known malicious activity."
            />
          </div>
        </section>

        {/* Understanding Results */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold">Understanding the Results</h2>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-2">Low Risk (0-30)</h3>
              <p className="text-gray-300">
                Domain appears legitimate with proper security configurations. No significant threats detected.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">Medium Risk (31-60)</h3>
              <p className="text-gray-300">
                Some suspicious indicators or misconfigurations detected. Review the findings and recommendations carefully.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-400 mb-2">High Risk (61-100)</h3>
              <p className="text-gray-300">
                Multiple threat indicators detected. Domain may be malicious, compromised, or severely misconfigured. 
                Exercise extreme caution.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            <FAQItem
              question="Is DNS Guard free to use?"
              answer="Yes, DNS Guard is completely free for analyzing domains. There are no usage limits or premium tiers."
            />
            <FAQItem
              question="How accurate is the threat score?"
              answer="The threat score combines machine learning with rule-based detection. While highly accurate, it should be used as one input in your security assessment, not the sole decision factor."
            />
            <FAQItem
              question="Does DNS Guard store my searches?"
              answer="Recent searches are stored locally in your browser for convenience. Analysis results are cached temporarily on the server but not permanently stored."
            />
            <FAQItem
              question="Can I use DNS Guard for commercial purposes?"
              answer="This is an academic project. For commercial use, please review the license and consider deploying your own instance."
            />
            <FAQItem
              question="What if a legitimate domain shows high risk?"
              answer="False positives can occur, especially for newly registered domains or those with unusual configurations. Review the specific findings and use the AI chatbot to understand why the score is elevated."
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-blue-400">{icon}</div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <h3 className="font-semibold text-lg mb-2">{question}</h3>
      <p className="text-gray-300">{answer}</p>
    </div>
  );
}
