'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Building2,
  CalendarDays,
  ClipboardCheck,
  QrCode,
  TrendingUp,
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Plus,
  Search,
} from 'lucide-react';
import { useAuthStore } from '../../../stores/auth.store';
import { api } from '../../../lib/api';
import { Card, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Modal } from '../../../components/ui/modal';
import { formatDate, formatTime } from '../../../lib/utils';
import { Visit } from '../../../types';
import { toast } from '../../../stores/toast.store';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Selected visit for quick employee approval modal
  const [selectedVisitForApproval, setSelectedVisitForApproval] = useState<Visit | null>(null);
  const [approvalRemarks, setApprovalRemarks] = useState('');

  // 1. Super Admin Stats Query
  const { data: superAdminStats } = useQuery({
    queryKey: ['superAdminStats'],
    queryFn: async () => {
      const res = await api.get('/organizations/global-stats');
      return res.data?.data;
    },
    enabled: user?.role === 'SUPER_ADMIN',
  });

  // 2. Org Summary Query (for Org Admin, Receptionist, Security)
  const { data: orgSummary } = useQuery({
    queryKey: ['orgSummary'],
    queryFn: async () => {
      const res = await api.get('/reports/summary');
      return res.data?.data;
    },
    enabled: !!user?.organizationId && user?.role !== 'EMPLOYEE',
  });

  // 3. Visitor Trends Query (7 days)
  const { data: visitorTrends = [] } = useQuery({
    queryKey: ['visitorTrends'],
    queryFn: async () => {
      const res = await api.get('/reports/visitor-trends?days=7');
      return res.data?.data || [];
    },
    enabled: !!user?.organizationId && (user?.role === 'ORG_ADMIN' || user?.role === 'SUPER_ADMIN'),
  });

  // 4. Pending Approvals Query (for Org Admin & Employee)
  const { data: pendingApprovals = [] } = useQuery<Visit[]>({
    queryKey: ['pendingApprovals'],
    queryFn: async () => {
      const res = await api.get('/approvals/pending');
      return res.data?.data || [];
    },
    enabled: !!user?.organizationId,
  });

  // 5. Active checked-in visitors (for Receptionist & Security & Admin)
  const { data: activeVisitors = [] } = useQuery<Visit[]>({
    queryKey: ['activeVisitors'],
    queryFn: async () => {
      const res = await api.get('/check-in/active');
      return res.data?.data || [];
    },
    enabled: !!user?.organizationId && user?.role !== 'EMPLOYEE',
  });

  // 6. Recent / Upcoming Visits Query
  const { data: upcomingVisits = [] } = useQuery<Visit[]>({
    queryKey: ['upcomingVisits', user?.role],
    queryFn: async () => {
      const res = await api.get('/visits?limit=5');
      return res.data?.data || [];
    },
    enabled: !!user?.organizationId,
  });

  // Mutations for approve/reject from dashboard
  const approveMutation = useMutation({
    mutationFn: async ({ id, remarks }: { id: string; remarks?: string }) => {
      await api.post(`/approvals/${id}/approve`, { remarks });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['orgSummary'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingVisits'] });
      setSelectedVisitForApproval(null);
      setApprovalRemarks('');
      toast.success('Visitor appointment approved and digital pass issued.', 'Approved');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to approve request', 'Approval Error');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, remarks }: { id: string; remarks?: string }) => {
      await api.post(`/approvals/${id}/reject`, { remarks });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['orgSummary'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingVisits'] });
      setSelectedVisitForApproval(null);
      setApprovalRemarks('');
      toast.warning('Visitor appointment rejected.', 'Rejected');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to reject request', 'Rejection Error');
    },
  });

  // --------------------------------------------------------------------------
  // ROLE-SPECIFIC RENDERINGS
  // --------------------------------------------------------------------------

  // A. SUPER ADMIN DASHBOARD
  if (user?.role === 'SUPER_ADMIN') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Platform Overview
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Global tenant activity, system health, and cross-organization telemetry.
          </p>
        </div>

        {/* Global Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted">Total Organizations</p>
                <h3 className="text-2xl font-mono font-bold text-foreground mt-1">
                  {superAdminStats?.totalOrganizations ?? 0}
                </h3>
              </div>
              <div className="w-9 h-9 rounded-none bg-zinc-100 border border-border flex items-center justify-center text-foreground">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs font-mono">
              <span className="text-emerald-600 font-semibold">
                {superAdminStats?.activeOrganizations ?? 0} active
              </span>
              <span className="text-muted">•</span>
              <span className="text-rose-600 font-semibold">
                {superAdminStats?.suspendedOrganizations ?? 0} suspended
              </span>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted">Platform Users</p>
                <h3 className="text-2xl font-mono font-bold text-foreground mt-1">
                  {superAdminStats?.totalUsers ?? 0}
                </h3>
              </div>
              <div className="w-9 h-9 rounded-none bg-zinc-100 border border-border flex items-center justify-center text-foreground">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs text-muted mt-3">Across all registered tenants</p>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted">Registered Visitors</p>
                <h3 className="text-2xl font-mono font-bold text-foreground mt-1">
                  {superAdminStats?.totalVisitors ?? 0}
                </h3>
              </div>
              <div className="w-9 h-9 rounded-none bg-zinc-100 border border-border flex items-center justify-center text-foreground">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs text-muted mt-3">Profiles in system repository</p>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted">System Status</p>
                <h3 className="text-base font-mono font-bold text-emerald-600 mt-1 flex items-center gap-1.5 uppercase">
                  <span className="w-2 h-2 rounded-none bg-emerald-500 animate-pulse" />
                  OPERATIONAL
                </h3>
              </div>
              <div className="w-9 h-9 rounded-none bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs font-mono text-muted mt-3">MongoDB & JWT Engine Online</p>
          </Card>
        </div>

        {/* Recent Organizations Section */}
        <Card className="p-0 overflow-hidden w-full min-w-0">
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border">
            <CardTitle>Recent Organizations</CardTitle>
            <Link href="/organizations" className="w-full sm:w-auto">
              <Button size="sm" variant="outline" className="w-full sm:w-auto">
                <span>Manage Organizations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
          <div className="overflow-x-auto w-full min-w-0">
            <table className="w-full text-left text-xs whitespace-nowrap min-w-[600px]">
              <thead className="bg-gray-50/80 text-muted uppercase tracking-wider border-y border-border">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Organization Name</th>
                  <th className="py-2.5 px-4 font-semibold">Slug</th>
                  <th className="py-2.5 px-4 font-semibold">Contact Email</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(superAdminStats?.recentOrganizations || []).map((org: any) => (
                  <tr key={org._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">{org.name}</td>
                    <td className="py-3 px-4 font-mono text-muted">{org.slug}</td>
                    <td className="py-3 px-4 text-muted">{org.email}</td>
                    <td className="py-3 px-4">
                      <Badge status={org.status}>{org.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-muted">{formatDate(org.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  // B. EMPLOYEE DASHBOARD
  if (user?.role === 'EMPLOYEE') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Host Workspace
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Manage your visitor appointments, approvals, and upcoming arrivals.
          </p>
        </div>

        {/* Quick summary cards for employee */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted">Pending Your Approval</p>
                <h3 className="text-2xl font-mono font-bold text-foreground mt-1">
                  {pendingApprovals.length}
                </h3>
              </div>
              <div className="w-9 h-9 rounded-none bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <ClipboardCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs text-muted mt-3">Action required</p>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted">Upcoming Visits</p>
                <h3 className="text-2xl font-mono font-bold text-foreground mt-1">
                  {upcomingVisits.filter((v) => v.status === 'APPROVED').length}
                </h3>
              </div>
              <div className="w-9 h-9 rounded-none bg-zinc-100 border border-border flex items-center justify-center text-foreground">
                <CalendarDays className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs text-muted mt-3">Approved & scheduled</p>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted">Completed Visits</p>
                <h3 className="text-2xl font-mono font-bold text-foreground mt-1">
                  {upcomingVisits.filter((v) => v.status === 'CHECKED_OUT').length}
                </h3>
              </div>
              <div className="w-9 h-9 rounded-none bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs text-muted mt-3">Past visitor logs</p>
          </Card>
        </div>

        {/* Pending Approval Requests Section with Quick Action */}
        <Card className="w-full min-w-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pending Visitor Approvals</CardTitle>
              <Badge variant="warning">{pendingApprovals.length} Pending</Badge>
            </div>
          </CardHeader>
          {pendingApprovals.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted">
              No pending approval requests. All your visitor requests have been processed!
            </div>
          ) : (
            <div className="space-y-3">
              {pendingApprovals.map((visit) => (
                <div
                  key={visit._id}
                  className="p-3.5 sm:p-4 rounded-none border border-border bg-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
                >
                  <div className="space-y-1 min-w-0 w-full sm:w-auto">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">
                        {visit.visitorId?.fullName}
                      </span>
                      {visit.visitorId?.company && (
                        <span className="text-[11px] font-mono text-muted bg-zinc-100 px-2 py-0.5 rounded-none border border-border truncate max-w-[200px]">
                          {visit.visitorId.company}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted truncate">
                      <span className="font-medium text-foreground">Purpose:</span> {visit.purpose}
                    </p>
                    <p className="text-[11px] text-muted flex flex-wrap items-center gap-1.5 sm:gap-2 font-mono">
                      <span>Date: {formatDate(visit.scheduledDate)} at {visit.scheduledTime}</span>
                      <span>•</span>
                      <span>Phone: {visit.visitorId?.phone}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                    <Button
                      size="sm"
                      variant="danger"
                      className="flex-1 sm:flex-initial"
                      onClick={() => setSelectedVisitForApproval(visit)}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="success"
                      className="flex-1 sm:flex-initial"
                      onClick={() => setSelectedVisitForApproval(visit)}
                    >
                      Approve & Issue QR
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Employee Action Modal */}
        <Modal
          isOpen={!!selectedVisitForApproval}
          onClose={() => setSelectedVisitForApproval(null)}
          title={`Process Request: ${selectedVisitForApproval?.visitorId?.fullName}`}
          description="Review details and approve or reject this visitor pass."
        >
          {selectedVisitForApproval && (
            <div className="space-y-4">
              <div className="p-3 bg-zinc-50 rounded-none text-xs space-y-1.5 border border-border font-mono">
                <p><strong>Visitor:</strong> {selectedVisitForApproval.visitorId?.fullName}</p>
                <p><strong>Company:</strong> {selectedVisitForApproval.visitorId?.company || 'N/A'}</p>
                <p><strong>Scheduled:</strong> {formatDate(selectedVisitForApproval.scheduledDate)} at {selectedVisitForApproval.scheduledTime}</p>
                <p><strong>Purpose:</strong> {selectedVisitForApproval.purpose}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Remarks (Optional)</label>
                <textarea
                  value={approvalRemarks}
                  onChange={(e) => setApprovalRemarks(e.target.value)}
                  placeholder="e.g. Conference Room 3B booked, escort required."
                  className="w-full text-xs p-2.5 rounded-none border border-border focus:border-foreground focus:outline-none"
                  rows={3}
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-border">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedVisitForApproval(null)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  isLoading={rejectMutation.isPending}
                  onClick={() =>
                    rejectMutation.mutate({
                      id: selectedVisitForApproval._id,
                      remarks: approvalRemarks,
                    })
                  }
                  className="w-full sm:w-auto"
                >
                  Reject Request
                </Button>
                <Button
                  size="sm"
                  variant="success"
                  isLoading={approveMutation.isPending}
                  onClick={() =>
                    approveMutation.mutate({
                      id: selectedVisitForApproval._id,
                      remarks: approvalRemarks,
                    })
                  }
                  className="w-full sm:w-auto"
                >
                  Approve & Issue QR Pass
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    );
  }

  // C. RECEPTIONIST & SECURITY QUICK DASHBOARD
  if (user?.role === 'RECEPTIONIST' || user?.role === 'SECURITY') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {user.role === 'RECEPTIONIST' ? 'Front Desk & Reception' : 'Security Desk'}
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Real-time attendance, pass scans, check-ins and walk-in registrations.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Link href="/check-in" className="flex-1 sm:flex-initial">
              <Button size="sm" variant="primary" className="w-full">
                <QrCode className="w-4 h-4" />
                <span>Open QR Scanner</span>
              </Button>
            </Link>
            {user.role === 'RECEPTIONIST' && (
              <Link href="/appointments?create=true&type=walk-in" className="flex-1 sm:flex-initial">
                <Button size="sm" variant="outline" className="w-full">
                  <Plus className="w-4 h-4" />
                  <span>New Walk-in</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Fast Action Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <Card>
            <p className="text-xs font-medium text-muted">Currently Inside</p>
            <h3 className="text-2xl font-bold text-foreground mt-1 text-emerald-600">
              {activeVisitors.length}
            </h3>
            <p className="text-[11px] text-muted mt-2">Checked-in on premises</p>
          </Card>

          <Card>
            <p className="text-xs font-medium text-muted">Visitors Today</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">
              {orgSummary?.visitorsToday ?? 0}
            </h3>
            <p className="text-[11px] text-muted mt-2">Appointments scheduled</p>
          </Card>

          <Card>
            <p className="text-xs font-medium text-muted">Pending Approvals</p>
            <h3 className="text-2xl font-bold text-foreground mt-1 text-amber-600">
              {pendingApprovals.length}
            </h3>
            <p className="text-[11px] text-muted mt-2">Awaiting host signoff</p>
          </Card>

          <Card>
            <p className="text-xs font-medium text-muted">Completed Visits</p>
            <h3 className="text-2xl font-bold text-foreground mt-1 text-blue-600">
              {orgSummary?.completedVisits ?? 0}
            </h3>
            <p className="text-[11px] text-muted mt-2">Checked out safely</p>
          </Card>
        </div>

        {/* Currently Checked-in Visitors Live List */}
        <Card className="p-0 overflow-hidden w-full min-w-0">
          <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle>Currently Checked-in Visitors</CardTitle>
              <p className="text-xs text-muted mt-0.5">Real-time facility occupancy</p>
            </div>
            <Link href="/check-in" className="w-full sm:w-auto">
              <Button size="sm" variant="outline" className="w-full sm:w-auto">
                <span>View Scanner & Check-out</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {activeVisitors.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted m-4 border border-dashed border-border rounded-none">
              No visitors are currently checked in to the facility.
            </div>
          ) : (
            <div className="overflow-x-auto w-full min-w-0">
              <table className="w-full text-left text-xs whitespace-nowrap min-w-[550px]">
                <thead className="bg-gray-50 text-muted uppercase tracking-wider border-b border-border">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Pass Code</th>
                    <th className="py-2.5 px-4 font-semibold">Visitor Name</th>
                    <th className="py-2.5 px-4 font-semibold">Host Employee</th>
                    <th className="py-2.5 px-4 font-semibold">Building</th>
                    <th className="py-2.5 px-4 font-semibold">Check-in Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {activeVisitors.map((visit) => (
                    <tr key={visit._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">
                        {visit.passCode || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-foreground">
                          {visit.visitorId?.fullName}
                        </span>
                        {visit.visitorId?.company && (
                          <span className="text-[11px] text-muted block">
                            {visit.visitorId.company}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-muted">{visit.hostId?.fullName}</td>
                      <td className="py-3 px-4 text-muted">{visit.buildingId?.name || 'Main HQ'}</td>
                      <td className="py-3 px-4 font-mono text-emerald-700">
                        {formatTime(visit.checkInAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // D. ORGANIZATION ADMIN DASHBOARD (FULL)
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Organization Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Real-time analytics, facility throughput, and approval workflows.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Link href="/appointments?create=true" className="flex-1 sm:flex-initial">
            <Button size="sm" variant="primary" className="w-full">
              <Plus className="w-4 h-4" />
              <span>New Appointment</span>
            </Button>
          </Link>
          <Link href="/reports" className="flex-1 sm:flex-initial">
            <Button size="sm" variant="outline" className="w-full">
              <TrendingUp className="w-4 h-4" />
              <span>Full Analytics</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-muted">Visitors Today</p>
              <h3 className="text-2xl font-mono font-bold text-foreground mt-1">
                {orgSummary?.visitorsToday ?? 0}
              </h3>
            </div>
            <div className="w-9 h-9 rounded-none bg-zinc-100 border border-border flex items-center justify-center text-foreground">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs text-muted mt-3">Scheduled for today</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-muted">Currently Checked In</p>
              <h3 className="text-2xl font-mono font-bold text-emerald-600 mt-1">
                {orgSummary?.activeVisitors ?? 0}
              </h3>
            </div>
            <div className="w-9 h-9 rounded-none bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs text-muted mt-3">Active on facility grounds</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-muted">Pending Approvals</p>
              <h3 className="text-2xl font-mono font-bold text-amber-600 mt-1">
                {orgSummary?.pendingApprovals ?? 0}
              </h3>
            </div>
            <div className="w-9 h-9 rounded-none bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs text-muted mt-3">Awaiting host confirmation</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-muted">Completed Visits</p>
              <h3 className="text-2xl font-mono font-bold text-foreground mt-1">
                {orgSummary?.completedVisits ?? 0}
              </h3>
            </div>
            <div className="w-9 h-9 rounded-none bg-zinc-100 border border-border flex items-center justify-center text-foreground">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs text-muted mt-3">Successfully checked out</p>
        </Card>
      </div>

      {/* Real Visitor Trends Visual Bar Chart */}
      <Card className="w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <CardTitle>Visitor Volume Trends (Past 7 Days)</CardTitle>
            <p className="text-xs text-muted mt-1">Daily visit volume based on live database aggregation.</p>
          </div>
          <Badge variant="info">Real-time Data</Badge>
        </div>

        {visitorTrends.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted">No historical data recorded yet.</div>
        ) : (
          <div className="overflow-x-auto w-full min-w-0 pb-1">
            <div className="h-44 min-w-[380px] flex items-end justify-between gap-2 sm:gap-6 pt-4 border-b border-border pb-2">
              {visitorTrends.map((trend: any, idx: number) => {
                const maxVal = Math.max(...visitorTrends.map((t: any) => t.total || 0), 5);
                const heightPct = Math.round(((trend.total || 0) / maxVal) * 100);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[11px] font-mono font-bold text-foreground">{trend.total}</span>
                    <div
                      style={{ height: `${Math.max(heightPct, 6)}%` }}
                      className="w-full max-w-[40px] bg-black rounded-none hover:bg-zinc-800 transition-all cursor-pointer relative group"
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black text-white text-[10px] font-mono py-1 px-2 rounded-none whitespace-nowrap z-10 border border-zinc-700 shadow-xl">
                        {trend.date}: {trend.total} visits
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-medium text-muted mt-1">{trend.dayName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Grid: Upcoming Visits + Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent / Upcoming Visits */}
        <Card className="w-full min-w-0">
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Recent Visits & Appointments</CardTitle>
            <Link href="/appointments">
              <Button size="sm" variant="outline">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
          {upcomingVisits.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted">No visits scheduled yet.</div>
          ) : (
            <div className="divide-y divide-border">
              {upcomingVisits.slice(0, 5).map((visit) => (
                <div key={visit._id} className="py-3 flex items-center justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {visit.visitorId?.fullName}
                    </p>
                    <p className="text-[11px] text-muted truncate">
                      Host: {visit.hostId?.fullName} • {formatDate(visit.scheduledDate)}
                    </p>
                  </div>
                  <Badge status={visit.status} className="shrink-0">{visit.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Pending Approvals */}
        <Card className="w-full min-w-0">
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Pending Approvals</CardTitle>
            <Link href="/approvals">
              <Button size="sm" variant="outline">
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
          {pendingApprovals.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted">No pending approvals.</div>
          ) : (
            <div className="divide-y divide-border">
              {pendingApprovals.slice(0, 5).map((visit) => (
                <div key={visit._id} className="py-3 flex items-center justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {visit.visitorId?.fullName}
                    </p>
                    <p className="text-[11px] text-muted truncate">
                      Host: {visit.hostId?.fullName} • {visit.purpose}
                    </p>
                  </div>
                  <Badge status={visit.status} className="shrink-0">{visit.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

