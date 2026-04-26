"use client";

import { Shield, Lock, CheckCircle, AlertTriangle, Info } from "lucide-react";

export default function DnssecTutorialPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Lock className="w-12 h-12 text-blue-400" />
            <h1 className="text-4xl font-bold">DNSSEC Implementation Guide</h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Learn how to secure your DNS infrastructure with DNSSEC. A comprehensive guide covering installation, configuration, and zone signing.
          </p>
        </div>

        {/* What is DNSSEC */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">What is DNSSEC?</h2>
          <p className="text-gray-400 mb-8">
            Domain Name System Security Extensions (DNSSEC) adds security to DNS by enabling cryptographic verification of DNS responses, protecting against cache poisoning and other attacks.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Authentication</h3>
              <p className="text-gray-400 text-sm">DNSSEC uses digital signatures to authenticate DNS responses, ensuring the data comes from the authoritative source.</p>
            </div>
            
            <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Data Integrity</h3>
              <p className="text-gray-400 text-sm">Cryptographic hashes protect DNS data from modification in transit, maintaining the integrity of your DNS records.</p>
            </div>
            
            <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Chain of Trust</h3>
              <p className="text-gray-400 text-sm">DNSSEC establishes a hierarchical chain of trust from the root zone down to your domain.</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-blue-950/30 border border-blue-900/30 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <strong className="text-blue-400">Domain Used:</strong>
              <span className="text-gray-300"> This guide demonstrates DNSSEC implementation for </span>
              <code className="text-blue-400 bg-gray-900 px-2 py-0.5 rounded">labx.dnssecsd.org</code>
              <span className="text-gray-300"> using the name server </span>
              <code className="text-blue-400 bg-gray-900 px-2 py-0.5 rounded">nsx.pi.sd</code>
            </div>
          </div>
        </section>

        {/* BIND9 Installation */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">BIND9 Installation & Configuration</h2>
          
          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold shrink-0">1</div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-3">Install BIND9</h3>
                <p className="text-gray-400 mb-4">Update your system and install the necessary DNS server packages.</p>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <div className="text-green-400">sudo apt-get update</div>
                  <div className="text-green-400">sudo apt-get install bind9 bind9utils dnsutils</div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold shrink-0">2</div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-3">Configure BIND9 Options</h3>
                <p className="text-gray-400 mb-4">Edit the main configuration file to set up listening addresses and security settings.</p>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4">
                  <div className="text-green-400 mb-2">sudo vim /etc/bind/named.conf.options</div>
                  <div className="text-gray-500 mb-1"># Configuration options:</div>
                  <div className="text-gray-300">options {"{"}</div>
                  <div className="text-gray-300 ml-4">listen-on {"{"} 127.0.0.1; x.x.x.x; {"}"};</div>
                  <div className="text-gray-300 ml-4">zone-statistics yes;</div>
                  <div className="text-gray-300 ml-4">version none;</div>
                  <div className="text-gray-300 ml-4">hostname none;</div>
                  <div className="text-gray-300 ml-4">allow-transfer {"{"} none; {"}"};</div>
                  <div className="text-gray-300 ml-4">auth-nxdomain no;</div>
                  <div className="text-gray-300 ml-4">recursion no;</div>
                  <div className="text-gray-300">{"}"};</div>
                </div>
                <div className="p-4 rounded-lg bg-yellow-950/30 border border-yellow-900/30 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <strong className="text-yellow-400">Security Note:</strong>
                    <span className="text-gray-300"> Setting </span>
                    <code className="text-yellow-400 bg-gray-900 px-1.5 py-0.5 rounded text-xs">recursion no</code>
                    <span className="text-gray-300"> and </span>
                    <code className="text-yellow-400 bg-gray-900 px-1.5 py-0.5 rounded text-xs">allow-transfer {"{"} none; {"}"}</code>
                    <span className="text-gray-300"> enhances security.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold shrink-0">3</div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-3">Enable and Start BIND9</h3>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 text-gray-300">Service Management Commands:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <code className="text-green-400 bg-gray-950 px-2 py-1 rounded">sudo systemctl enable named</code>
                      <span className="text-gray-500">- Enable auto-start</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <code className="text-green-400 bg-gray-950 px-2 py-1 rounded">sudo systemctl restart named</code>
                      <span className="text-gray-500">- Restart the service</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <code className="text-green-400 bg-gray-950 px-2 py-1 rounded">sudo systemctl status named</code>
                      <span className="text-gray-500">- Check service status</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Zone Configuration */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Zone Configuration</h2>
          
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold shrink-0">1</div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-3">Create Zone Directory and File</h3>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4">
                  <div className="text-green-400">sudo mkdir /var/cache/bind/master</div>
                  <div className="text-green-400">sudo vim /var/cache/bind/master/db.labx.dnssecsd.org</div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 text-gray-300">Zone File Content:</h4>
                  <pre className="text-xs text-gray-400 overflow-x-auto">{`$TTL 10800
labx.dnssecsd.org. IN SOA nsx.pi.sd. noc.pi.sd. (
    2024120001 ; serial
    10800      ; refresh
    3600       ; retry
    604800     ; expire
    10800      ; minimum
)
labx.dnssecsd.org. IN NS nsx.pi.sd.
labx.dnssecsd.org. 800 IN A 102.130.255.x
labx.dnssecsd.org. 800 IN MX 0 mail.labx.dnssecsd.org.`}</pre>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold shrink-0">2</div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-3">Configure Zone in BIND</h3>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <div className="text-green-400 mb-2">sudo vim /etc/bind/named.conf.local</div>
                  <div className="text-gray-500 mb-1"># Add zone configuration:</div>
                  <div className="text-gray-300">{`zone "labx.dnssecsd.org." {
    type master;
    file "master/db.labx.dnssecsd.org";
    masterfile-format text;
};`}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DNSSEC Zone Signing */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">DNSSEC Zone Signing</h2>
          
          <div className="p-4 rounded-lg bg-blue-950/30 border border-blue-900/30 flex items-start gap-3 mb-8">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
            <div className="text-sm text-gray-300">
              <strong className="text-blue-400">Algorithm Choice:</strong> This guide uses ECDSA P-256 with SHA-256 (Algorithm 13), providing strong security with smaller key sizes.
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold shrink-0">1</div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-3">Generate DNSSEC Keys</h3>
                <p className="text-gray-400 mb-4">Create both Zone Signing Key (ZSK) and Key Signing Key (KSK) pairs.</p>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <div className="text-green-400">sudo mkdir /var/cache/bind/keys</div>
                  <div className="text-green-400">cd /var/cache/bind/keys</div>
                  <div className="text-gray-500 mt-2"># Generate Zone Signing Key (ZSK)</div>
                  <div className="text-green-400">sudo dnssec-keygen -3 -a ECDSAP256SHA256 labx.dnssecsd.org</div>
                  <div className="text-gray-500 mt-2"># Generate Key Signing Key (KSK)</div>
                  <div className="text-green-400">sudo dnssec-keygen -f KSK -3 -a ECDSAP256SHA256 labx.dnssecsd.org</div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold shrink-0">2</div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-3">Configure Automatic Signing</h3>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <div className="text-gray-500 mb-1"># Updated zone configuration:</div>
                  <div className="text-gray-300">{`zone "labx.dnssecsd.org." {
    type master;
    file "master/db.labx.dnssecsd.org";
    masterfile-format text;
    auto-dnssec maintain;
    inline-signing yes;
    key-directory "/var/cache/bind/keys";
};`}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold shrink-0">3</div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-3">Generate DS Record</h3>
                <p className="text-gray-400 mb-4">Create the DS (Delegation Signer) record for the parent zone.</p>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4">
                  <div className="text-green-400">cd /var/cache/bind/keys</div>
                  <div className="text-green-400">sudo dnssec-dsfromkey &lt;KSK.key public key&gt;</div>
                </div>
                <div className="p-4 rounded-lg bg-yellow-950/30 border border-yellow-900/30 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
                  <div className="text-sm text-gray-300">
                    <strong className="text-yellow-400">Important:</strong> Send this DS record to your parent zone administrator to complete the DNSSEC chain of trust.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Verification */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">DNSSEC Verification</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
              <h3 className="text-xl font-semibold mb-3">Command Line Verification</h3>
              <div className="space-y-2 text-sm">
                <code className="block text-green-400 bg-gray-950 px-3 py-2 rounded">dig @a.mail.sd +dnssec labx.dnssecsd.org. DS</code>
                <code className="block text-green-400 bg-gray-950 px-3 py-2 rounded">dig +dnssec +multiline labx.dnssecsd.org</code>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
              <h3 className="text-xl font-semibold mb-3">Online DNSSEC Tools</h3>
              <div className="space-y-2 text-sm">
                <a href="http://dnsviz.net" target="_blank" className="block text-blue-400 hover:text-blue-300">DNSViz - Visual DNSSEC Analysis</a>
                <a href="https://dnssec-analyzer.verisignlabs.com/" target="_blank" className="block text-blue-400 hover:text-blue-300">Verisign DNSSEC Analyzer</a>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-green-950/30 border border-green-900/30 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
            <div className="text-sm text-gray-300">
              <strong className="text-green-400">Success Indicators:</strong> Your DNSSEC implementation is working correctly when you can query DNSKEY records, see RRSIG signatures on responses, and online validators show a complete chain of trust.
            </div>
          </div>

          {/* DNSViz Image */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-4 text-center">DNSViz Visualization</h3>
            <p className="text-gray-400 text-center mb-6">Visual representation of the DNSSEC chain of trust for labx.dnssecsd.org</p>
            <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
              <img
                src="https://i.imgur.com/SqZshop.png"
                alt="DNSViz visualization"
                className="w-full rounded-lg"
              />
              <p className="text-gray-500 text-sm text-center mt-4 italic">
                DNSViz analysis showing the complete DNSSEC validation path from root to labx.dnssecsd.org
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
