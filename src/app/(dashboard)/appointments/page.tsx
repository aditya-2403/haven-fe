'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  Plus,
  Search,
  QrCode,
  XCircle,
  AlertCircle,
  UserCheck,
  UserPlus,
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
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Combobox } from '../../../components/ui/combobox';
import { ConfirmationDialog } from '../../../components/ui/confirmation-dialog';
import { TableSkeleton } from '../../../components/ui/loader';
import { toast } from '../../../stores/toast.store';
import { formatDate, formatTime } from '../../../lib/utils';
import { useAuthStore } from '../../../stores/auth.store';
import { APPOINTMENT_MESSAGES, VISITOR_MESSAGES } from '../../../constants/messages';

function AppointmentsContent() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const searchParams = useSearchParams();

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

  // Inline quick visitor registration state
  const [isNewVisitorOpen, setIsNewVisitorOpen] = useState(false);
  const [newVisitorName, setNewVisitorName] = useState('');
  const [newVisitorPhone, setNewVisitorPhone] = useState('');
  const [newVisitorEmail, setNewVisitorEmail] = useState('');
  const [newVisitorCompany, setNewVisitorCompany] = useState('');
  const [newVisitorErrors, setNewVisitorErrors] = useState<Record<string, string>>({});
  const [newVisitorFormError, setNewVisitorFormError] = useState<string | null>(null);

  // Auto-trigger create modal if directed with ?create=true or ?new=true
  useEffect(() => {
    const shouldCreate = searchParams.get('create') === 'true' || searchParams.get('new') === 'true';
    if (shouldCreate) {
      setIsCreateOpen(true);
      if (searchParams.get('type') === 'walk-in') {
        setVisitType('WALK_IN');
        const now = new Date();
        setScheduledDate(now.toISOString().split('T')[0]);
        setScheduledTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
      }
    }
  }, [searchParams]);

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

  // Selected visitor object helper
  const selectedVisitor = visitors.find((v) => v._id === visitorId);

  // Inline create visitor mutation
  const createVisitorMutation = useMutation({
    mutationFn: async (payload: { fullName: string; phone: string; email?: string; company?: string }) => {
      const res = await api.post('/visitors', payload);
      return res.data;
    },
    onSuccess: (resData) => {
      queryClient.invalidateQueries({ queryKey: ['visitorsList'] });
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
      const newVisitor = resData?.data;
      if (newVisitor?._id) {
        setVisitorId(newVisitor._id);
        if (errors.visitorId) {
          setErrors((prev) => ({ ...prev, visitorId: '' }));
        }
      }
      // Reset inline form fields and close
      setNewVisitorName('');
      setNewVisitorPhone('');
      setNewVisitorEmail('');
      setNewVisitorCompany('');
      setNewVisitorErrors({});
      setNewVisitorFormError(null);
      setIsNewVisitorOpen(false);

      toast.success(
        VISITOR_MESSAGES.SAVED_SUCCESS(newVisitor?.fullName || 'New Visitor'),
        VISITOR_MESSAGES.SAVED_TITLE,
      );
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to register visitor';
      setNewVisitorFormError(msg);
      toast.error(msg, VISITOR_MESSAGES.REGISTRATION_ERROR_TITLE);
    },
  });

  const handleCreateNewVisitor = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setNewVisitorFormError(null);

    const errs: Record<string, string> = {};
    if (!newVisitorName.trim()) {
      errs.fullName = VISITOR_MESSAGES.NAME_REQUIRED;
    }
    if (!newVisitorPhone.trim()) {
      errs.phone = VISITOR_MESSAGES.PHONE_REQUIRED;
    } else if (newVisitorPhone.trim().length < 7) {
      errs.phone = VISITOR_MESSAGES.PHONE_REQUIRED;
    }
    if (newVisitorEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newVisitorEmail.trim())) {
      errs.email = VISITOR_MESSAGES.EMAIL_INVALID;
    }

    setNewVisitorErrors(errs);
    if (Object.keys(errs).length > 0) return;

    createVisitorMutation.mutate({
      fullName: newVisitorName.trim(),
      phone: newVisitorPhone.trim(),
      email: newVisitorEmail.trim() || undefined,
      company: newVisitorCompany.trim() || undefined,
    });
  };

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/visits', payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['orgSummary'] });
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['activeVisitors'] });
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
    setIsNewVisitorOpen(false);
    setNewVisitorName('');
    setNewVisitorPhone('');
    setNewVisitorEmail('');
    setNewVisitorCompany('');
    setNewVisitorErrors({});
    setNewVisitorFormError(null);
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
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setVisitType('WALK_IN');
              const now = new Date();
              setScheduledDate(now.toISOString().split('T')[0]);
              setScheduledTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
              setIsCreateOpen(true);
            }}
            className="flex-1 sm:flex-initial"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Walk-in</span>
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setVisitType('APPOINTMENT');
              setIsCreateOpen(true);
            }}
            className="flex-1 sm:flex-initial"
          >
            <Plus className="w-4 h-4" />
            <span>New Appointment</span>
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5">
        <div className="w-full sm:w-48">
          <Select
            value={statusFilter || 'ALL'}
            onValueChange={(val) => setStatusFilter(val === 'ALL' ? '' : val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="CHECKED_IN">Checked In</SelectItem>
              <SelectItem value="CHECKED_OUT">Checked Out</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="text-xs px-3 py-2 rounded-none border border-border bg-surface text-foreground focus:border-foreground focus:outline-none w-full sm:w-auto h-9 font-mono"
        />

        {(statusFilter || dateFilter) && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setStatusFilter('');
              setDateFilter('');
            }}
            className="w-full sm:w-auto"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Appointments Table */}
      <Card className="p-0 overflow-hidden w-full min-w-0">
        <div className="overflow-x-auto w-full min-w-0">
          <table className="w-full text-left text-xs whitespace-nowrap min-w-[700px]">
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
                <TableSkeleton rows={5} cols={7} />
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
        title={visitType === 'WALK_IN' ? 'Register Walk-in Visit' : 'Schedule Appointment'}
        description={
          visitType === 'WALK_IN'
            ? 'Record an on-site guest arrival and assign host employee.'
            : 'Book a future visit schedule and request host approval.'
        }
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4" noValidate>
          {formError && (
            <div className="p-3 rounded-none bg-red-50 text-danger text-xs flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Visitor Selector & Inline Creation */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Select Visitor *</Label>
              <button
                type="button"
                onClick={() => {
                  setIsNewVisitorOpen(!isNewVisitorOpen);
                  setNewVisitorErrors({});
                  setNewVisitorFormError(null);
                }}
                className="text-xs font-semibold text-foreground hover:underline flex items-center gap-1.5 transition-colors font-mono"
              >
                {isNewVisitorOpen ? (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel & Choose Existing</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Quick Add New Visitor</span>
                  </>
                )}
              </button>
            </div>

            {/* Inline Sub-form when isNewVisitorOpen is true */}
            {isNewVisitorOpen ? (
              <div className="p-3.5 sm:p-4 rounded-none border border-dashed border-border bg-zinc-50 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-none bg-black text-white flex items-center justify-center">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold font-mono uppercase tracking-wider text-foreground">Register New Visitor</p>
                      <p className="text-[11px] text-muted">Creates record and auto-selects for this visit.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewVisitorOpen(false);
                      setNewVisitorErrors({});
                      setNewVisitorFormError(null);
                    }}
                    className="text-muted hover:text-foreground p-1"
                    title="Close sub-form"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>

                {newVisitorFormError && (
                  <div className="p-2.5 rounded-none bg-red-50 text-danger text-xs flex items-center gap-2 border border-red-200">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{newVisitorFormError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Full Name *"
                    placeholder="e.g. Sarah Jenkins"
                    value={newVisitorName}
                    error={newVisitorErrors.fullName}
                    onChange={(e) => {
                      setNewVisitorName(e.target.value);
                      if (newVisitorErrors.fullName) setNewVisitorErrors((p) => ({ ...p, fullName: '' }));
                    }}
                    required
                  />
                  <Input
                    label="Phone Number *"
                    placeholder="e.g. +1 555-0199"
                    value={newVisitorPhone}
                    error={newVisitorErrors.phone}
                    onChange={(e) => {
                      setNewVisitorPhone(e.target.value);
                      if (newVisitorErrors.phone) setNewVisitorErrors((p) => ({ ...p, phone: '' }));
                    }}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="e.g. sarah@acme.com"
                    value={newVisitorEmail}
                    error={newVisitorErrors.email}
                    onChange={(e) => {
                      setNewVisitorEmail(e.target.value);
                      if (newVisitorErrors.email) setNewVisitorErrors((p) => ({ ...p, email: '' }));
                    }}
                  />
                  <Input
                    label="Company / Affiliation"
                    placeholder="e.g. Acme Corp"
                    value={newVisitorCompany}
                    onChange={(e) => setNewVisitorCompany(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsNewVisitorOpen(false);
                      setNewVisitorErrors({});
                      setNewVisitorFormError(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    isLoading={createVisitorMutation.isPending}
                    onClick={handleCreateNewVisitor}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Save & Select Visitor</span>
                  </Button>
                </div>
              </div>
            ) : (
              /* Searchable Combobox when isNewVisitorOpen is false */
              <div className="space-y-2">
                <Combobox
                  options={visitors.map((v) => ({
                    value: v._id,
                    label: v.fullName,
                    sublabel: `${v.phone}${v.company ? ` • ${v.company}` : ''}`,
                    badge: v.company || undefined,
                  }))}
                  value={visitorId}
                  onChange={(val) => {
                    setVisitorId(val);
                    if (errors.visitorId) setErrors((prev) => ({ ...prev, visitorId: '' }));
                  }}
                  placeholder="Search or choose visitor..."
                  searchPlaceholder="Type name, phone, or company..."
                  emptyText="No registered visitor found."
                  actionText="Quick Register New Visitor"
                  onActionClick={() => setIsNewVisitorOpen(true)}
                  error={errors.visitorId}
                />
                {errors.visitorId && <p className="text-xs text-danger font-medium mt-1">{errors.visitorId}</p>}

                {/* Selected visitor preview chip */}
                {selectedVisitor && (
                  <div className="flex items-center justify-between p-2.5 rounded-none bg-zinc-50 border border-border text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-none bg-black text-white flex items-center justify-center font-bold font-mono text-[11px] shrink-0">
                        {selectedVisitor.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <span className="font-semibold text-foreground">{selectedVisitor.fullName}</span>
                        <span className="text-muted ml-2 text-[11px] font-mono truncate">
                          {selectedVisitor.phone} {selectedVisitor.company ? `• ${selectedVisitor.company}` : ''}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-none shrink-0 border border-emerald-200">
                      Selected
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Designated Host (Employee) *</Label>
            <Combobox
              options={employees.map((emp) => ({
                value: emp._id,
                label: emp.fullName,
                sublabel: `${emp.designation || 'Staff'} • ${emp.employeeId}`,
                badge: emp.employeeId,
              }))}
              value={hostId}
              onChange={(val) => {
                setHostId(val);
                if (errors.hostId) setErrors((prev) => ({ ...prev, hostId: '' }));
              }}
              placeholder="Search or choose host employee..."
              searchPlaceholder="Search employee name, ID, or title..."
              emptyText="No employees found."
              error={errors.hostId}
            />
            {errors.hostId && <p className="text-xs text-danger font-medium mt-1">{errors.hostId}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Facility / Building</Label>
              <Select
                value={buildingId || 'all'}
                onValueChange={(val) => setBuildingId(val === 'all' ? '' : val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Main Campus / Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Main Campus / Any</SelectItem>
                  {buildings.map((b) => (
                    <SelectItem key={b._id} value={b._id}>
                      {b.name} ({b.locationCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select
                value={departmentId || 'default'}
                onValueChange={(val) => setDepartmentId(val === 'default' ? '' : val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Default Host Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default Host Department</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d._id} value={d._id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              {visitType === 'WALK_IN' ? 'Register Walk-in Visit' : 'Schedule Appointment'}
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
            <div className="p-3 sm:p-4 bg-white rounded-none border border-border shadow-2xl inline-block max-w-full">
              {viewingPass.qrCodeDataUrl ? (
                <img
                  src={viewingPass.qrCodeDataUrl}
                  alt="Visitor Pass QR"
                  className="w-44 h-44 sm:w-56 sm:h-56 mx-auto object-contain"
                />
              ) : (
                <div className="w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center text-muted text-xs">
                  Generating QR code...
                </div>
              )}
              <div className="mt-2 text-center">
                <span className="text-[11px] text-muted font-mono uppercase tracking-wider block">
                  Pass Code
                </span>
                <span className="text-xl font-mono font-bold text-foreground">
                  {viewingPass.pass?.passCode}
                </span>
              </div>
            </div>

            <div className="w-full bg-zinc-50 rounded-none p-3 text-left text-xs space-y-1.5 border border-border font-mono">
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

export default function AppointmentsPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={5} cols={7} />}>
      <AppointmentsContent />
    </Suspense>
  );
}
