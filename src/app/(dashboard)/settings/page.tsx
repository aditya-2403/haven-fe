'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, CheckCircle2, AlertCircle, Shield, Bell, Clock, Globe } from 'lucide-react';
import { api } from '../../../lib/api';
import { OrganizationSettings } from '../../../types';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { toast } from '../../../stores/toast.store';
import { SETTINGS_MESSAGES } from '../../../constants/messages';

export default function SettingsPage() {
  const queryClient = useQueryClient();

  // Settings states
  const [requireApprovalByDefault, setRequireApprovalByDefault] = useState(true);
  const [defaultVisitDurationMinutes, setDefaultVisitDurationMinutes] = useState(60);
  const [allowWalkIns, setAllowWalkIns] = useState(true);
  const [notifyHostOnArrival, setNotifyHostOnArrival] = useState(true);
  const [timezone, setTimezone] = useState('UTC');
  const [passExpiryHours, setPassExpiryHours] = useState(24);

  const { data: settings, isLoading } = useQuery<OrganizationSettings>({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data?.data;
    },
  });

  useEffect(() => {
    if (settings) {
      setRequireApprovalByDefault(settings.requireApprovalByDefault ?? true);
      setDefaultVisitDurationMinutes(settings.defaultVisitDurationMinutes ?? 60);
      setAllowWalkIns(settings.allowWalkIns ?? true);
      setNotifyHostOnArrival(settings.notifyHostOnArrival ?? true);
      setTimezone(settings.timezone || 'UTC');
      setPassExpiryHours(settings.passExpiryHours ?? 24);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (payload: Partial<OrganizationSettings>) => {
      const res = await api.patch('/settings', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success(SETTINGS_MESSAGES.SAVED_SUCCESS, SETTINGS_MESSAGES.SAVED_TITLE);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save settings', SETTINGS_MESSAGES.SAVE_ERROR_TITLE);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      requireApprovalByDefault,
      defaultVisitDurationMinutes: Number(defaultVisitDurationMinutes),
      allowWalkIns,
      notifyHostOnArrival,
      timezone,
      passExpiryHours: Number(passExpiryHours),
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl w-full min-w-0">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Organization Settings
        </h1>
        <p className="text-xs sm:text-sm text-muted mt-1">
          Configure visitor clearance policies, notification triggers, and default appointment rules.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full min-w-0">
        {/* Security & Approvals */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <CardTitle>Approval & Clearance Policy</CardTitle>
            </div>
            <CardDescription>
              Control whether incoming appointments require explicit host approval before passes are generated.
            </CardDescription>
          </CardHeader>

          <div className="space-y-4 pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={requireApprovalByDefault}
                onChange={(e) => setRequireApprovalByDefault(e.target.checked)}
                className="mt-1 rounded text-primary focus:ring-primary w-4 h-4"
              />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Require Host Approval By Default
                </p>
                <p className="text-xs text-muted">
                  When enabled, all visitor registrations remain PENDING_APPROVAL until the designated employee approves them. If disabled, passes are issued automatically upon registration.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowWalkIns}
                onChange={(e) => setAllowWalkIns(e.target.checked)}
                className="mt-1 rounded text-primary focus:ring-primary w-4 h-4"
              />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Allow Reception Walk-In Registrations
                </p>
                <p className="text-xs text-muted">
                  Enables front desk receptionists to register unplanned walk-in visitors on demand.
                </p>
              </div>
            </label>
          </div>
        </Card>

        {/* Visit Durations & Pass Expiry */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <CardTitle>Duration & Pass Lifespan</CardTitle>
            </div>
            <CardDescription>
              Define expected duration for meetings and token expiration windows.
            </CardDescription>
          </CardHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <Label>Default Visit Duration (Minutes)</Label>
              <Select
                value={String(defaultVisitDurationMinutes)}
                onValueChange={(val) => setDefaultVisitDurationMinutes(Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 Minutes</SelectItem>
                  <SelectItem value="45">45 Minutes</SelectItem>
                  <SelectItem value="60">60 Minutes (1 Hour)</SelectItem>
                  <SelectItem value="90">90 Minutes</SelectItem>
                  <SelectItem value="120">120 Minutes (2 Hours)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>QR Pass Expiration (Hours from Issuance)</Label>
              <Select
                value={String(passExpiryHours)}
                onValueChange={(val) => setPassExpiryHours(Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select expiry hours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12 Hours</SelectItem>
                  <SelectItem value="24">24 Hours (1 Day)</SelectItem>
                  <SelectItem value="48">48 Hours (2 Days)</SelectItem>
                  <SelectItem value="72">72 Hours (3 Days)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Notifications & Localization */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <CardTitle>Notifications & Localization</CardTitle>
            </div>
            <CardDescription>
              Configure automated notifications and tenant timezone settings.
            </CardDescription>
          </CardHeader>

          <div className="space-y-4 pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyHostOnArrival}
                onChange={(e) => setNotifyHostOnArrival(e.target.checked)}
                className="mt-1 rounded text-primary focus:ring-primary w-4 h-4"
              />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Notify Host on Visitor Check-in
                </p>
                <p className="text-xs text-muted">
                  Sends an immediate in-app and email alert to the host when their visitor is scanned at security.
                </p>
              </div>
            </label>

            <div className="space-y-1.5 w-full sm:max-w-sm">
              <Label>Organization Primary Timezone</Label>
              <Select
                value={timezone}
                onValueChange={(val) => setTimezone(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC (Universal Coordinated Time)</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (EST / EDT)</SelectItem>
                  <SelectItem value="America/Chicago">America/Chicago (CST / CDT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST / PDT)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT / BST)</SelectItem>
                  <SelectItem value="Europe/Paris">Europe/Paris (CET / CEST)</SelectItem>
                  <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                  <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                  <SelectItem value="Asia/Singapore">Asia/Singapore (SGT)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" size="md" isLoading={updateMutation.isPending} className="w-full sm:w-auto">
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
