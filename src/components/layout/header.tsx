'use client';

import React, { useState } from 'react';
import { Menu, LogOut, UserCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { NotificationsDropdown } from './notifications-dropdown';
import { ConfirmationDialog } from '../ui/confirmation-dialog';
import { toast } from '../../stores/toast.store';
import { AUTH_MESSAGES } from '../../constants/messages';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuthStore();
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

          {/* User profile details & logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-foreground">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-[10px] text-muted font-medium">
                {user?.email}
              </span>
            </div>

            <div className="w-8 h-8 rounded-full bg-[#22285B] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
              {user?.firstName?.charAt(0) || <UserCircle className="w-4 h-4" />}
            </div>

            <button
              type="button"
              onClick={() => setIsLogoutConfirmOpen(true)}
              className="p-2 rounded-lg text-muted hover:text-danger hover:bg-red-50 transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

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
