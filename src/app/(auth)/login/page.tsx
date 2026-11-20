'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, ArrowRight, AlertCircle, Terminal, Key } from 'lucide-react';
import { useAuthStore } from '../../../stores/auth.store';
import { Button } from '../../../components/ui/button';
import { toast } from '../../../stores/toast.store';
import { AUTH_MESSAGES } from '../../../constants/messages';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = AUTH_MESSAGES.EMAIL_REQUIRED;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = AUTH_MESSAGES.EMAIL_INVALID;
    }

    if (!password) {
      errors.password = AUTH_MESSAGES.PASSWORD_REQUIRED;
    } else if (password.length < 6) {
      errors.password = AUTH_MESSAGES.PASSWORD_MIN_LENGTH;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const user = await login(email, password);
      toast.success(AUTH_MESSAGES.WELCOME_BACK(user.firstName), AUTH_MESSAGES.SIGNED_IN_TITLE);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || AUTH_MESSAGES.AUTH_FAILED_FALLBACK, AUTH_MESSAGES.AUTH_FAILED_TITLE);
    }
  };

  const setDemoCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setFieldErrors({});
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAFAFA]">
      {/* Left hero / visual technical panel */}
      <div className="hidden md:flex md:w-1/2 bg-[#09090B] text-white p-12 lg:p-16 flex-col justify-between relative overflow-hidden border-r border-zinc-800 cursor-grid-pattern-dark">
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-white text-black flex items-center justify-center border border-zinc-300 font-mono font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-black" />
          </div>
          <span className="text-sm font-bold tracking-widest font-mono text-white">HAVEN</span>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-none bg-zinc-900 border border-zinc-700 text-zinc-300 text-[11px] font-mono tracking-wider">
            <span className="w-1.5 h-1.5 rounded-none bg-emerald-400" />
            Workplace Visitor Management
          </div>
          
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight font-sans">
            A smoother, safer front desk for modern workplaces.
          </h1>

          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            Coordinate visitor appointments, employee host approvals, and instant contactless QR check-ins from a single, unified workspace.
          </p>

          <div className="p-4 bg-zinc-950/80 border border-zinc-800 font-sans text-xs text-zinc-400 space-y-2.5">
            <div className="flex items-center justify-between text-zinc-300 font-semibold border-b border-zinc-800 pb-2 text-[11px] font-mono uppercase tracking-wider">
              <span>Front Desk Highlights</span>
              <span className="text-emerald-400">Live Ready</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-zinc-500">Guest Passes:</span>
              <span className="text-zinc-200">Digital QR codes sent in advance</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-zinc-500">Host Workflows:</span>
              <span className="text-zinc-200">Instant one-click visit approvals</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-zinc-500">Check-In Desk:</span>
              <span className="text-zinc-200">Webcam pass scanner & visitor log</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-6 border-t border-zinc-800 flex items-center justify-between font-mono text-[10px] text-zinc-500">
          <span>&copy; {new Date().getFullYear()} Haven. All rights reserved.</span>
          <span>Enterprise Ready</span>
        </div>
      </div>

      {/* Right login form section */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 w-full">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-left">
            <div className="md:hidden flex items-center gap-2 mb-6">
              <div className="w-7 h-7 rounded-none bg-black flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-sm font-bold font-mono text-black">HAVEN</span>
            </div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Sign in to your account</h2>
            <p className="text-xs text-muted font-sans mt-1">
              Enter your work email and password to access your workspace.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-none bg-red-50 border border-red-200 text-danger text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground tracking-tight">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="name@company.com"
                  className={`w-full pl-9 pr-3 py-2 text-xs bg-white rounded-none border transition-colors ${
                    fieldErrors.email
                      ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger text-danger'
                      : 'border-border focus:border-foreground focus:ring-1 focus:ring-foreground'
                  }`}
                  required
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-danger font-medium mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-foreground tracking-tight">Password</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="••••••••••••"
                  className={`w-full pl-9 pr-3 py-2 text-xs bg-white rounded-none border transition-colors ${
                    fieldErrors.password
                      ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger'
                      : 'border-border focus:border-foreground focus:ring-1 focus:ring-foreground'
                  }`}
                  required
                />
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-danger font-medium mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <Button type="submit" variant="primary" size="md" className="w-full mt-2" isLoading={isLoading}>
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </form>

          {/* Quick Demo Access Bar
          <div className="pt-4 border-t border-border">
            <p className="text-[10px] font-mono text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Key className="w-3 h-3" />
              Demo Accounts (Click to Fill):
            </p>
            <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin@haven.local', 'HavenAdmin2026!Secure')}
                className="p-1.5 bg-white border border-border hover:border-black text-left transition-colors"
              >
                <span className="block font-semibold">Super Admin</span>
                <span className="text-[10px] text-muted block truncate">admin@haven.local</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('frontdesk@acme.com', 'Reception2026!Secure')}
                className="p-1.5 bg-white border border-border hover:border-black text-left transition-colors"
              >
                <span className="block font-semibold">Receptionist</span>
                <span className="text-[10px] text-muted block truncate">frontdesk@acme.com</span>
              </button>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
