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
  ChevronRight,
  Sparkles,
  ShieldAlert,
  CalendarCheck,
  Layers,
} from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export default function LandingPage() {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-border/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#22285B] flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-[#22285B] block leading-none">
                HAVEN
              </span>
              <span className="text-[9px] font-semibold text-muted tracking-wider uppercase block mt-0.5">
                Access Platform
              </span>
            </div>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-muted">
            <a href="#features" className="hover:text-foreground transition-colors">
              Capabilities
            </a>
            <a href="#workflow" className="hover:text-foreground transition-colors">
              Workflow
            </a>
            <a href="#roles" className="hover:text-foreground transition-colors">
              Role Workspaces
            </a>
            <a href="#security" className="hover:text-foreground transition-colors">
              Security Architecture
            </a>
          </nav>

          {/* Auth State Button */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="sm" variant="primary" className="shadow-xs">
                  <span>Open Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
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
                  <Button size="sm" variant="primary" className="shadow-xs">
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-border/60">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-primary/5 via-emerald-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border shadow-xs text-xs font-medium text-foreground mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-primary">Enterprise Visitor Platform</span>
            <span className="text-muted">•</span>
            <span className="text-muted">Zero-Trust Physical Security</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.15]">
            Modern visitor management with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22285B] via-[#303A7A] to-emerald-600">
              cryptographically verified passes
            </span>
          </h1>

          {/* Supporting Prose */}
          <p className="mt-5 text-sm sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Eliminate paper logbooks and insecure visitor badges. Haven delivers automated host pre-approvals, live camera QR scanning, multi-tenant role control, and immutable compliance audit trails.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <Link href={isAuthenticated ? '/dashboard' : '/login'} className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full justify-center shadow-md shadow-primary/10">
                <span>{isAuthenticated ? 'Go to Dashboard' : 'Launch Platform'}</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <a href="#features" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full justify-center bg-surface">
                <span>Explore Capabilities</span>
              </Button>
            </a>
          </div>

          {/* Trust Metrics Ribbon */}
          <div className="mt-14 pt-8 border-t border-border/70 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-3 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#22285B] font-mono">&lt; 2.5s</p>
              <p className="text-xs text-muted font-medium mt-0.5">Check-In Velocity</p>
            </div>
            <div className="p-3 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">SHA-256</p>
              <p className="text-xs text-muted font-medium mt-0.5">Pass Token Hashing</p>
            </div>
            <div className="p-3 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#22285B] font-mono">100%</p>
              <p className="text-xs text-muted font-medium mt-0.5">Audit Trail Traceability</p>
            </div>
            <div className="p-3 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">5 Roles</p>
              <p className="text-xs text-muted font-medium mt-0.5">Fine-Grained Permissions</p>
            </div>
          </div>
        </div>

        {/* 3. Hero Visual Mockup Preview */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="rounded-2xl border border-border/80 bg-surface shadow-2xl overflow-hidden p-3 sm:p-5">
            {/* Mockup Window Chrome Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/60">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400/80" />
                <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                <span className="text-[11px] font-mono text-muted ml-2 hidden sm:inline-block">
                  haven.enterprise.local/check-in
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live Security Gate Active
                </span>
              </div>
            </div>

            {/* Mockup Dashboard Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-left">
              {/* Left Mock: Live Pass Card */}
              <div className="md:col-span-5 bg-gradient-to-br from-[#22285B] to-[#1a1f46] text-white rounded-xl p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between shadow-md">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-emerald-300 font-mono font-bold block">
                      Visitor Access Pass
                    </span>
                    <h3 className="text-lg font-bold font-mono text-white mt-0.5">HVN-2026-X8</h3>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    <CheckCircle2 className="w-3 h-3" />
                    APPROVED
                  </span>
                </div>

                <div className="my-5 flex items-center gap-3 p-2.5 rounded-lg bg-white/10 backdrop-blur-xs border border-white/15">
                  <div className="w-10 h-10 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0">
                    JS
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">Johnathan Smith</p>
                    <p className="text-[10px] text-gray-300 truncate">Apex Global Ventures</p>
                    <p className="text-[9px] text-gray-400">Host: Dr. Miles Dyson (R&amp;D)</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-300">
                  <span>Main Campus &bull; Gate 2</span>
                  <span className="font-mono text-emerald-300">09:00 - 11:30 AM</span>
                </div>
              </div>

              {/* Right Mock: Live Scanner & Check-in View */}
              <div className="md:col-span-7 bg-gray-50/80 rounded-xl p-4 sm:p-5 border border-border flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-foreground">Checkpoint Verification Feed</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted">14 Active On-Premise</span>
                </div>

                {/* Simulated live scanner frame */}
                <div className="relative h-28 sm:h-32 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center border border-border">
                  <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_10px_#34d399]" />
                  <div className="w-16 h-16 border-2 border-emerald-400 rounded-lg relative flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-white/80" />
                  </div>
                  <span className="absolute bottom-2 text-[10px] text-emerald-400 font-mono">
                    Scan beam active • Ready
                  </span>
                </div>

                {/* Simulated Recent Check-in row */}
                <div className="mt-3 flex items-center justify-between text-xs p-2 rounded-lg bg-surface border border-border">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-medium text-foreground">Sarah Connor</span>
                    <span className="text-[10px] text-muted">&bull; Cyberdyne HQ</span>
                  </div>
                  <span className="font-mono text-[11px] text-emerald-700 font-bold">Checked In 09:14 AM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Platform Capabilities Grid */}
      <section id="features" className="py-16 sm:py-24 bg-surface border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
              Core Capabilities
            </h2>
            <p className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground mt-2">
              Engineered for absolute physical access integrity
            </p>
            <p className="text-sm text-muted mt-3">
              Every appointment, pass issuance, and badge scan is cryptographically signed and tracked end-to-end.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-border/80 bg-background/50 hover:bg-surface hover:border-primary/30 p-6 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Camera className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Live Camera QR Scanner</h3>
                <p className="text-xs text-muted leading-relaxed mt-2">
                  High-velocity optical pass scanning directly in the browser via WebRTC with multi-camera toggle, auto-reticle aiming, and instant Web Audio confirmation.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-primary inline-flex items-center gap-1 mt-4">
                Native WebRTC Scanner &rarr;
              </span>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-border/80 bg-background/50 hover:bg-surface hover:border-primary/30 p-6 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Host Pre-Approvals</h3>
                <p className="text-xs text-muted leading-relaxed mt-2">
                  Staff hosts receive instant notification upon registration. Visitors cannot enter without explicit host confirmation and required compliance logs.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 inline-flex items-center gap-1 mt-4">
                Automated Approval Queue &rarr;
              </span>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-border/80 bg-background/50 hover:bg-surface hover:border-primary/30 p-6 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Multi-Tenant Architecture</h3>
                <p className="text-xs text-muted leading-relaxed mt-2">
                  Strict tenant data isolation. Each enterprise organization manages isolated department codes, campus checkpoint buildings, and custom visit policies.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-primary inline-flex items-center gap-1 mt-4">
                Tenant Scoped Data &rarr;
              </span>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-border/80 bg-background/50 hover:bg-surface hover:border-primary/30 p-6 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Zero-Trust Tokens</h3>
                <p className="text-xs text-muted leading-relaxed mt-2">
                  Every QR code contains a one-way hashed token. Pass codes expire automatically after a configurable lifespan, preventing pass reuse or tampering.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 inline-flex items-center gap-1 mt-4">
                SHA-256 Pass Security &rarr;
              </span>
            </div>

            {/* Feature 5 */}
            <div className="rounded-2xl border border-border/80 bg-background/50 hover:bg-surface hover:border-primary/30 p-6 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Immutable Audit Logs</h3>
                <p className="text-xs text-muted leading-relaxed mt-2">
                  Complete audit traceability for ISO/SOC2 compliance. Logs every registration, check-in, check-out, approval, and administrative setting modification.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-primary inline-flex items-center gap-1 mt-4">
                Compliance Export Ready &rarr;
              </span>
            </div>

            {/* Feature 6 */}
            <div className="rounded-2xl border border-border/80 bg-background/50 hover:bg-surface hover:border-primary/30 p-6 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Live Occupancy &amp; Analytics</h3>
                <p className="text-xs text-muted leading-relaxed mt-2">
                  Real-time facility occupancy monitoring, 7-day throughput trajectory charts, peak traffic distribution, and department visitor volume analytics.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 inline-flex items-center gap-1 mt-4">
                Real-Time KPI Dashboards &rarr;
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works (Workflow) */}
      <section id="workflow" className="py-16 sm:py-24 border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
              Simple 3-Step Flow
            </h2>
            <p className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground mt-2">
              From invitation to facility exit
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-surface border border-border relative">
              <span className="w-8 h-8 rounded-full bg-[#22285B] text-white flex items-center justify-center font-mono font-bold text-xs mb-4">
                1
              </span>
              <h3 className="text-base font-bold text-foreground">Schedule or Walk-In</h3>
              <p className="text-xs text-muted mt-2 leading-relaxed">
                Hosts schedule appointments or receptionists log walk-ins. Required purpose, department, and facility building are defined.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border relative">
              <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-mono font-bold text-xs mb-4">
                2
              </span>
              <h3 className="text-base font-bold text-foreground">Approve &amp; Issue QR Pass</h3>
              <p className="text-xs text-muted mt-2 leading-relaxed">
                The host reviews details and approves the visit. A cryptographically hashed digital QR badge and pass code are generated instantly.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border relative">
              <span className="w-8 h-8 rounded-full bg-[#22285B] text-white flex items-center justify-center font-mono font-bold text-xs mb-4">
                3
              </span>
              <h3 className="text-base font-bold text-foreground">Scan Camera &amp; Enter</h3>
              <p className="text-xs text-muted mt-2 leading-relaxed">
                Security scans the QR pass using the live camera scanner at the checkpoint gate. The visit is validated in under 2 seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Role-Based Workspaces */}
      <section id="roles" className="py-16 sm:py-24 bg-surface border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
              Role Workspaces
            </h2>
            <p className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground mt-2">
              Purpose-built tools for every team member
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-background border border-border hover:border-primary/30 transition-all">
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">
                SECURITY
              </span>
              <h4 className="text-sm font-bold text-foreground mt-3">Guard &amp; Gate Control</h4>
              <p className="text-xs text-muted mt-1.5 leading-relaxed">
                Fast camera scanner, instant pass code lookup, and real-time active building occupancy tracking.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-background border border-border hover:border-primary/30 transition-all">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase border border-emerald-200">
                RECEPTION
              </span>
              <h4 className="text-sm font-bold text-foreground mt-3">Front Desk Operations</h4>
              <p className="text-xs text-muted mt-1.5 leading-relaxed">
                Visitor registration, print-ready badge passes, queue oversight, and appointment schedule verification.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-background border border-border hover:border-primary/30 transition-all">
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">
                EMPLOYEE
              </span>
              <h4 className="text-sm font-bold text-foreground mt-3">Host Portal</h4>
              <p className="text-xs text-muted mt-1.5 leading-relaxed">
                Approve or reject visitor requests with custom remarks, view appointment queues, and invite guests.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-background border border-border hover:border-primary/30 transition-all">
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full uppercase border border-indigo-200">
                ORG ADMIN
              </span>
              <h4 className="text-sm font-bold text-foreground mt-3">Tenant Administration</h4>
              <p className="text-xs text-muted mt-1.5 leading-relaxed">
                Staff directories, department routing, building campus registries, policy rules, and analytics reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Security Architecture Banner */}
      <section id="security" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#22285B] text-white rounded-3xl p-8 sm:p-14 relative overflow-hidden shadow-2xl">
            {/* Background Blurs */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-2xl" />

            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold border border-white/15 mb-4">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Zero-Trust Security Standard
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Enterprise security built directly into the foundation.
              </h2>
              <p className="text-sm text-gray-300 mt-4 leading-relaxed">
                Haven protects physical access boundaries with cryptographic rigor. Features include automatic pass expiration, HttpOnly JWT rotation, strict multi-tenant boundary checks, and tamper-resistant audit trails.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link href={isAuthenticated ? '/dashboard' : '/login'}>
                  <Button size="md" variant="primary" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold border-none shadow-lg">
                    <span>Access Workspace Now</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="mt-auto bg-surface border-t border-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#22285B] flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="font-bold text-foreground">HAVEN</span>
            <span>&copy; {new Date().getFullYear()} Quadricx Technologies. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#security" className="hover:text-foreground transition-colors">
              Security
            </a>
            <Link href="/login" className="hover:text-primary transition-colors font-bold">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
