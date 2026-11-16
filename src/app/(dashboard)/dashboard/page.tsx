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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted">Total Organizations</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">
                  {superAdminStats?.totalOrganizations ?? 0}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs">
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
                <p className="text-xs font-medium text-muted">Platform Users</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">
                  {superAdminStats?.totalUsers ?? 0}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-muted mt-3">Across all registered tenants</p>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted">Registered Visitors</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">
                  {superAdminStats?.totalVisitors ?? 0}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-muted mt-3">Profiles in system repository</p>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted">System Status</p>
                <h3 className="text-lg font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  Operational
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-muted mt-3">MongoDB & JWT Engine Online</p>
          </Card>
        </div>

        {/* Recent Organizations Section */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Recent Organizations</CardTitle>
            <Link href="/organizations">
              <Button size="sm" variant="outline">
                <span>Manage Organizations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted">Pending Your Approval</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">
                  {pendingApprovals.length}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <ClipboardCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-muted mt-3">Action required</p>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted">Upcoming Visits</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">
                  {upcomingVisits.filter((v) => v.status === 'APPROVED').length}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <CalendarDays className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-muted mt-3">Approved & scheduled</p>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted">Completed Visits</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">
                  {upcomingVisits.filter((v) => v.status === 'CHECKED_OUT').length}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-muted mt-3">Past visitor logs</p>
          </Card>
        </div>

        {/* Pending Approval Requests Section with Quick Action */}
        <Card>
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
                  className="p-4 rounded-xl border border-border bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">
                        {visit.visitorId?.fullName}
                      </span>
                      {visit.visitorId?.company && (
                        <span className="text-xs text-muted bg-white px-2 py-0.5 rounded border border-border">
                          {visit.visitorId.company}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted">
                      <span className="font-medium text-foreground">Purpose:</span> {visit.purpose}
                    </p>
                    <p className="text-[11px] text-muted flex items-center gap-2">
                      <span>Date: {formatDate(visit.scheduledDate)} at {visit.scheduledTime}</span>
                      <span>•</span>
                      <span>Phone: {visit.visitorId?.phone}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setSelectedVisitForApproval(visit)}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="success"
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
              <div className="p-3 bg-gray-50 rounded-lg text-xs space-y-1.5 border border-border">
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
                  className="w-full text-xs p-2.5 rounded-lg border border-border focus:ring-1 focus:ring-primary focus:outline-none"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedVisitForApproval(null)}
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
          <div className="flex items-center gap-2">
            <Link href="/check-in">
              <Button size="sm" variant="primary">
                <QrCode className="w-4 h-4" />
                <span>Open QR Scanner</span>
              </Button>
            </Link>
            {user.role === 'RECEPTIONIST' && (
              <Link href="/appointments">
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4" />
                  <span>New Walk-in</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Fast Action Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle>Currently Checked-in Visitors</CardTitle>
              <p className="text-xs text-muted mt-0.5">Real-time facility occupancy</p>
            </div>
            <Link href="/check-in">
              <Button size="sm" variant="outline">
                <span>View Scanner & Check-out</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {activeVisitors.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted border border-dashed border-border rounded-xl">
              No visitors are currently checked in to the facility.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-muted uppercase tracking-wider border-y border-border">
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
        <div className="flex items-center gap-2">
          <Link href="/appointments">
            <Button size="sm" variant="primary">
              <Plus className="w-4 h-4" />
              <span>New Appointment</span>
            </Button>
          </Link>
          <Link href="/reports">
            <Button size="sm" variant="outline">
              <TrendingUp className="w-4 h-4" />
              <span>Full Analytics</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted">Visitors Today</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {orgSummary?.visitorsToday ?? 0}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-muted mt-3">Scheduled for today</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted">Currently Checked In</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                {orgSummary?.activeVisitors ?? 0}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <QrCode className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-muted mt-3">Active on facility grounds</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted">Pending Approvals</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">
                {orgSummary?.pendingApprovals ?? 0}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-muted mt-3">Awaiting host confirmation</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted">Completed Visits</p>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">
                {orgSummary?.completedVisits ?? 0}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-muted mt-3">Successfully checked out</p>
        </Card>
      </div>

      {/* Real Visitor Trends Visual Bar Chart */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <CardTitle>Visitor Volume Trends (Past 7 Days)</CardTitle>
            <p className="text-xs text-muted mt-1">Daily visit volume based on live database aggregation.</p>
          </div>
          <Badge variant="info">Real-time Data</Badge>
        </div>

        {visitorTrends.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted">No historical data recorded yet.</div>
        ) : (
          <div className="h-44 flex items-end justify-between gap-2 sm:gap-6 pt-4 border-b border-border pb-2">
            {visitorTrends.map((trend: any, idx: number) => {
              const maxVal = Math.max(...visitorTrends.map((t: any) => t.total || 0), 5);
              const heightPct = Math.round(((trend.total || 0) / maxVal) * 100);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[11px] font-bold text-foreground">{trend.total}</span>
                  <div
                    style={{ height: `${Math.max(heightPct, 6)}%` }}
                    className="w-full max-w-[40px] bg-[#22285B] rounded-t-md hover:bg-[#303A7A] transition-all cursor-pointer relative group"
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10 shadow">
                      {trend.date}: {trend.total} visits
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-muted mt-1">{trend.dayName}</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Grid: Upcoming Visits + Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent / Upcoming Visits */}
        <Card>
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
                <div key={visit._id} className="py-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground">
                      {visit.visitorId?.fullName}
                    </p>
                    <p className="text-[11px] text-muted">
                      Host: {visit.hostId?.fullName} • {formatDate(visit.scheduledDate)}
                    </p>
                  </div>
                  <Badge status={visit.status}>{visit.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Pending Approvals */}
        <Card>
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
                <div key={visit._id} className="py-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground">
                      {visit.visitorId?.fullName}
                    </p>
                    <p className="text-[11px] text-muted">
                      Host: {visit.hostId?.fullName} • {visit.purpose}
                    </p>
                  </div>
                  <Badge status={visit.status}>{visit.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

