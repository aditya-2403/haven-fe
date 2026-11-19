'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Building2,
  FolderTree,
  Filter,
  UserCheck,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../stores/auth.store';
import { Card, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { CardSkeleton } from '../../../components/ui/loader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { toast } from '../../../stores/toast.store';
import { REPORT_MESSAGES } from '../../../constants/messages';

export default function ReportsPage() {
  const { user } = useAuthStore();
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');

  // Super Admin: Fetch tenant organizations for filter selector
  const { data: orgsData } = useQuery({
    queryKey: ['organizationsList'],
    queryFn: async () => {
      const res = await api.get('/organizations?limit=100');
      return res.data?.data || [];
    },
    enabled: user?.role === 'SUPER_ADMIN',
  });

  const organizations = orgsData || [];

  // Query parameters based on selected organization
  const orgParam = selectedOrgId ? `?organizationId=${selectedOrgId}` : '';
  const orgParamPrefix = selectedOrgId ? `&organizationId=${selectedOrgId}` : '';

  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['reportSummary', selectedOrgId],
    queryFn: async () => {
      const res = await api.get(`/reports/summary${orgParam}`);
      return res.data?.data;
    },
  });

  const { data: trends = [], isLoading: isTrendsLoading } = useQuery({
    queryKey: ['reportTrends', selectedOrgId],
    queryFn: async () => {
      const res = await api.get(`/reports/visitor-trends?days=7${orgParamPrefix}`);
      return res.data?.data || [];
    },
  });

  const { data: departmentStats = [] } = useQuery({
    queryKey: ['departmentStats', selectedOrgId],
    queryFn: async () => {
      const res = await api.get(`/reports/department-stats${orgParam}`);
      return res.data?.data || [];
    },
  });

  const { data: topHosts = [] } = useQuery({
    queryKey: ['topHosts', selectedOrgId],
    queryFn: async () => {
      const res = await api.get(`/reports/top-hosts${orgParam}`);
      return res.data?.data || [];
    },
  });

  const handleExportCsv = async () => {
    try {
      const exportUrl = selectedOrgId
        ? `/reports/export?organizationId=${selectedOrgId}`
        : '/reports/export';
      const response = await api.get(exportUrl, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `haven_visitor_analytics_${new Date().toISOString().split('T')[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error(REPORT_MESSAGES.EXPORT_FAILED);
    }
  };

  const selectedOrgName = selectedOrgId
    ? organizations.find((o: any) => (o.id || o._id) === selectedOrgId)?.name || 'Selected Organization'
    : 'All Organizations (Global)';

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Analytics & Reports
            </h1>
            {user?.role === 'SUPER_ADMIN' ? (
              <Badge variant="info">
                {selectedOrgId ? selectedOrgName : 'Global Multi-Tenant'}
              </Badge>
            ) : (
              <Badge variant="neutral">Organization Analytics</Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Aggregated visitor throughput, facility traffic distribution, and host statistics.
          </p>
        </div>

        {/* Actions & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          {user?.role === 'SUPER_ADMIN' && (
            <div className="w-full sm:w-60">
              <Select
                value={selectedOrgId || 'ALL'}
                onValueChange={(val) => setSelectedOrgId(val === 'ALL' ? '' : val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Organizations (Global)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Organizations (Global)</SelectItem>
                  {organizations.map((org: any) => (
                    <SelectItem key={org.id || org._id} value={org.id || org._id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button size="sm" variant="outline" onClick={handleExportCsv} className="w-full sm:w-auto justify-center">
            <Download className="w-4 h-4" />
            <span>Export Complete Log</span>
          </Button>
        </div>
      </div>

      {/* Primary Throughput KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {isSummaryLoading ? (
          <CardSkeleton count={4} />
        ) : (
          <>
            <Card className="hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted">Visitors Today</p>
                <Clock className="w-4 h-4 text-primary/70" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mt-2">{summary?.visitorsToday ?? 0}</h3>
              <p className="text-[11px] text-muted mt-1">Visits on calendar today</p>
            </Card>

            <Card className="hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted">This Week</p>
                <TrendingUp className="w-4 h-4 text-primary/70" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mt-2">{summary?.visitorsThisWeek ?? 0}</h3>
              <p className="text-[11px] text-muted mt-1">Past 7 days traffic</p>
            </Card>

            <Card className="hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted">This Month</p>
                <BarChart3 className="w-4 h-4 text-primary/70" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mt-2">{summary?.visitorsThisMonth ?? 0}</h3>
              <p className="text-[11px] text-muted mt-1">Monthly throughput</p>
            </Card>

            <Card className="hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted">Total Visitors</p>
                <Users className="w-4 h-4 text-primary/70" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mt-2 text-primary">
                {summary?.totalVisitors ?? 0}
              </h3>
              <p className="text-[11px] text-muted mt-1">Unique profiles saved</p>
            </Card>
          </>
        )}
      </div>

      {/* Secondary Status KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-emerald-50/40 border-emerald-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">Completed Visits</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-emerald-950 mt-1">{summary?.completedVisits ?? 0}</p>
          <p className="text-[10px] text-emerald-700 mt-0.5">Checked-out visitors</p>
        </Card>

        <Card className="bg-blue-50/40 border-blue-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-800">Currently On-Premise</span>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-blue-950 mt-1">{summary?.activeVisitors ?? 0}</p>
          <p className="text-[10px] text-blue-700 mt-0.5">Active checked-in badges</p>
        </Card>

        <Card className="bg-amber-50/40 border-amber-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800">Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-bold text-amber-950 mt-1">{summary?.pendingApprovals ?? 0}</p>
          <p className="text-[10px] text-amber-700 mt-0.5">Awaiting host response</p>
        </Card>

        <Card className="bg-rose-50/40 border-rose-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-800">Rejected Requests</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-xl font-bold text-rose-950 mt-1">{summary?.rejectedVisits ?? 0}</p>
          <p className="text-[10px] text-rose-700 mt-0.5">Declined visit requests</p>
        </Card>
      </div>

      {/* 7-Day Trend Chart */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
          <div>
            <CardTitle>Daily Visitor Trajectory (Past 7 Days)</CardTitle>
            <p className="text-xs text-muted mt-1">
              Total scheduled incoming visitors compared to completed visits.
            </p>
          </div>
          <Badge variant="info" className="self-start sm:self-auto">
            {selectedOrgId ? selectedOrgName : 'Multi-Tenant Aggregate'}
          </Badge>
        </div>

        {trends.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted">
            No visitor trend data recorded for this period.
          </div>
        ) : (
          <div className="overflow-x-auto w-full min-w-0">
            <div className="h-48 min-w-[500px] flex items-end justify-between gap-4 pt-4 border-b border-border pb-2">
              {trends.map((t: any, idx: number) => {
                const maxVal = Math.max(...trends.map((item: any) => item.total || 0), 5);
                const heightPct = Math.round(((t.total || 0) / maxVal) * 100);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                    <span className="text-[11px] font-bold text-foreground">{t.total}</span>
                    <div
                      style={{ height: `${Math.max(heightPct, 6)}%` }}
                      className="w-full max-w-[44px] bg-[#22285B] rounded-t-lg hover:bg-[#303A7A] transition-all cursor-pointer relative group"
                    >
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-[10px] p-2 rounded whitespace-nowrap z-20 shadow-lg pointer-events-none">
                        <p className="font-bold">{t.date} ({t.dayName})</p>
                        <p>Total: {t.total} | Completed: {t.completed}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-muted mt-1">{t.dayName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Breakdown: Department Stats + Top Visited Hosts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Department-wise Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Department-Wise Visitors</CardTitle>
            <p className="text-xs text-muted">Distribution of visitors across functional departments.</p>
          </CardHeader>

          {departmentStats.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted">
              No department visit records linked yet.
            </div>
          ) : (
            <div className="space-y-3">
              {departmentStats.map((item: any) => {
                const maxDept = Math.max(...departmentStats.map((d: any) => d.visitCount || 0), 1);
                const pct = Math.round((item.visitCount / maxDept) * 100);

                return (
                  <div key={item._id} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-foreground">{item.departmentName}</span>
                      <span className="text-muted font-bold">{item.visitCount} visits</span>
                    </div>
                    <div className="w-full h-1.5 rounded-none bg-zinc-100 overflow-hidden border border-border">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full rounded-none bg-black"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Top Hosts */}
        <Card>
          <CardHeader>
            <CardTitle>Most Visited Hosts</CardTitle>
            <p className="text-xs text-muted">Staff members hosting the most visitor appointments.</p>
          </CardHeader>

          {topHosts.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted">
              No host interaction records recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {topHosts.map((host: any, idx: number) => (
                <div key={host._id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-none bg-zinc-100 border border-border text-foreground font-mono font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">{host.fullName}</p>
                      <p className="text-[10px] text-muted">{host.designation}</p>
                    </div>
                  </div>
                  <span className="font-bold text-foreground font-mono">
                    {host.visitCount} visits
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
