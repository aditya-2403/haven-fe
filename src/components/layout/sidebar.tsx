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
    label: 'Check-In Desk',
    href: '/check-in',
    icon: QrCode,
    roles: ['ORG_ADMIN', 'RECEPTIONIST', 'SECURITY'],
  },
  {
    label: 'Approvals',
    href: '/approvals',
    icon: ClipboardCheck,
    roles: ['ORG_ADMIN', 'EMPLOYEE'],
  },
  {
    label: 'Employees',
    href: '/employees',
    icon: UserCheck,
    roles: ['SUPER_ADMIN', 'ORG_ADMIN'],
  },
  {
    label: 'Departments',
    href: '/departments',
    icon: FolderTree,
    roles: ['SUPER_ADMIN', 'ORG_ADMIN'],
  },
  {
    label: 'Buildings',
    href: '/buildings',
    icon: MapPin,
    roles: ['SUPER_ADMIN', 'ORG_ADMIN'],
  },
  {
    label: 'User Management',
    href: '/users',
    icon: ShieldCheck,
    roles: ['SUPER_ADMIN', 'ORG_ADMIN'],
  },
  {
    label: 'Visitor Logs',
    href: '/visitor-logs',
    icon: History,
    roles: ['SUPER_ADMIN', 'ORG_ADMIN', 'RECEPTIONIST', 'SECURITY'],
  },
  {
    label: 'Analytics & Reports',
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
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 w-64 bg-surface border-r border-border flex flex-col transition-transform duration-150 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Brand header */}
        <div className="h-14 px-5 flex items-center justify-between border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-none bg-black flex items-center justify-center text-white border border-zinc-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-foreground font-mono">HAVEN</span>
              <span className="text-[9px] block -mt-0.5 font-mono text-muted tracking-wider uppercase">
                Visitor Management
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-none text-muted hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Organization metadata bar */}
        <div className="px-4 py-2.5 border-b border-border bg-zinc-50/80">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <div className="truncate">
              <p className="text-[11px] font-semibold text-foreground truncate tracking-tight">
                {user?.organizationName || (user?.role === 'SUPER_ADMIN' ? 'Global Admin Context' : 'Haven Platform')}
              </p>
              <span className="text-[9px] font-mono text-muted uppercase tracking-wider block">
                [{user?.role?.replace('_', ' ')}]
              </span>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose()}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-none text-xs font-medium transition-colors tracking-tight',
                  isActive
                    ? 'bg-black text-white border border-black'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-black',
                )}
              >
                <Icon
                  className={cn(
                    'w-3.5 h-3.5 stroke-[2]',
                    isActive ? 'text-white' : 'text-zinc-400',
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-border font-mono text-[10px] text-muted flex items-center justify-between">
          <span>Haven Platform</span>
          <span className="text-emerald-600 flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-none bg-emerald-500" />
            Online
          </span>
        </div>
      </aside>
    </>
  );
}
