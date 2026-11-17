'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, ArrowRight, AlertCircle, Building2 } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8F9FC]">
      {/* Left hero / visual section */}
      <div className="hidden md:flex md:w-1/2 bg-[#22285B] text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -left-20 -top-20 w-96 h-96 rounded-full bg-[#303A7A]/30 blur-2xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">HAVEN</span>
        </div>

        <div className="relative z-10 space-y-4 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-medium border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Enterprise Visitor & Access Platform
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight leading-snug">
            Streamlined visitor flows, cryptographically verified passes.
          </h1>
          <p className="text-sm text-gray-300 leading-relaxed">
            Multi-tenant security, host pre-approvals, QR check-ins, and automated compliance logging built for modern enterprise workspaces.
          </p>
        </div>

        <div className="relative z-10 pt-8 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
          <span>&copy; {new Date().getFullYear()} Haven Access Technologies</span>
          <span>Zero-Trust Architecture</span>
        </div>
      </div>

      {/* Right login form section */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 md:p-12 w-full">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          <div className="text-left">
            <div className="md:hidden flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#22285B] flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-lg font-bold text-[#22285B]">HAVEN</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Sign in to your account</h2>
            <p className="text-xs text-muted mt-1.5">
              Enter your credentials to access your designated Haven dashboard.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-danger text-xs font-medium flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="name@company.com"
                  className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-white rounded-lg border transition-colors ${
                    fieldErrors.email
                      ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger text-danger'
                      : 'border-border focus:border-primary focus:ring-1 focus:ring-primary'
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
                <label className="block text-xs font-semibold text-foreground">Password</label>
                <span className="text-xs text-primary hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-white rounded-lg border transition-colors ${
                    fieldErrors.password
                      ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger'
                      : 'border-border focus:border-primary focus:ring-1 focus:ring-primary'
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
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Quick test credentials shortcut helper */}
          {/* <div className="mt-8 pt-6 border-t border-border">
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Quick Demo Access
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin@haven.local', 'HavenAdmin2026!Secure')}
                className="text-xs px-2.5 py-1.5 rounded-md bg-white border border-border text-foreground hover:bg-gray-50 transition-colors"
              >
                Super Admin
              </button>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
