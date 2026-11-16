'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  QrCode,
  CheckCircle2,
  LogOut,
  Search,
  AlertCircle,
  UserCheck,
  ShieldCheck,
  Clock,
  Building2,
  Calendar,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Visit } from '../../../types';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardHeader, CardTitle } from '../../../components/ui/card';
import { ConfirmationDialog } from '../../../components/ui/confirmation-dialog';
import { toast } from '../../../stores/toast.store';
import { formatDate, formatTime } from '../../../lib/utils';
import { CHECK_IN_MESSAGES } from '../../../constants/messages';

export default function CheckInPage() {
  const queryClient = useQueryClient();
  const [scanCode, setScanCode] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  const [verifiedVisit, setVerifiedVisit] = useState<Visit | null>(null);
  const [checkOutTarget, setCheckOutTarget] = useState<Visit | null>(null);

  // Active checked in visitors query
  const { data: activeVisitors = [], isLoading } = useQuery<Visit[]>({
    queryKey: ['activeVisitors'],
    queryFn: async () => {
      const res = await api.get('/check-in/active');
      return res.data?.data || [];
    },
  });

  const scanMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await api.post('/check-in/scan', { code });
      return res.data?.data;
    },
    onSuccess: (data: Visit) => {
      setVerifiedVisit(data);
      setScanError(null);
      toast.info(
        CHECK_IN_MESSAGES.VERIFIED_SUCCESS(data.visitorId?.fullName, data.visitorId?.company),
        CHECK_IN_MESSAGES.VERIFIED_TITLE,
      );
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Invalid or unverified pass code';
      setScanError(msg);
      setVerifiedVisit(null);
      toast.error(msg, CHECK_IN_MESSAGES.VERIFICATION_FAILED_TITLE);
    },
  });

  const checkInMutation = useMutation({
    mutationFn: async (visitId: string) => {
      const res = await api.post(`/check-in/${visitId}/checkin`);
      return res.data?.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activeVisitors'] });
      queryClient.invalidateQueries({ queryKey: ['orgSummary'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success(
        CHECK_IN_MESSAGES.CHECK_IN_SUCCESS(data.visitorId?.fullName),
        CHECK_IN_MESSAGES.CHECK_IN_TITLE,
      );
      setVerifiedVisit(null);
      setScanCode('');
      setScanError(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Check-in failed', CHECK_IN_MESSAGES.CHECK_IN_ERROR_TITLE);
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async (visitId: string) => {
      const res = await api.post(`/check-in/${visitId}/checkout`);
      return res.data?.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activeVisitors'] });
      queryClient.invalidateQueries({ queryKey: ['orgSummary'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success(
        CHECK_IN_MESSAGES.CHECK_OUT_SUCCESS(data.visitorId?.fullName),
        CHECK_IN_MESSAGES.CHECK_OUT_TITLE,
      );
      setCheckOutTarget(null);
      if (verifiedVisit?._id === data._id) {
        setVerifiedVisit(null);
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Check-out failed', CHECK_IN_MESSAGES.CHECK_OUT_ERROR_TITLE);
      setCheckOutTarget(null);
    },
  });

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanCode.trim()) {
      setScanError(CHECK_IN_MESSAGES.SCAN_CODE_REQUIRED);
      return;
    }
    setScanError(null);
    scanMutation.mutate(scanCode.trim());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Check-in & Verification
        </h1>
        <p className="text-xs sm:text-sm text-muted mt-1">
          Scan QR passes, verify visitor credentials, and log facility entries and exits.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pass Scanner / Lookup Box */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verify Pass / Scan QR</CardTitle>
              <p className="text-xs text-muted">
                Scan pass via QR barcode reader or enter the pass code manually.
              </p>
            </CardHeader>

            <form onSubmit={handleScanSubmit} className="space-y-3" noValidate>
              <div className="space-y-1.5">
                <input
                  type="text"
                  value={scanCode}
                  onChange={(e) => {
                    setScanCode(e.target.value);
                    if (scanError) setScanError(null);
                  }}
                  placeholder="e.g. HV-2HX8 or full QR string"
                  className={`w-full text-sm font-mono p-3 rounded-lg border bg-white focus:outline-none uppercase tracking-wider ${
                    scanError
                      ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger'
                      : 'border-border focus:ring-2 focus:ring-primary'
                  }`}
                  autoFocus
                />
                {scanError && (
                  <p className="text-xs text-danger font-medium mt-1">{scanError}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                isLoading={scanMutation.isPending}
              >
                <QrCode className="w-4 h-4" />
                <span>Verify Pass</span>
              </Button>
            </form>
          </Card>

          {/* Verified Pass Card */}
          {verifiedVisit && (
            <Card className="border-2 border-primary/20 bg-primary/5 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted font-bold block">
                    Pass Code
                  </span>
                  <span className="text-xl font-mono font-bold text-primary">
                    {verifiedVisit.passCode}
                  </span>
                </div>
                <Badge status={verifiedVisit.status}>{verifiedVisit.status}</Badge>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-border">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base shrink-0 overflow-hidden">
                  {verifiedVisit.visitorId?.photoFileId ? (
                    <img
                      src={`http://localhost:4000/api/v1/storage/${verifiedVisit.visitorId.photoFileId}`}
                      alt={verifiedVisit.visitorId.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    verifiedVisit.visitorId?.fullName.charAt(0)
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">
                    {verifiedVisit.visitorId?.fullName}
                  </h4>
                  <p className="text-xs text-muted">{verifiedVisit.visitorId?.company || 'Visitor'}</p>
                  <p className="text-[11px] text-muted font-mono">{verifiedVisit.visitorId?.phone}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-3 border border-border text-xs space-y-1.5">
                <p><strong>Host:</strong> {verifiedVisit.hostId?.fullName} ({verifiedVisit.hostId?.designation})</p>
                <p><strong>Purpose:</strong> {verifiedVisit.purpose}</p>
                <p><strong>Building:</strong> {verifiedVisit.buildingId?.name || 'Main HQ'}</p>
                <p><strong>Scheduled:</strong> {formatDate(verifiedVisit.scheduledDate)} at {verifiedVisit.scheduledTime}</p>
              </div>

              <div className="flex gap-2">
                {verifiedVisit.status === 'APPROVED' && (
                  <Button
                    variant="success"
                    size="md"
                    className="w-full"
                    isLoading={checkInMutation.isPending}
                    onClick={() => checkInMutation.mutate(verifiedVisit._id)}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Check-In</span>
                  </Button>
                )}
                {verifiedVisit.status === 'CHECKED_IN' && (
                  <Button
                    variant="danger"
                    size="md"
                    className="w-full"
                    onClick={() => setCheckOutTarget(verifiedVisit)}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Check-Out Visitor</span>
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Currently Active Visitors Table */}
        <div className="lg:col-span-7">
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <CardTitle>Currently Checked In</CardTitle>
                <p className="text-xs text-muted mt-0.5">
                  Live on-site occupancy: <span className="font-semibold text-emerald-600">{activeVisitors.length} Active</span>
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/80 text-muted uppercase tracking-wider border-b border-border">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Pass Code</th>
                    <th className="py-2.5 px-4 font-semibold">Visitor</th>
                    <th className="py-2.5 px-4 font-semibold">Host</th>
                    <th className="py-2.5 px-4 font-semibold">Check-in Time</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted">
                        Loading active visitors...
                      </td>
                    </tr>
                  ) : activeVisitors.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted">
                        No visitors are currently checked in.
                      </td>
                    </tr>
                  ) : (
                    activeVisitors.map((visit) => (
                      <tr key={visit._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-primary">
                          {visit.passCode || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-foreground">{visit.visitorId?.fullName}</p>
                          <p className="text-[10px] text-muted">{visit.visitorId?.company || visit.visitorId?.phone}</p>
                        </td>
                        <td className="py-3 px-4 text-muted">{visit.hostId?.fullName}</td>
                        <td className="py-3 px-4 font-mono text-emerald-700">
                          {formatTime(visit.checkInAt)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => setCheckOutTarget(visit)}
                          >
                            Check-Out
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog for Check-Out */}
      <ConfirmationDialog
        isOpen={!!checkOutTarget}
        onClose={() => setCheckOutTarget(null)}
        onConfirm={() => {
          if (checkOutTarget) {
            checkOutMutation.mutate(checkOutTarget._id);
          }
        }}
        title={CHECK_IN_MESSAGES.CHECK_OUT_CONFIRM_TITLE}
        message={CHECK_IN_MESSAGES.CHECK_OUT_CONFIRM_MSG(checkOutTarget?.visitorId?.fullName || 'the visitor')}
        confirmText={CHECK_IN_MESSAGES.CHECK_OUT_CONFIRM_BUTTON}
        variant="warning"
        isLoading={checkOutMutation.isPending}
      />
    </div>
  );
}
