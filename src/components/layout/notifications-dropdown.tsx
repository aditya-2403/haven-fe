'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { NotificationItem } from '../../types';
import { formatDateTime } from '../../lib/utils';

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery<NotificationItem[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data?.data || [];
    },
    refetchInterval: 15000,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.post('/notifications/mark-all-read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 rounded-none text-muted hover:text-foreground hover:bg-zinc-100 transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 px-1 py-0.2 rounded-none bg-red-600 text-white text-[9px] font-mono font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed sm:absolute inset-x-2 sm:inset-x-auto sm:right-0 top-14 sm:top-auto sm:mt-1.5 sm:w-96 rounded-none bg-surface border border-border shadow-2xl z-40 overflow-hidden">
            <div className="p-3 border-b border-border flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-foreground uppercase tracking-tight">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-none bg-black text-white font-bold">
                    {unreadCount} NEW
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllReadMutation.mutate()}
                  className="text-[10px] font-mono text-zinc-600 hover:text-black font-medium flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" />
                  MARK ALL READ
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-border">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs font-mono text-muted">
                  No active alerts.
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item._id}
                    className={`p-3 transition-colors hover:bg-zinc-50 flex items-start justify-between gap-3 ${
                      !item.read ? 'bg-zinc-50/70 border-l-2 border-l-black' : ''
                    }`}
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-foreground tracking-tight">{item.title}</p>
                      <p className="text-xs text-muted leading-relaxed">{item.message}</p>
                      <span className="text-[10px] font-mono text-muted block pt-0.5">
                        {formatDateTime(item.createdAt)}
                      </span>
                    </div>
                    {!item.read && (
                      <button
                        type="button"
                        onClick={() => markReadMutation.mutate(item._id)}
                        className="text-muted hover:text-black p-1 rounded-none transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
