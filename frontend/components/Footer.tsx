import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-8 px-4 border-t border-gray-800/50 text-center text-sm text-gray-600 bg-gray-950">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Shield className="w-4 h-4 text-blue-400/50" />
        <span>DNS Guard</span>
      </div>
      <p>Final Year Project — Domain Threat Intelligence Platform</p>
    </footer>
  );
}
