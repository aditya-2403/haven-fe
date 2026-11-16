'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  Plus,
  Search,
  QrCode,
  XCircle,
  AlertCircle,
  UserCheck,
  Building2,
  Clock,
  Printer,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Visit, Visitor, Employee, Building, Department } from '../../../types';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { Modal } from '../../../components/ui/modal';
import { ConfirmationDialog } from '../../../components/ui/confirmation-dialog';
import { toast } from '../../../stores/toast.store';
import { formatDate, formatTime } from '../../../lib/utils';
import { useAuthStore } from '../../../stores/auth.store';
import { APPOINTMENT_MESSAGES } from '../../../constants/messages';

export default function AppointmentsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [cancelTargetVisit, setCancelTargetVisit] = useState<Visit | null>(null);
  const [viewingPass, setViewingPass] = useState<any | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states & validation errors
  const [visitorId, setVisitorId] = useState('');
  const [hostId, setHostId] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [visitType, setVisitType] = useState<'APPOINTMENT' | 'WALK_IN'>('APPOINTMENT');
  const [purpose, setPurpose] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('10:00');
  const [expectedDurationMinutes, setExpectedDurationMinutes] = useState(60);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 1. Appointments Query
  const { data: appointmentsData, isLoading } = useQuery<{ data: Visit[]; pagination: any }>({
    queryKey: ['appointments', statusFilter, dateFilter],
    queryFn: async () => {
      let url = `/visits?limit=50`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (dateFilter) url += `&date=${dateFilter}`;
      const res = await api.get(url);
      return res.data;
    },
  });

  const appointments = appointmentsData?.data || [];

  // Auxiliary data queries for form selects
  const { data: visitors = [] } = useQuery<Visitor[]>({
    queryKey: ['visitorsList'],
    queryFn: async () => {
      const res = await api.get('/visitors?limit=100');
      return res.data?.data || [];
    },
    enabled: isCreateOpen,
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['employeesList'],
    queryFn: async () => {
      const res = await api.get('/employees');
      return res.data?.data || [];
    },
    enabled: isCreateOpen,
  });

  const { data: buildings = [] } = useQuery<Building[]>({
    queryKey: ['buildingsList'],
    queryFn: async () => {
      const res = await api.get('/buildings');
      return res.data?.data || [];
    },
    enabled: isCreateOpen,
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['departmentsList'],
    queryFn: async () => {
      const res = await api.get('/departments');
      return res.data?.data || [];
    },
    enabled: isCreateOpen,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/visits', payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['orgSummary'] });
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      setIsCreateOpen(false);
      resetForm();
      toast.success(
        APPOINTMENT_MESSAGES.CREATED_SUCCESS,
        APPOINTMENT_MESSAGES.CREATED_TITLE,
      );
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to create appointment';
      setFormError(msg);
      toast.error(msg, APPOINTMENT_MESSAGES.CREATION_FAILED_TITLE);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/visits/${id}/cancel`, { reason: 'Cancelled by user' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['orgSummary'] });
      toast.success(APPOINTMENT_MESSAGES.CANCELLED_SUCCESS, APPOINTMENT_MESSAGES.CANCELLED_TITLE);
      setCancelTargetVisit(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to cancel appointment', APPOINTMENT_MESSAGES.CANCEL_ERROR_TITLE);
      setCancelTargetVisit(null);
    },
  });

  const viewPassQuery = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.get(`/visits/${id}/pass`);
      return res.data?.data;
    },
    onSuccess: (data) => {
      setViewingPass(data);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || APPOINTMENT_MESSAGES.PASS_NOT_AVAILABLE, APPOINTMENT_MESSAGES.PASS_ERROR_TITLE);
    },
  });

  const resetForm = () => {
    setVisitorId('');
    setHostId(user?.employeeId || '');
    setBuildingId('');
    setDepartmentId('');
    setVisitType('APPOINTMENT');
    setPurpose('');
    setScheduledDate(new Date().toISOString().split('T')[0]);
    setScheduledTime('10:00');
    setExpectedDurationMinutes(60);
    setNotes('');
    setErrors({});
    setFormError(null);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!visitorId) errs.visitorId = APPOINTMENT_MESSAGES.VISITOR_REQUIRED;
    const assignedHostId = hostId || user?.employeeId;
    if (!assignedHostId) errs.hostId = APPOINTMENT_MESSAGES.HOST_REQUIRED;
    if (!scheduledDate) errs.scheduledDate = APPOINTMENT_MESSAGES.DATE_REQUIRED;
    if (!scheduledTime) errs.scheduledTime = APPOINTMENT_MESSAGES.TIME_REQUIRED;
    if (!purpose.trim()) {
      errs.purpose = APPOINTMENT_MESSAGES.PURPOSE_REQUIRED;
    } else if (purpose.trim().length < 4) {
      errs.purpose = APPOINTMENT_MESSAGES.PURPOSE_MIN_LENGTH;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    createMutation.mutate({
      visitorId,
      hostId: hostId || user?.employeeId,
      buildingId: buildingId || undefined,
      departmentId: departmentId || undefined,
      visitType,
      purpose: purpose.trim(),
      scheduledDate,
      scheduledTime,
      expectedDurationMinutes: Number(expectedDurationMinutes),
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Appointments & Visits
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Schedule visits, manage pre-approvals, and generate verifiable QR passes.
          </p>
        </div>
        <Button size="sm" variant="primary" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4" />
          <span>New Appointment</span>
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs p-2 rounded-lg border border-border bg-surface text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="APPROVED">Approved</option>
          <option value="CHECKED_IN">Checked In</option>
          <option value="CHECKED_OUT">Checked Out</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="text-xs p-2 rounded-lg border border-border bg-surface text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
        />

        {(statusFilter || dateFilter) && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setStatusFilter('');
              setDateFilter('');
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Appointments Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-muted uppercase tracking-wider border-b border-border">
              <tr>
                <th className="py-3 px-4 font-semibold">Pass / ID</th>
                <th className="py-3 px-4 font-semibold">Visitor</th>
                <th className="py-3 px-4 font-semibold">Host Employee</th>
                <th className="py-3 px-4 font-semibold">Scheduled Time</th>
                <th className="py-3 px-4 font-semibold">Purpose</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted">
                    Loading appointments...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted">
                    No appointments matching the selected filters.
                  </td>
                </tr>
              ) : (
                appointments.map((visit) => (
                  <tr key={visit._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-primary">
                      {visit.passCode || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-foreground">{visit.visitorId?.fullName}</p>
                      <p className="text-[10px] text-muted">{visit.visitorId?.company || visit.visitorId?.phone}</p>
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
                      {(visit.status === 'APPROVED' || visit.status === 'CHECKED_IN') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewPassQuery.mutate(visit._id)}
                          isLoading={viewPassQuery.isPending}
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Pass</span>
                        </Button>
                      )}
                      {visit.status === 'PENDING_APPROVAL' && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setCancelTargetVisit(visit)}
                        >
                          Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Confirmation Dialog for Appointment Cancellation */}
      <ConfirmationDialog
        isOpen={!!cancelTargetVisit}
        onClose={() => setCancelTargetVisit(null)}
        onConfirm={() => {
          if (cancelTargetVisit) {
            cancelMutation.mutate(cancelTargetVisit._id);
          }
        }}
        title={APPOINTMENT_MESSAGES.CANCEL_CONFIRM_TITLE}
        message={APPOINTMENT_MESSAGES.CANCEL_CONFIRM_MSG}
        confirmText={APPOINTMENT_MESSAGES.CANCEL_CONFIRM_BUTTON}
        variant="danger"
        isLoading={cancelMutation.isPending}
      />

      {/* Create Appointment Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          resetForm();
        }}
        title="Schedule Appointment / Walk-in"
        description="Book a visit schedule and request host approval."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4" noValidate>
          {formError && (
            <div className="p-3 rounded-lg bg-red-50 text-danger text-xs flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Select Visitor *</label>
            <select
              value={visitorId}
              onChange={(e) => {
                setVisitorId(e.target.value);
                if (errors.visitorId) setErrors((prev) => ({ ...prev, visitorId: '' }));
              }}
              className={`w-full text-xs p-2.5 rounded-lg border bg-white focus:outline-none ${
                errors.visitorId
                  ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger'
                  : 'border-border focus:ring-1 focus:ring-primary'
              }`}
              required
            >
              <option value="">-- Choose a registered visitor --</option>
              {visitors.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.fullName} ({v.phone}) — {v.company || 'Individual'}
                </option>
              ))}
            </select>
            {errors.visitorId && <p className="text-xs text-danger font-medium mt-1">{errors.visitorId}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Designated Host (Employee) *</label>
            <select
              value={hostId}
              onChange={(e) => {
                setHostId(e.target.value);
                if (errors.hostId) setErrors((prev) => ({ ...prev, hostId: '' }));
              }}
              className={`w-full text-xs p-2.5 rounded-lg border bg-white focus:outline-none ${
                errors.hostId
                  ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger'
                  : 'border-border focus:ring-1 focus:ring-primary'
              }`}
              required
            >
              <option value="">-- Select employee host --</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.fullName} ({emp.designation}) — {emp.employeeId}
                </option>
              ))}
            </select>
            {errors.hostId && <p className="text-xs text-danger font-medium mt-1">{errors.hostId}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Facility / Building</label>
              <select
                value={buildingId}
                onChange={(e) => setBuildingId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Main Campus / Any</option>
                {buildings.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} ({b.locationCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Default Host Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Scheduled Date *"
              type="date"
              value={scheduledDate}
              error={errors.scheduledDate}
              onChange={(e) => {
                setScheduledDate(e.target.value);
                if (errors.scheduledDate) setErrors((prev) => ({ ...prev, scheduledDate: '' }));
              }}
              required
            />
            <Input
              label="Scheduled Time *"
              type="time"
              value={scheduledTime}
              error={errors.scheduledTime}
              onChange={(e) => {
                setScheduledTime(e.target.value);
                if (errors.scheduledTime) setErrors((prev) => ({ ...prev, scheduledTime: '' }));
              }}
              required
            />
            <Input
              label="Expected Duration (Min)"
              type="number"
              value={expectedDurationMinutes}
              onChange={(e) => setExpectedDurationMinutes(Number(e.target.value))}
              min={15}
            />
          </div>

          <Input
            label="Visit Purpose *"
            value={purpose}
            error={errors.purpose}
            onChange={(e) => {
              setPurpose(e.target.value);
              if (errors.purpose) setErrors((prev) => ({ ...prev, purpose: '' }));
            }}
            placeholder="e.g. Vendor Q4 quarterly budget review"
            required
          />

          <Input
            label="Additional Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Special parking requested, escort required, etc."
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsCreateOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={createMutation.isPending}>
              Schedule Appointment
            </Button>
          </div>
        </form>
      </Modal>

      {/* View QR Visitor Pass Modal */}
      <Modal
        isOpen={!!viewingPass}
        onClose={() => setViewingPass(null)}
        title="Visitor Digital Pass"
        description="Verifiable QR code and credentials for entry verification."
        maxWidth="md"
      >
        {viewingPass && (
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-white rounded-2xl border-2 border-primary/20 shadow-sm inline-block">
              {viewingPass.qrCodeDataUrl ? (
                <img
                  src={viewingPass.qrCodeDataUrl}
                  alt="Visitor Pass QR"
                  className="w-56 h-56 mx-auto object-contain"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-muted text-xs">
                  Generating QR code...
                </div>
              )}
              <div className="mt-2 text-center">
                <span className="text-[11px] text-muted font-mono uppercase tracking-wider block">
                  Pass Code
                </span>
                <span className="text-xl font-mono font-bold text-primary">
                  {viewingPass.pass?.passCode}
                </span>
              </div>
            </div>

            <div className="w-full bg-gray-50 rounded-xl p-3 text-left text-xs space-y-1.5 border border-border">
              <p><strong>Visitor:</strong> {viewingPass.pass?.visitor?.fullName}</p>
              <p><strong>Host:</strong> {viewingPass.pass?.host?.fullName} ({viewingPass.pass?.host?.designation})</p>
              <p><strong>Date & Time:</strong> {formatDate(viewingPass.pass?.scheduledDate)} at {viewingPass.pass?.scheduledTime}</p>
              <p><strong>Building:</strong> {viewingPass.pass?.building?.name || 'Main HQ'}</p>
              <p className="text-[11px] text-muted pt-1">
                Expires: {formatDate(viewingPass.pass?.expiresAt)}
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                toast.info(APPOINTMENT_MESSAGES.PRINT_INFO, APPOINTMENT_MESSAGES.PRINT_TITLE);
                window.print();
              }}
              className="w-full"
            >
              <Printer className="w-4 h-4" />
              <span>Print Visitor Pass</span>
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
