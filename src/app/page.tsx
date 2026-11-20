'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  QrCode,
  ArrowRight,
  CheckCircle2,
  Users,
  Building2,
  Clock,
  FileText,
  BarChart3,
  Camera,
  UserCheck,
  Calendar,
  Lock,
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
              <span className="text-[9px] font-mono text-muted tracking-wider uppercase block">
                Visitor Management
              </span>
            </div>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-zinc-600">
            <a href="#features" className="hover:text-black transition-colors">
              Features
            </a>
            <a href="#workflow" className="hover:text-black transition-colors">
              How It Works
            </a>
            <a href="#security" className="hover:text-black transition-colors">
              Security
            </a>
          </nav>

          {/* Auth State Button */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="sm" variant="primary">
                  <span>Go to Dashboard</span>
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
                    <span>Get Started</span>
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
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 border border-zinc-300 text-foreground text-xs font-mono tracking-tight">
            <span className="w-1.5 h-1.5 rounded-none bg-emerald-500 animate-pulse" />
            <span>MODERN WORKPLACE VISITOR MANAGEMENT</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.08] font-sans max-w-4xl mx-auto">
            The modern front desk experience for professional workplaces.
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 font-sans max-w-2xl mx-auto leading-relaxed">
            Welcome guests smoothly, coordinate employee host approvals, scan digital passes at reception, and maintain an accurate real-time log of everyone in your building.
          </p>

          {/* CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href={isAuthenticated ? '/dashboard' : '/login'}>
              <Button size="lg" variant="primary" className="w-full sm:w-auto px-6">
                <span>Sign In to Haven</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-6 font-mono text-xs">
                <span>Explore Features</span>
              </Button>
            </a>
          </div>

          {/* Front Desk Live Preview Mockup */}
          <div className="pt-10 max-w-4xl mx-auto">
            <div className="border border-border bg-zinc-950 text-left p-0 shadow-2xl overflow-hidden font-mono text-xs">
              {/* Window Header */}
              <div className="px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-zinc-400 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-none bg-zinc-700 inline-block" />
                  <span className="text-zinc-200">Haven Front Desk Console</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-none bg-emerald-400 animate-pulse" />
                    Reception Active
                  </span>
                  <span className="text-zinc-500">Main Headquarters</span>
                </div>
              </div>

              {/* Window Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-800 p-4 sm:p-6 gap-4 md:gap-0 bg-black text-zinc-300">
                <div className="md:pr-6 space-y-3 font-sans">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Visitor Pass Check</div>
                  <div className="p-3 bg-zinc-900/80 border border-zinc-800 space-y-2">
                    <div className="flex justify-between items-center text-zinc-400 text-[11px]">
                      <span>Guest Status</span>
                      <span className="text-emerald-400 font-mono font-bold">Approved</span>
                    </div>
                    <div className="text-lg font-bold text-white tracking-widest font-mono">HV-849204</div>
                    <div className="text-[11px] text-zinc-400">Guest: Sarah Jenkins • HR Meeting</div>
                  </div>
                </div>

                <div className="md:px-6 space-y-3 font-sans">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Today at a Glance</div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-400">Currently On-Site:</span>
                      <span className="text-white font-bold font-mono">14 Visitors</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-400">Expected Today:</span>
                      <span className="text-white font-bold font-mono">42 Scheduled</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400">Pending Approvals:</span>
                      <span className="text-amber-400 font-bold font-mono">3 Awaiting</span>
                    </div>
                  </div>
                </div>

                <div className="md:pl-6 space-y-3 font-sans">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Front Desk Scanner</div>
                  <div className="border border-zinc-800 bg-zinc-900/60 p-3 relative flex items-center justify-center">
                    <div className="text-center space-y-1">
                      <QrCode className="w-8 h-8 text-zinc-400 mx-auto" />
                      <div className="text-[10px] text-emerald-400 font-mono tracking-wider">CAMERA SCANNER READY</div>
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
            <span className="text-[11px] font-mono text-zinc-500 tracking-wider uppercase">Features</span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-sans">
              Everything your workplace needs to welcome visitors smoothly.
            </h2>
          </div>

          {/* Sharp boxy grid with 1px border dividers */}
          <div className="grid grid-cols-1 md:grid-cols-3 border border-border divide-y md:divide-y-0 md:divide-x divide-border bg-white">
            <div className="p-6 sm:p-8 space-y-3">
              <div className="w-8 h-8 rounded-none bg-black text-white flex items-center justify-center font-mono text-xs">
                01
              </div>
              <h3 className="text-base font-bold text-foreground tracking-tight font-sans">Digital QR Passes</h3>
              <p className="text-xs text-muted leading-relaxed font-sans">
                Visitors receive digital passes with unique QR codes for contactless, friction-free arrival and check-in.
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-3">
              <div className="w-8 h-8 rounded-none bg-black text-white flex items-center justify-center font-mono text-xs">
                02
              </div>
              <h3 className="text-base font-bold text-foreground tracking-tight font-sans">Host Notifications & Approvals</h3>
              <p className="text-xs text-muted leading-relaxed font-sans">
                Employee hosts receive timely notifications to review and approve guest visits in advance or upon arrival.
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-3">
              <div className="w-8 h-8 rounded-none bg-black text-white flex items-center justify-center font-mono text-xs">
                03
              </div>
              <h3 className="text-base font-bold text-foreground tracking-tight font-sans">Instant Pass Scanner</h3>
              <p className="text-xs text-muted leading-relaxed font-sans">
                Front desk and security staff can verify guest passes in seconds using any standard webcam or device camera.
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-3">
              <div className="w-8 h-8 rounded-none bg-black text-white flex items-center justify-center font-mono text-xs">
                04
              </div>
              <h3 className="text-base font-bold text-foreground tracking-tight font-sans">Multi-Tenant & Multi-Building</h3>
              <p className="text-xs text-muted leading-relaxed font-sans">
                Easily manage multiple tenant companies, buildings, and departments with completely segregated data.
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-3">
              <div className="w-8 h-8 rounded-none bg-black text-white flex items-center justify-center font-mono text-xs">
                05
              </div>
              <h3 className="text-base font-bold text-foreground tracking-tight font-sans">Live On-Site Visitor Logs</h3>
              <p className="text-xs text-muted leading-relaxed font-sans">
                Always know who is currently in the building, with exact arrival and departure timestamps for safety and audits.
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-3">
              <div className="w-8 h-8 rounded-none bg-black text-white flex items-center justify-center font-mono text-xs">
                06
              </div>
              <h3 className="text-base font-bold text-foreground tracking-tight font-sans">Reports & CSV Export</h3>
              <p className="text-xs text-muted leading-relaxed font-sans">
                View 7-day visit volume trends, departmental traffic, and export attendance records with one-click downloads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Security & Compliance Overview */}
      <section id="security" className="py-16 sm:py-24 border-b border-border bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-8 space-y-1">
            <span className="text-[11px] font-mono text-zinc-500 tracking-wider uppercase">Security</span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-sans">
              Built for workplace safety, privacy, and compliance.
            </h2>
          </div>

          <div className="border border-border overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-zinc-100 text-zinc-700 uppercase tracking-wider border-b border-border font-mono text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Capability</th>
                  <th className="py-3 px-4 font-semibold">Description</th>
                  <th className="py-3 px-4 font-semibold">Standard</th>
                  <th className="py-3 px-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white font-sans">
                <tr>
                  <td className="py-3 px-4 font-bold text-black font-mono">Digital Passes</td>
                  <td className="py-3 px-4 text-zinc-600">Unique, time-sensitive QR passes generated per approved visit</td>
                  <td className="py-3 px-4 text-zinc-500 font-mono text-[11px]">Contactless QR</td>
                  <td className="py-3 px-4 text-right text-emerald-600 font-mono font-semibold">Active</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-black font-mono">Access Control</td>
                  <td className="py-3 px-4 text-zinc-600">Tailored permissions for Super Admins, Org Admins, Receptionists, Security & Hosts</td>
                  <td className="py-3 px-4 text-zinc-500 font-mono text-[11px]">Role-Based Access</td>
                  <td className="py-3 px-4 text-right text-emerald-600 font-mono font-semibold">Active</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-black font-mono">Data Isolation</td>
                  <td className="py-3 px-4 text-zinc-600">Company visitor records, employee directories, and visit histories are strictly segregated</td>
                  <td className="py-3 px-4 text-zinc-500 font-mono text-[11px]">Multi-Tenant Isolation</td>
                  <td className="py-3 px-4 text-right text-emerald-600 font-mono font-semibold">Active</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-black font-mono">Visitor Logs</td>
                  <td className="py-3 px-4 text-zinc-600">Comprehensive check-in, check-out, and approval records for office safety</td>
                  <td className="py-3 px-4 text-zinc-500 font-mono text-[11px]">Audit Ready</td>
                  <td className="py-3 px-4 text-right text-emerald-600 font-mono font-semibold">Active</td>
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
            <span className="text-white font-bold tracking-tight">HAVEN VISITOR MANAGEMENT</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400 font-sans">Workplace Access Platform</span>
          </div>
          <div className="text-[11px] text-zinc-500 font-sans">
            &copy; {new Date().getFullYear()} Haven. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
