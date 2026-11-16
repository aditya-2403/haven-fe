'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download, Search, Filter, Clock, Building2 } from 'lucide-react';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../stores/auth.store';
import { Visit } from '../../../types';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { formatDate, formatDateTime, formatTime } from '../../../lib/utils';
import { toast } from '../../../stores/toast.store';
import { REPORT_MESSAGES } from '../../../constants/messages';

export default function VisitorLogsPage() {
  const { user } = useAuthStore();
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

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

  const { data, isLoading } = useQuery<{ data: Visit[]; pagination: any }>({
    queryKey: ['visitorLogs', selectedOrgId, search, status, startDate, endDate, page],
    queryFn: async () => {
      let url = `/visits?page=${page}&limit=20`;
      if (selectedOrgId) url += `&organizationId=${selectedOrgId}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (status) url += `&status=${status}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      const res = await api.get(url);
      return res.data;
    },
  });

  const logs = data?.data || [];
  const pagination = data?.pagination;

  const handleExportCsv = async () => {
    try {
      let url = '/reports/export?';
      if (selectedOrgId) url += `organizationId=${selectedOrgId}&`;
      if (startDate) url += `startDate=${startDate}&`;
      if (endDate) url += `endDate=${endDate}&`;

      const response = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `haven_visitor_logs_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(REPORT_MESSAGES.EXPORT_SUCCESS);
    } catch (err) {
      toast.error(REPORT_MESSAGES.EXPORT_FAILED);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Visitor Access Logs
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Complete audit trail of all historical visitor registrations, approvals, check-ins, and exits.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={handleExportCsv}>
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-surface p-3.5 rounded-xl border border-border">
        {user?.role === 'SUPER_ADMIN' && (
          <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-border">
            <Building2 className="w-4 h-4 text-primary shrink-0" />
            <select
              value={selectedOrgId}
              onChange={(e) => {
                setSelectedOrgId(e.target.value);
                setPage(1);
              }}
              className="text-xs bg-transparent text-foreground font-medium focus:outline-none cursor-pointer"
            >
              <option value="">All Organizations</option>
              {organizations.map((org: any) => (
                <option key={org.id || org._id} value={org.id || org._id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search logs by visitor, purpose or host..."
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-white rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="text-xs p-2 rounded-lg border border-border bg-white text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="CHECKED_OUT">Completed (Checked Out)</option>
          <option value="CHECKED_IN">Currently Checked In</option>
          <option value="APPROVED">Approved (Upcoming)</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="text-xs p-1.5 rounded-lg border border-border bg-white text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
          />
          <span className="text-xs text-muted">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="text-xs p-1.5 rounded-lg border border-border bg-white text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>

        {(selectedOrgId || search || status || startDate || endDate) && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedOrgId('');
              setSearch('');
              setStatus('');
              setStartDate('');
              setEndDate('');
              setPage(1);
            }}
          >
            Reset
          </Button>
        )}
      </div>

      {/* Logs Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-muted uppercase tracking-wider border-b border-border">
              <tr>
                <th className="py-3 px-4 font-semibold">Pass Code</th>
                {user?.role === 'SUPER_ADMIN' && (
                  <th className="py-3 px-4 font-semibold">Organization</th>
                )}
                <th className="py-3 px-4 font-semibold">Visitor Name</th>
                <th className="py-3 px-4 font-semibold">Host Employee</th>
                <th className="py-3 px-4 font-semibold">Department / Location</th>
                <th className="py-3 px-4 font-semibold">Purpose</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Check-In</th>
                <th className="py-3 px-4 font-semibold">Check-Out</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={user?.role === 'SUPER_ADMIN' ? 9 : 8} className="py-8 text-center text-muted">
                    Loading visitor logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === 'SUPER_ADMIN' ? 9 : 8} className="py-8 text-center text-muted">
                    No logs found matching your search.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-primary">
                      {log.passCode || '—'}
                    </td>
                    {user?.role === 'SUPER_ADMIN' && (
                      <td className="py-3 px-4 font-medium text-foreground">
                        {(log as any).organizationId?.name || '—'}
                      </td>
                    )}
                    <td className="py-3 px-4">
                      <p className="font-semibold text-foreground">{log.visitorId?.fullName}</p>
                      <p className="text-[10px] text-muted">{log.visitorId?.company || log.visitorId?.phone}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-foreground">{log.hostId?.fullName}</p>
                      <p className="text-[10px] text-muted">{log.hostId?.designation}</p>
                    </td>
                    <td className="py-3 px-4 text-muted">
                      <p>{log.departmentId?.name || 'General'}</p>
                      <p className="text-[10px]">{log.buildingId?.name || 'Main HQ'}</p>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-muted" title={log.purpose}>
                      {log.purpose}
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={log.status}>{log.status}</Badge>
                    </td>
                    <td className="py-3 px-4 font-mono text-muted">
                      {log.checkInAt ? formatDateTime(log.checkInAt) : '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-muted">
                      {log.checkOutAt ? formatDateTime(log.checkOutAt) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-3.5 border-t border-border bg-gray-50/50 text-xs">
            <span className="text-muted">
              Showing page <strong className="text-foreground">{pagination.page}</strong> of{' '}
              <strong className="text-foreground">{pagination.totalPages}</strong> ({pagination.total} records)
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
