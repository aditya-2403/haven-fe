'use client';

import React, { useState } from 'react';
import { Menu, LogOut, UserCircle, KeyRound, ChevronDown, Shield, Building2 } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { NotificationsDropdown } from './notifications-dropdown';
import { ConfirmationDialog } from '../ui/confirmation-dialog';
import { ProfileModal } from '../profile/profile-modal';
import { toast } from '../../stores/toast.store';
import { AUTH_MESSAGES } from '../../constants/messages';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<'profile' | 'password'>('profile');
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.info(AUTH_MESSAGES.LOGGED_OUT_TOAST);
    } catch {
      setIsLoggingOut(false);
      setIsLogoutConfirmOpen(false);
    }
  };

  const openProfile = (tab: 'profile' | 'password') => {
    setProfileModalTab(tab);
    setIsProfileModalOpen(true);
    setIsDropdownOpen(false);
  };

  return (
    <>
      <header className="h-16 bg-surface border-b border-border sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-muted hover:text-foreground hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-semibold text-foreground hidden sm:inline-block">
              {user?.organizationName || 'System Workspace'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <NotificationsDropdown />

          <div className="h-5 w-px bg-border hidden sm:block" />

          {/* User Profile Avatar Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-gray-100/80 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 group"
              aria-label="User account menu"
            >
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-[10px] text-muted font-medium">
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>

              <div className="w-8 h-8 rounded-full bg-[#22285B] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                {user?.firstName?.charAt(0) || <UserCircle className="w-4 h-4" />}
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-muted group-hover:text-foreground transition-transform duration-200" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-surface border border-border shadow-xl z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* User summary header */}
                  <div className="p-3.5 bg-gray-50/80 border-b border-border">
                    <p className="text-xs font-bold text-foreground">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-[11px] text-muted truncate mt-0.5">{user?.email}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-primary/10 text-primary uppercase">
                        {user?.role?.replace('_', ' ')}
                      </span>
                      {user?.organizationName && (
                        <span className="text-[10px] text-muted truncate">
                          &bull; {user.organizationName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-1.5 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => openProfile('profile')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-gray-100 transition-colors text-left"
                    >
                      <UserCircle className="w-4 h-4 text-primary shrink-0" />
                      <div>
                        <span>Edit Profile</span>
                        <p className="text-[10px] text-muted font-normal">Update name & contact info</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => openProfile('password')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-gray-100 transition-colors text-left"
                    >
                      <KeyRound className="w-4 h-4 text-primary shrink-0" />
                      <div>
                        <span>Change Password</span>
                        <p className="text-[10px] text-muted font-normal">Update sign-in credentials</p>
                      </div>
                    </button>

                    <div className="h-px bg-border my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsLogoutConfirmOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Profile & Security Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        defaultTab={profileModalTab}
      />

      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
        title={AUTH_MESSAGES.LOGOUT_CONFIRM_TITLE}
        message={AUTH_MESSAGES.LOGOUT_CONFIRM_MSG}
        confirmText={AUTH_MESSAGES.LOGOUT_CONFIRM_BUTTON}
        variant="danger"
        isLoading={isLoggingOut}
      />
    </>
  );
}
