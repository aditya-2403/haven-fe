'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  LayoutDashboard,
  Building2,
  Users,
  UserCheck,
  FolderTree,
  MapPin,
  CalendarDays,
  ClipboardCheck,
  QrCode,
  FileText,
  BarChart3,
  Settings,
  History,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { cn } from '../../lib/utils';
import { Role } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['SUPER_ADMIN', 'ORG_ADMIN', 'RECEPTIONIST', 'SECURITY', 'EMPLOYEE'],
  },
  {
    label: 'Organizations',
    href: '/organizations',
    icon: Building2,
    roles: ['SUPER_ADMIN'],
  },
  {
    label: 'Visitors',
    href: '/visitors',
    icon: Users,
    roles: ['ORG_ADMIN', 'RECEPTIONIST'],
  },
  {
    label: 'Appointments',
    href: '/appointments',
    icon: CalendarDays,
    roles: ['ORG_ADMIN', 'RECEPTIONIST', 'EMPLOYEE'],
  },
  {
    label: 'Approvals',
    href: '/approvals',
    icon: ClipboardCheck,
    roles: ['ORG_ADMIN', 'EMPLOYEE'],
  },
  {
    label: 'Check-in & Passes',
    href: '/check-in',
    icon: QrCode,
    roles: ['ORG_ADMIN', 'RECEPTIONIST', 'SECURITY'],
  },
  {
    label: 'Visitor Logs',
    href: '/visitor-logs',
    icon: FileText,
    roles: ['ORG_ADMIN', 'RECEPTIONIST', 'SECURITY', 'EMPLOYEE'],
  },
  {
    label: 'Employees',
    href: '/employees',
    icon: UserCheck,
    roles: ['ORG_ADMIN'],
  },
  {
    label: 'Departments',
    href: '/departments',
    icon: FolderTree,
    roles: ['ORG_ADMIN'],
  },
  {
    label: 'Buildings',
    href: '/buildings',
    icon: MapPin,
    roles: ['ORG_ADMIN'],
  },
  {
    label: 'Users & Access',
    href: '/users',
    icon: Users,
    roles: ['SUPER_ADMIN', 'ORG_ADMIN'],
  },
  {
    label: 'Reports & Analytics',
    href: '/reports',
    icon: BarChart3,
    roles: ['SUPER_ADMIN', 'ORG_ADMIN'],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['ORG_ADMIN'],
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const userRole = user?.role || 'EMPLOYEE';
  const visibleItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 w-64 bg-surface border-r border-border flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Brand header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#22285B] flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-[#22285B]">HAVEN</span>
              <span className="text-[10px] block -mt-1 font-semibold text-muted tracking-wider uppercase">
                Access Platform
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md text-muted hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Organization pill badge */}
        <div className="px-4 py-3 border-b border-border/60 bg-gray-50/70">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary shrink-0" />
            <div className="truncate">
              <p className="text-xs font-semibold text-foreground truncate">
                {user?.organizationName || (user?.role === 'SUPER_ADMIN' ? 'Global Admin Context' : 'Haven Platform')}
              </p>
              <span className="text-[10px] text-muted font-medium uppercase tracking-wider">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose()}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-[#22285B] text-white shadow-sm'
                    : 'text-foreground hover:bg-gray-100/80 hover:text-foreground',
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 stroke-[1.8]',
                    isActive ? 'text-white' : 'text-muted',
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-border">
          <div className="text-[11px] text-muted">
            <p className="font-medium text-foreground">Haven Security v1.0</p>
            <p className="text-[10px]">Enterprise Edition</p>
          </div>
        </div>
      </aside>
    </>
  );
}

