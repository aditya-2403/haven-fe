'use client';

import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  UserCircle,
  KeyRound,
  Shield,
  Building2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  User,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/auth.store';
import { Modal } from '../ui/modal';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from '../../stores/toast.store';
import { AUTH_MESSAGES } from '../../constants/messages';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'profile' | 'password';
}

export function ProfileModal({ isOpen, onClose, defaultTab = 'profile' }: ProfileModalProps) {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>(defaultTab);

  // Profile form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [profileGlobalError, setProfileGlobalError] = useState<string | null>(null);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [passwordGlobalError, setPasswordGlobalError] = useState<string | null>(null);

  // Populate profile fields whenever user changes or modal opens
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
    }
    setActiveTab(defaultTab);
    setProfileErrors({});
    setProfileGlobalError(null);
    setPasswordErrors({});
    setPasswordGlobalError(null);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }, [user, isOpen, defaultTab]);

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (payload: { firstName: string; lastName: string; phone?: string }) => {
      const res = await api.patch('/auth/profile', payload);
      return res.data;
    },
    onSuccess: (data) => {
      if (data?.data) {
        setUser({
          ...user!,
          ...data.data,
        });
      }
      toast.success(AUTH_MESSAGES.PROFILE_UPDATE_SUCCESS, AUTH_MESSAGES.PROFILE_UPDATE_TITLE);
      onClose();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to update profile';
      setProfileGlobalError(msg);
      toast.error(msg, AUTH_MESSAGES.PROFILE_UPDATE_ERROR_TITLE);
    },
  });

  // Change Password Mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (payload: { currentPassword: string; newPassword: string }) => {
      const res = await api.post('/auth/change-password', payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success(AUTH_MESSAGES.PASSWORD_CHANGE_SUCCESS, AUTH_MESSAGES.PASSWORD_CHANGE_TITLE);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to change password';
      setPasswordGlobalError(msg);
      toast.error(msg, AUTH_MESSAGES.PASSWORD_CHANGE_ERROR_TITLE);
    },
  });

  // Validation
  const validateProfile = () => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = AUTH_MESSAGES.FIRST_NAME_REQUIRED;
    if (!lastName.trim()) errs.lastName = AUTH_MESSAGES.LAST_NAME_REQUIRED;
    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePassword = () => {
    const errs: Record<string, string> = {};
    if (!currentPassword) errs.currentPassword = AUTH_MESSAGES.CURRENT_PASSWORD_REQUIRED;
    if (!newPassword) {
      errs.newPassword = AUTH_MESSAGES.NEW_PASSWORD_REQUIRED;
    } else if (newPassword.length < 6) {
      errs.newPassword = AUTH_MESSAGES.PASSWORD_MIN_LENGTH;
    } else if (newPassword === currentPassword) {
      errs.newPassword = AUTH_MESSAGES.PASSWORD_SAME_ERROR;
    }

    if (!confirmPassword) {
      errs.confirmPassword = AUTH_MESSAGES.CONFIRM_PASSWORD_REQUIRED;
    } else if (confirmPassword !== newPassword) {
      errs.confirmPassword = AUTH_MESSAGES.PASSWORDS_DO_NOT_MATCH;
    }

    setPasswordErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileGlobalError(null);
    if (!validateProfile()) return;

    updateProfileMutation.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim() || undefined,
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordGlobalError(null);
    if (!validatePassword()) return;

    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Account Settings"
      description="Manage your personal profile details and account security."
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-0.5 bg-zinc-100 rounded-none border border-border">
          <button
            type="button"
            onClick={() => {
              setActiveTab('profile');
              setProfileGlobalError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-none text-xs font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-white text-foreground border border-border shadow-xs'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <UserCircle className="w-3.5 h-3.5 text-foreground" />
            <span>Profile Details</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('password');
              setPasswordGlobalError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-none text-xs font-semibold transition-all ${
              activeTab === 'password'
                ? 'bg-white text-foreground border border-border shadow-xs'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-foreground" />
            <span>Change Password</span>
          </button>
        </div>

        {/* Tab 1: Profile Information */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-4" noValidate>
            {profileGlobalError && (
              <div className="p-3 rounded-none bg-red-50 text-danger text-xs flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{profileGlobalError}</span>
              </div>
            )}

            {/* Profile Overview Card */}
            <div className="p-3 rounded-none bg-zinc-50 border border-border flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-none bg-black text-white flex items-center justify-center font-bold font-mono text-xs uppercase border border-zinc-700">
                  {user?.firstName?.charAt(0) || 'U'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    {user?.firstName} {user?.lastName}
                  </h4>
                  <p className="text-[11px] font-mono text-muted">{user?.email}</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-none text-[9px] font-mono font-bold bg-zinc-200 text-zinc-900 border border-zinc-300">
                  {user?.role?.replace('_', ' ')}
                </span>
                <span className="text-[10px] text-muted truncate max-w-[140px]">
                  {user?.organizationName || 'System Platform'}
                </span>
              </div>
            </div>

            {/* Read-Only Account Identifiers */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Sign-In Email</label>
                <span className="text-[10px] text-muted flex items-center gap-1 font-mono">
                  <Lock className="w-3 h-3 text-muted" />
                  Primary Identifier
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-100 text-muted rounded-none border border-border cursor-not-allowed select-none font-mono"
                />
              </div>
            </div>

            {/* Editable Name Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="First Name *"
                value={firstName}
                error={profileErrors.firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (profileErrors.firstName) setProfileErrors((p) => ({ ...p, firstName: '' }));
                }}
                placeholder="e.g. Miles"
                required
              />
              <Input
                label="Last Name *"
                value={lastName}
                error={profileErrors.lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (profileErrors.lastName) setProfileErrors((p) => ({ ...p, lastName: '' }));
                }}
                placeholder="e.g. Dyson"
                required
              />
            </div>

            {/* Editable Phone Input */}
            <Input
              label="Contact Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1-555-0144"
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={updateProfileMutation.isPending}
              >
                Save Changes
              </Button>
            </div>
          </form>
        )}

        {/* Tab 2: Change Password */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4" noValidate>
            {passwordGlobalError && (
              <div className="p-3 rounded-none bg-red-50 text-danger text-xs flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordGlobalError}</span>
              </div>
            )}

            <div className="p-3 rounded-none bg-zinc-50 border border-border text-foreground text-xs space-y-0.5">
              <p className="font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                <Shield className="w-3.5 h-3.5 text-zinc-900" />
                Password Security
              </p>
              <p className="text-[11px] text-muted leading-relaxed font-sans">
                Choose a strong password of at least 6 characters. You will remain signed in on this current browser session.
              </p>
            </div>

            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Current Password *</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (passwordErrors.currentPassword)
                      setPasswordErrors((p) => ({ ...p, currentPassword: '' }));
                  }}
                  placeholder="Enter your existing password"
                  className={`w-full pr-10 pl-3 py-2 text-xs bg-surface rounded-none border focus:outline-none ${
                    passwordErrors.currentPassword
                      ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger'
                      : 'border-border focus:border-foreground'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-foreground"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="text-xs text-danger font-medium mt-1">
                  {passwordErrors.currentPassword}
                </p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">New Password *</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (passwordErrors.newPassword)
                      setPasswordErrors((p) => ({ ...p, newPassword: '' }));
                  }}
                  placeholder="Minimum 6 characters"
                  className={`w-full pr-10 pl-3 py-2 text-xs bg-surface rounded-none border focus:outline-none ${
                    passwordErrors.newPassword
                      ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger'
                      : 'border-border focus:border-foreground'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-foreground"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="text-xs text-danger font-medium mt-1">
                  {passwordErrors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Confirm New Password *</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (passwordErrors.confirmPassword)
                      setPasswordErrors((p) => ({ ...p, confirmPassword: '' }));
                  }}
                  placeholder="Re-type your new password"
                  className={`w-full pr-10 pl-3 py-2 text-xs bg-surface rounded-none border focus:outline-none ${
                    passwordErrors.confirmPassword
                      ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger'
                      : 'border-border focus:border-foreground'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="text-xs text-danger font-medium mt-1">
                  {passwordErrors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={changePasswordMutation.isPending}
              >
                Update Password
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
