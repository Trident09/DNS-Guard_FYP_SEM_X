"use client";

import { Shield, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 flex items-center px-6 py-3 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/50">
      <div className="flex items-center gap-2 w-1/3 cursor-pointer" onClick={() => router.push("/")}>
        <Shield className="w-5 h-5 text-blue-400" />
        <span className="font-bold tracking-tight">DNS Guard</span>
      </div>
      <div className="flex justify-center w-1/3">
        <button
          onClick={() => router.push("/docs")}
          className="flex items-center gap-2 px-4 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors border border-gray-700"
        >
          <BookOpen className="w-4 h-4" />
          Documentation
        </button>
      </div>
      <div className="flex justify-end w-1/3" />
    </nav>
  );
}
