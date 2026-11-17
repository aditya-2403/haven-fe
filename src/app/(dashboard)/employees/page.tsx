'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  AlertCircle,
  Phone,
  Mail,
  Building,
  Briefcase,
  KeyRound,
  CheckCircle2,
  ShieldAlert,
  Lock,
  Building2,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Employee, Department, Organization } from '../../../types';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { Modal } from '../../../components/ui/modal';
import { TableSkeleton } from '../../../components/ui/loader';
import { toast } from '../../../stores/toast.store';
import { useAuthStore } from '../../../stores/auth.store';
import { EMPLOYEE_MESSAGES } from '../../../constants/messages';

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states & field-level errors
  const [employeeId, setEmployeeId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [designation, setDesignation] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [createLogin, setCreateLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Provisioning existing employee modal
  const [provisionEmp, setProvisionEmp] = useState<Employee | null>(null);
  const [provisionPassword, setProvisionPassword] = useState('');
  const [provisionError, setProvisionError] = useState<string | null>(null);

  // Super Admin: Fetch tenant organizations for assignment
  const { data: orgsData = [] } = useQuery<Organization[]>({
    queryKey: ['organizationsList'],
    queryFn: async () => {
      const res = await api.get('/organizations?limit=100');
      return res.data?.data || [];
    },
    enabled: currentUser?.role === 'SUPER_ADMIN',
  });

  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ['employees', search],
    queryFn: async () => {
      const res = await api.get(`/employees?search=${encodeURIComponent(search)}`);
      return res.data?.data || [];
    },
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['departmentsList'],
    queryFn: async () => {
      const res = await api.get('/departments');
      return res.data?.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/employees', payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employeesList'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsCreateOpen(false);
      resetForm();

      if (createLogin) {
        toast.success(
          EMPLOYEE_MESSAGES.CREATED_WITH_LOGIN_SUCCESS(data.data?.fullName || fullName),
          EMPLOYEE_MESSAGES.CREATED_TITLE,
        );
      } else {
        toast.success(
          EMPLOYEE_MESSAGES.CREATED_SUCCESS(data.data?.fullName || fullName),
          EMPLOYEE_MESSAGES.CREATED_TITLE,
        );
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to create employee';
      setFormError(msg);
      toast.error(msg, EMPLOYEE_MESSAGES.SAVE_ERROR_TITLE);
    },
  });

  const provisionMutation = useMutation({
    mutationFn: async ({ id, pwd }: { id: string; pwd: string }) => {
      const res = await api.post(`/employees/${id}/provision-login`, { password: pwd });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employeesList'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      const empName = provisionEmp?.fullName || 'Employee';
      setProvisionEmp(null);
      setProvisionPassword('');
      setProvisionError(null);
      toast.success(EMPLOYEE_MESSAGES.PROVISION_LOGIN_SUCCESS(empName), EMPLOYEE_MESSAGES.PROVISION_LOGIN_TITLE);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to provision login credentials';
      setProvisionError(msg);
      toast.error(msg, EMPLOYEE_MESSAGES.SAVE_ERROR_TITLE);
    },
  });

  const resetForm = () => {
    setEmployeeId('');
    setFullName('');
    setEmail('');
    setPhone('');
    setDepartmentId('');
    setDesignation('');
    setSelectedOrgId('');
    setCreateLogin(false);
    setPassword('');
    setErrors({});
    setFormError(null);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!employeeId.trim()) errs.employeeId = EMPLOYEE_MESSAGES.ID_REQUIRED;
    if (!fullName.trim()) errs.fullName = EMPLOYEE_MESSAGES.NAME_REQUIRED;
    if (!email.trim()) {
      errs.email = EMPLOYEE_MESSAGES.EMAIL_REQUIRED;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = EMPLOYEE_MESSAGES.EMAIL_INVALID;
    }
    if (!departmentId) errs.departmentId = EMPLOYEE_MESSAGES.DEPARTMENT_REQUIRED;
    if (!designation.trim()) errs.designation = EMPLOYEE_MESSAGES.DESIGNATION_REQUIRED;

    if (currentUser?.role === 'SUPER_ADMIN' && !selectedOrgId) {
      errs.organizationId = 'Please select an organization.';
    }

    if (createLogin) {
      if (!password.trim()) {
        errs.password = EMPLOYEE_MESSAGES.PASSWORD_REQUIRED;
      } else if (password.trim().length < 6) {
        errs.password = EMPLOYEE_MESSAGES.PASSWORD_MIN_LENGTH;
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    createMutation.mutate({
      employeeId: employeeId.trim().toUpperCase(),
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || undefined,
      departmentId,
      designation: designation.trim(),
      organizationId: currentUser?.role === 'SUPER_ADMIN' ? selectedOrgId : undefined,
      createLogin,
      password: createLogin ? password.trim() : undefined,
    });
  };

  const handleProvisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProvisionError(null);
    if (!provisionPassword.trim() || provisionPassword.trim().length < 6) {
      setProvisionError(EMPLOYEE_MESSAGES.PASSWORD_MIN_LENGTH);
      return;
    }
    if (!provisionEmp) return;

    provisionMutation.mutate({
      id: provisionEmp._id,
      pwd: provisionPassword.trim(),
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Employee Directory
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Registered organization staff and personnel authorized to host visitors.
          </p>
        </div>
        <Button size="sm" variant="primary" onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          <span>New Employee</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 w-full">
        <div className="relative w-full sm:max-w-sm">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID or email..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-surface rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Employees Table */}
      <Card className="p-0 overflow-hidden w-full min-w-0">
        <div className="overflow-x-auto w-full min-w-0">
          <table className="w-full text-left text-xs whitespace-nowrap min-w-[700px]">
            <thead className="bg-gray-50/80 text-muted uppercase tracking-wider border-b border-border text-[11px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Employee ID</th>
                <th className="py-3 px-4 font-semibold">Full Name</th>
                <th className="py-3 px-4 font-semibold">Contact Email & Phone</th>
                <th className="py-3 px-4 font-semibold">Department</th>
                <th className="py-3 px-4 font-semibold">Designation</th>
                <th className="py-3 px-4 font-semibold">Login Access</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <TableSkeleton rows={5} cols={7} />
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted">
                    No employees found. Click "New Employee" to add one.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-primary">
                      {emp.employeeId}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-foreground">{emp.fullName}</span>
                    </td>
                    <td className="py-3 px-4 space-y-0.5">
                      <p className="text-foreground">{emp.email}</p>
                      {emp.phone && <p className="text-[10px] text-muted">{emp.phone}</p>}
                    </td>
                    <td className="py-3 px-4 text-muted">
                      {emp.departmentId?.name || 'General'}
                    </td>
                    <td className="py-3 px-4 text-muted">
                      {emp.designation}
                    </td>
                    <td className="py-3 px-4">
                      {emp.userId ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Active Login
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setProvisionEmp(emp);
                              setProvisionPassword('');
                              setProvisionError(null);
                            }}
                            className="text-[10px] text-muted hover:text-primary underline font-medium"
                          >
                            Reset
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <ShieldAlert className="w-3 h-3 text-amber-600" />
                            No Login
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-[10px] px-2"
                            onClick={() => {
                              setProvisionEmp(emp);
                              setProvisionPassword('');
                              setProvisionError(null);
                            }}
                          >
                            <KeyRound className="w-3 h-3 mr-1 text-primary" />
                            <span>Create Login</span>
                          </Button>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={emp.status}>{emp.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Employee Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          resetForm();
        }}
        title="Add New Employee"
        description="Register a staff member who can host visitor appointments."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4" noValidate>
          {formError && (
            <div className="p-3 rounded-lg bg-red-50 text-danger text-xs flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {currentUser?.role === 'SUPER_ADMIN' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Organization *</label>
              <select
                value={selectedOrgId}
                onChange={(e) => {
                  setSelectedOrgId(e.target.value);
                  if (errors.organizationId) setErrors((prev) => ({ ...prev, organizationId: '' }));
                }}
                className={`w-full text-xs p-2.5 rounded-lg border bg-white focus:outline-none ${
                  errors.organizationId
                    ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger'
                    : 'border-border focus:ring-1 focus:ring-primary'
                }`}
                required
              >
                <option value="">-- Select Organization --</option>
                {orgsData.map((org) => (
                  <option key={org._id} value={org._id}>
                    {org.name} ({org.slug})
                  </option>
                ))}
              </select>
              {errors.organizationId && (
                <p className="text-xs text-danger font-medium mt-1">{errors.organizationId}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Employee ID *"
              value={employeeId}
              error={errors.employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value);
                if (errors.employeeId) setErrors((prev) => ({ ...prev, employeeId: '' }));
              }}
              placeholder="e.g. EMP-101"
              required
            />
            <Input
              label="Full Name *"
              value={fullName}
              error={errors.fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
              }}
              placeholder="e.g. Dwight Schrute"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Work Email *"
              type="email"
              value={email}
              error={errors.email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
              placeholder="dwight@acmecorp.com"
              required
            />
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1-555-0144"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Department *</label>
              <select
                value={departmentId}
                onChange={(e) => {
                  setDepartmentId(e.target.value);
                  if (errors.departmentId) setErrors((prev) => ({ ...prev, departmentId: '' }));
                }}
                className={`w-full text-xs p-2.5 rounded-lg border bg-white focus:outline-none ${
                  errors.departmentId
                    ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger'
                    : 'border-border focus:ring-1 focus:ring-primary'
                }`}
                required
              >
                <option value="">-- Choose department --</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.departmentId && (
                <p className="text-xs text-danger font-medium mt-1">{errors.departmentId}</p>
              )}
            </div>
            <Input
              label="Designation / Title *"
              value={designation}
              error={errors.designation}
              onChange={(e) => {
                setDesignation(e.target.value);
                if (errors.designation) setErrors((prev) => ({ ...prev, designation: '' }));
              }}
              placeholder="e.g. Lead Security Officer"
              required
            />
          </div>

          {/* Login Account Provisioning Option */}
          <div className="p-3.5 rounded-xl border border-border/80 bg-slate-50/50 space-y-3">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={createLogin}
                onChange={(e) => setCreateLogin(e.target.checked)}
                className="mt-0.5 rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <div>
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-primary" />
                  Enable Login Account for this Employee
                </span>
                <p className="text-[11px] text-muted mt-0.5">
                  Creates an authenticated User account (Role: EMPLOYEE) so they can log in to view and approve visits.
                </p>
              </div>
            </label>

            {createLogin && (
              <div className="pt-2 border-t border-border/60">
                <Input
                  label="Initial Password *"
                  type="password"
                  value={password}
                  error={errors.password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>
            )}
          </div>

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
              Create Employee
            </Button>
          </div>
        </form>
      </Modal>

      {/* Provision / Reset Login Modal for existing employee */}
      <Modal
        isOpen={!!provisionEmp}
        onClose={() => {
          setProvisionEmp(null);
          setProvisionPassword('');
          setProvisionError(null);
        }}
        title={provisionEmp?.userId ? 'Reset Employee Login' : 'Create Login Account'}
        description={`Set login credentials for ${provisionEmp?.fullName || 'employee'}.`}
        maxWidth="md"
      >
        <form onSubmit={handleProvisionSubmit} className="space-y-4" noValidate>
          {provisionError && (
            <div className="p-3 rounded-lg bg-red-50 text-danger text-xs flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{provisionError}</span>
            </div>
          )}

          <div className="p-3 rounded-lg bg-slate-50 border border-border text-xs space-y-1">
            <p className="text-foreground font-semibold">{provisionEmp?.fullName}</p>
            <p className="text-muted">{provisionEmp?.email}</p>
            <p className="text-[11px] text-primary font-medium">Assigned Role: EMPLOYEE</p>
          </div>

          <Input
            label="Password *"
            type="password"
            value={provisionPassword}
            onChange={(e) => setProvisionPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            required
          />

          <p className="text-[11px] text-muted">
            The employee will sign in at <span className="font-semibold">/login</span> using their email and this password.
          </p>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setProvisionEmp(null);
                setProvisionPassword('');
                setProvisionError(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={provisionMutation.isPending}>
              {provisionEmp?.userId ? 'Update Password' : 'Save & Enable Login'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
