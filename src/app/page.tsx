'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  QrCode,
  ArrowRight,
  Lock,
  CheckCircle2,
  Users,
  Building2,
  Clock,
  FileText,
  BarChart3,
  Camera,
  UserCheck,
  Terminal,
  Cpu,
  Layers,
  Activity,
  Key,
} from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { Button } from '../components/ui/button';

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-foreground flex flex-col selection:bg-black selection:text-white cursor-grid-pattern">
      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-none bg-black flex items-center justify-center text-white border border-zinc-700">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight font-mono text-foreground leading-none block">
                HAVEN
              </span>
              <span className="text-[9px] font-mono text-muted tracking-widest uppercase block">
                VMS.PLATFORM
              </span>
            </div>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-zinc-600">
            <a href="#features" className="hover:text-black transition-colors">
              [CAPABILITIES]
            </a>
            <a href="#workflow" className="hover:text-black transition-colors">
              [WORKFLOW]
            </a>
            <a href="#spec" className="hover:text-black transition-colors">
              [ARCHITECTURE]
            </a>
          </nav>

          {/* Auth State Button */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="sm" variant="primary">
                  <span>Enter Console</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button size="sm" variant="outline" className="hidden sm:inline-flex">
                    <span>Sign In</span>
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="sm" variant="primary">
                    <span>Launch Platform</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-border bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          {/* Technical Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 border border-zinc-300 text-foreground text-xs font-mono tracking-tight">
            <span className="w-1.5 h-1.5 rounded-none bg-emerald-500 animate-pulse" />
            <span>CORE_V2.4 // CRYPTOGRAPHIC VISITOR PROTOCOLS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.08] font-sans max-w-4xl mx-auto">
            Physical Access Management Built for Precision Workspaces.
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 font-mono max-w-2xl mx-auto leading-relaxed">
            Multi-tenant security, host pre-approvals, live camera QR verification, and automated regulatory audit trails in one unified console.
          </p>

          {/* CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href={isAuthenticated ? '/dashboard' : '/login'}>
              <Button size="lg" variant="primary" className="w-full sm:w-auto px-6">
                <span>Access Console</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <a href="#spec">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-6 font-mono text-xs">
                <span>View Security Spec</span>
              </Button>
            </a>
          </div>

          {/* Technical Telemetry Dashboard Box Preview */}
          <div className="pt-10 max-w-4xl mx-auto">
            <div className="border border-border bg-zinc-950 text-left p-0 shadow-2xl overflow-hidden font-mono text-xs">
              {/* Window Header */}
              <div className="px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-zinc-400 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-none bg-zinc-700 inline-block" />
                  <span className="text-zinc-200">HAVEN_TELEMETRY_ENGINE.EXE</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400">● LIVE_FEED</span>
                  <span>TLS 1.3 / ENCRYPTED</span>
                </div>
              </div>

              {/* Window Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-800 p-4 sm:p-6 gap-4 md:gap-0 bg-black text-zinc-300">
                <div className="md:pr-6 space-y-3">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Pass Verification</div>
                  <div className="p-3 bg-zinc-900/80 border border-zinc-800 space-y-2">
                    <div className="flex justify-between items-center text-zinc-400 text-[11px]">
                      <span>TOKEN_HASH</span>
                      <span className="text-emerald-400">VALID</span>
                    </div>
                    <div className="text-lg font-bold text-white tracking-widest font-mono">HV-849204</div>
                    <div className="text-[10px] text-zinc-500">EXPIRES: 24h // SINGLE_USE</div>
                  </div>
                </div>

                <div className="md:px-6 space-y-3">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Premises Real-Time</div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-500">Currently Inside:</span>
                      <span className="text-white font-bold">14 Visitors</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-500">Today Check-ins:</span>
                      <span className="text-white font-bold">42 Verified</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-500">Pending Approvals:</span>
                      <span className="text-amber-400 font-bold">3 Awaiting</span>
                    </div>
                  </div>
                </div>

                <div className="md:pl-6 space-y-3">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Live Security Scanner</div>
                  <div className="border border-zinc-800 bg-zinc-900/60 p-3 relative flex items-center justify-center">
                    <div className="text-center space-y-1">
                      <QrCode className="w-8 h-8 text-zinc-400 mx-auto" />
                      <div className="text-[10px] text-emerald-400 tracking-wider">SCANNER_READY</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Hairline Grid Capabilities Matrix */}
      <section id="features" className="py-16 sm:py-24 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-10 space-y-1">
            <span className="text-[11px] font-mono text-zinc-500 tracking-wider uppercase">[01 // CAPABILITIES]</span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-sans">
              Engineered for absolute perimeter accountability.
            </h2>
          </div>

          {/* Sharp boxy grid with 1px border dividers */}
          <div className="grid grid-cols-1 md:grid-cols-3 border border-border divide-y md:divide-y-0 md:divide-x divide-border bg-white">
            <div className="p-6 sm:p-8 space-y-3">
              <div className="w-8 h-8 rounded-none bg-black text-white flex items-center justify-center font-mono text-xs">
                01
              </div>
              <h3 className="text-base font-bold text-foreground tracking-tight">Dynamic QR Passes</h3>
              <p className="text-xs text-muted font-mono leading-relaxed">
                Cryptographically signed access tokens generated upon approval. Verifiable offline with zero internet dependency at gates.
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-3">
              <div className="w-8 h-8 rounded-none bg-black text-white flex items-center justify-center font-mono text-xs">
                02
              </div>
              <h3 className="text-base font-bold text-foreground tracking-tight">Host Signoff Workflows</h3>
              <p className="text-xs text-muted font-mono leading-relaxed">
                Employees receive real-time notifications to review and authorize visit requests before guests arrive at reception.
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-3">
              <div className="w-8 h-8 rounded-none bg-black text-white flex items-center justify-center font-mono text-xs">
                03
              </div>
              <h3 className="text-base font-bold text-foreground tracking-tight">Camera QR Check-ins</h3>
              <p className="text-xs text-muted font-mono leading-relaxed">
                Live camera scanner with audio chimes and optical laser guides for instantaneous badge scans at front desk kiosks.
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-3">
              <div className="w-8 h-8 rounded-none bg-black text-white flex items-center justify-center font-mono text-xs">
                04
              </div>
              <h3 className="text-base font-bold text-foreground tracking-tight">Strict Tenant Isolation</h3>
              <p className="text-xs text-muted font-mono leading-relaxed">
                Organization context is enforced at the database level. Each company’s visitor records, employees, and policies are strictly segregated.
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-3">
              <div className="w-8 h-8 rounded-none bg-black text-white flex items-center justify-center font-mono text-xs">
                05
              </div>
              <h3 className="text-base font-bold text-foreground tracking-tight">Immutable Audit Ledger</h3>
              <p className="text-xs text-muted font-mono leading-relaxed">
                Every login, approval, entry stamp, and pass invalidation is recorded permanently for compliance and forensic review.
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-3">
              <div className="w-8 h-8 rounded-none bg-black text-white flex items-center justify-center font-mono text-xs">
                06
              </div>
              <h3 className="text-base font-bold text-foreground tracking-tight">Automated CSV Exports</h3>
              <p className="text-xs text-muted font-mono leading-relaxed">
                Generate high-throughput attendance summaries and compliance reports across customizable time windows with 1-click downloads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Technical Architecture Spec */}
      <section id="spec" className="py-16 sm:py-24 border-b border-border bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-8 space-y-1">
            <span className="text-[11px] font-mono text-zinc-500 tracking-wider uppercase">[02 // SPECIFICATION]</span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-sans">
              System Architecture & Cryptography
            </h2>
          </div>

          <div className="border border-border overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-zinc-100 text-zinc-700 uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="py-3 px-4 font-semibold">Subsystem</th>
                  <th className="py-3 px-4 font-semibold">Specification</th>
                  <th className="py-3 px-4 font-semibold">Standard</th>
                  <th className="py-3 px-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                <tr>
                  <td className="py-3 px-4 font-bold text-black">Pass Signature</td>
                  <td className="py-3 px-4 text-zinc-600">32-Byte Cryptographic Nonce + SHA-256</td>
                  <td className="py-3 px-4 text-zinc-500">ISO/IEC 18004</td>
                  <td className="py-3 px-4 text-right text-emerald-600 font-semibold">[VERIFIED]</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-black">Authentication</td>
                  <td className="py-3 px-4 text-zinc-600">JWT Bearer Header + Role-Based Guarding</td>
                  <td className="py-3 px-4 text-zinc-500">RFC 7519</td>
                  <td className="py-3 px-4 text-right text-emerald-600 font-semibold">[VERIFIED]</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-black">Storage Layer</td>
                  <td className="py-3 px-4 text-zinc-600">MongoDB Multi-Tenant Isolated Repositories</td>
                  <td className="py-3 px-4 text-zinc-500">Encrypted at Rest</td>
                  <td className="py-3 px-4 text-right text-emerald-600 font-semibold">[ACTIVE]</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-black">Audit Logging</td>
                  <td className="py-3 px-4 text-zinc-600">Tamper-Evident Append-Only Transaction Ledger</td>
                  <td className="py-3 px-4 text-zinc-500">SOC2 Type II Aligned</td>
                  <td className="py-3 px-4 text-right text-emerald-600 font-semibold">[ACTIVE]</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. Minimalist Footer */}
      <footer className="py-8 bg-zinc-950 text-zinc-400 font-mono text-xs border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-none bg-emerald-400" />
            <span className="text-white font-bold tracking-tight">HAVEN PLATFORM</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-500">v2.4.0-PROD</span>
          </div>
          <div className="text-[11px] text-zinc-500">
            &copy; {new Date().getFullYear()} Haven Security. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
