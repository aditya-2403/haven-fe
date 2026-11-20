'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardCheck, CheckCircle2, XCircle, AlertCircle, QrCode } from 'lucide-react';
import { api } from '../../../lib/api';
import { Visit } from '../../../types';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { Modal } from '../../../components/ui/modal';
import { ConfirmationDialog } from '../../../components/ui/confirmation-dialog';
import { TableSkeleton } from '../../../components/ui/loader';
import { toast } from '../../../stores/toast.store';
import { formatDate } from '../../../lib/utils';
import { APPROVAL_MESSAGES } from '../../../constants/messages';

export default function ApprovalsPage() {
  const queryClient = useQueryClient();
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [remarksError, setRemarksError] = useState<string | null>(null);
  const [issuedPass, setIssuedPass] = useState<any | null>(null);

  const { data: pending = [], isLoading } = useQuery<Visit[]>({
    queryKey: ['pendingApprovals'],
    queryFn: async () => {
      const res = await api.get('/approvals/pending');
      return res.data?.data || [];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, remarks }: { id: string; remarks?: string }) => {
      const res = await api.post(`/approvals/${id}/approve`, { remarks });
      return res.data?.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['orgSummary'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setSelectedVisit(null);
      setActionType(null);
      setRemarks('');
      setRemarksError(null);
      setIssuedPass(data);
      toast.success(
        APPROVAL_MESSAGES.APPROVED_SUCCESS(data.passCode),
        APPROVAL_MESSAGES.APPROVED_TITLE,
      );
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to approve request', APPROVAL_MESSAGES.APPROVAL_ERROR_TITLE);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, remarks }: { id: string; remarks?: string }) => {
      const res = await api.post(`/approvals/${id}/reject`, { remarks });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['orgSummary'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setSelectedVisit(null);
      setActionType(null);
      setRemarks('');
      setRemarksError(null);
      toast.warning(APPROVAL_MESSAGES.REJECTED_SUCCESS, APPROVAL_MESSAGES.REJECTED_TITLE);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to reject request', APPROVAL_MESSAGES.REJECTION_ERROR_TITLE);
    },
  });

  const handleActionConfirm = () => {
    if (!selectedVisit) return;
    if (actionType === 'REJECT' && !remarks.trim()) {
      setRemarksError(APPROVAL_MESSAGES.REJECTION_REASON_REQUIRED);
      return;
    }

    if (actionType === 'APPROVE') {
      approveMutation.mutate({ id: selectedVisit._id, remarks: remarks.trim() || undefined });
    } else if (actionType === 'REJECT') {
      rejectMutation.mutate({ id: selectedVisit._id, remarks: remarks.trim() });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Pending Approvals
        </h1>
        <p className="text-xs sm:text-sm text-muted mt-1">
          Review visitor pass requests, grant facility clearances, or submit rejection remarks.
        </p>
      </div>

      <Card className="p-0 overflow-hidden w-full min-w-0">
        <div className="overflow-x-auto w-full min-w-0">
          <table className="w-full text-left text-xs whitespace-nowrap min-w-[650px]">
            <thead className="bg-gray-50/80 text-muted uppercase tracking-wider border-b border-border">
              <tr>
                <th className="py-3 px-4 font-semibold">Visitor Profile</th>
                <th className="py-3 px-4 font-semibold">Designated Host</th>
                <th className="py-3 px-4 font-semibold">Scheduled Date & Time</th>
                <th className="py-3 px-4 font-semibold">Purpose</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <TableSkeleton rows={4} cols={6} />
              ) : pending.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted">
                    No visitor requests are currently awaiting approval.
                  </td>
                </tr>
              ) : (
                pending.map((visit) => (
                  <tr key={visit._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-foreground">{visit.visitorId?.fullName}</p>
                      <p className="text-[10px] text-muted">
                        {visit.visitorId?.company || visit.visitorId?.phone}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-foreground">{visit.hostId?.fullName}</p>
                      <p className="text-[10px] text-muted">{visit.departmentId?.name || visit.hostId?.designation}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-foreground">{formatDate(visit.scheduledDate)}</p>
                      <p className="text-[10px] text-muted font-mono">{visit.scheduledTime || '09:00'}</p>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-muted" title={visit.purpose}>
                      {visit.purpose}
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={visit.status}>{visit.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          setSelectedVisit(visit);
                          setActionType('REJECT');
                          setRemarks('');
                          setRemarksError(null);
                        }}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => {
                          setSelectedVisit(visit);
                          setActionType('APPROVE');
                          setRemarks('');
                          setRemarksError(null);
                        }}
                      >
                        Approve
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!selectedVisit}
        onClose={() => {
          setSelectedVisit(null);
          setActionType(null);
          setRemarks('');
          setRemarksError(null);
        }}
        title={
          actionType === 'APPROVE'
            ? `Approve Visit: ${selectedVisit?.visitorId?.fullName}`
            : `Reject Visit: ${selectedVisit?.visitorId?.fullName}`
        }
        description={
          actionType === 'APPROVE'
            ? 'Confirm clearance to issue an approved visitor pass for this guest.'
            : 'Specify rejection remarks to notify the visitor and department.'
        }
      >
        {selectedVisit && (
          <div className="space-y-4">
            <div className="p-3 bg-zinc-50 rounded-none text-xs space-y-1.5 border border-border font-mono">
              <p><strong>Visitor:</strong> {selectedVisit.visitorId?.fullName} ({selectedVisit.visitorId?.company || 'Visitor'})</p>
              <p><strong>Scheduled:</strong> {formatDate(selectedVisit.scheduledDate)} at {selectedVisit.scheduledTime}</p>
              <p><strong>Purpose:</strong> {selectedVisit.purpose}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Remarks {actionType === 'REJECT' ? '*' : '(Optional)'}
              </label>
              <textarea
                value={remarks}
                onChange={(e) => {
                  setRemarks(e.target.value);
                  if (remarksError) setRemarksError(null);
                }}
                placeholder={
                  actionType === 'APPROVE'
                    ? 'e.g. Approved. Visitor may proceed directly to Conference Room 3B.'
                    : 'e.g. Designated host unavailable at this time. Please reschedule.'
                }
                className={`w-full text-xs p-2.5 rounded-none border focus:outline-none ${
                  remarksError
                    ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger'
                    : 'border-border focus:border-foreground'
                }`}
                rows={3}
              />
              {remarksError && (
                <p className="text-xs text-danger font-medium mt-1">{remarksError}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedVisit(null);
                  setActionType(null);
                  setRemarks('');
                  setRemarksError(null);
                }}
              >
                Cancel
              </Button>
              {actionType === 'APPROVE' ? (
                <Button
                  size="sm"
                  variant="success"
                  isLoading={approveMutation.isPending}
                  onClick={handleActionConfirm}
                >
                  Confirm & Issue Pass
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="danger"
                  isLoading={rejectMutation.isPending}
                  onClick={handleActionConfirm}
                >
                  Confirm Rejection
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Generated Pass QR Success View */}
      <Modal
        isOpen={!!issuedPass}
        onClose={() => setIssuedPass(null)}
        title="Pass Generated Successfully"
        description="The visit has been approved and a unique QR visitor pass is now active."
        maxWidth="md"
      >
        {issuedPass && (
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-white rounded-none border border-border shadow-2xl inline-block">
              {issuedPass.qrCodeDataUrl ? (
                <img
                  src={issuedPass.qrCodeDataUrl}
                  alt="QR Code"
                  className="w-48 h-48 mx-auto object-contain"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-xs text-muted">
                  QR Pass Active
                </div>
              )}
              <div className="mt-2 text-center">
                <span className="text-[11px] text-muted font-mono uppercase tracking-wider block">
                  Pass Code
                </span>
                <span className="text-xl font-mono font-bold text-primary">
                  {issuedPass.passCode}
                </span>
              </div>
            </div>

            <Button size="sm" variant="primary" onClick={() => setIssuedPass(null)} className="w-full">
              Done
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
