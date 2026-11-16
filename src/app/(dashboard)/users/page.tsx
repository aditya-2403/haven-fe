'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Search, AlertCircle, KeyRound, Shield, CheckCircle2 } from 'lucide-react';
import { api } from '../../../lib/api';
import { User, Role, Department, Employee, Organization } from '../../../types';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { Modal } from '../../../components/ui/modal';
import { ConfirmationDialog } from '../../../components/ui/confirmation-dialog';
import { toast } from '../../../stores/toast.store';
import { useAuthStore } from '../../../stores/auth.store';
import { USER_MESSAGES } from '../../../constants/messages';

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [statusConfirmUser, setStatusConfirmUser] = useState<{
    id: string;
    email: string;
    nextStatus: 'ACTIVE' | 'INACTIVE';
  } | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states & validation errors
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('RECEPTIONIST');
  const [departmentId, setDepartmentId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: orgsData = [] } = useQuery<Organization[]>({
    queryKey: ['organizationsList'],
    queryFn: async () => {
      const res = await api.get('/organizations?limit=100');
      return res.data?.data || [];
    },
    enabled: currentUser?.role === 'SUPER_ADMIN',
  });

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['users', search, roleFilter],
    queryFn: async () => {
      let url = `/users?search=${encodeURIComponent(search)}`;
      if (roleFilter) url += `&role=${roleFilter}`;
      const res = await api.get(url);
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

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['employeesList'],
    queryFn: async () => {
      const res = await api.get('/employees');
      return res.data?.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/users', payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsCreateOpen(false);
      resetForm();
      toast.success(USER_MESSAGES.CREATED_SUCCESS(data.data.email), USER_MESSAGES.CREATED_TITLE);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to create user';
      setFormError(msg);
      toast.error(msg, USER_MESSAGES.CREATION_FAILED_TITLE);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, newPassword }: { id: string; newPassword: string }) => {
      const res = await api.post(`/users/${id}/reset-password`, { newPassword });
      return res.data;
    },
    onSuccess: () => {
      toast.success(USER_MESSAGES.PASSWORD_RESET_SUCCESS, USER_MESSAGES.PASSWORD_RESET_TITLE);
      setResetUser(null);
      setNewPassword('');
      setResetPasswordError(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to reset password';
      setResetPasswordError(msg);
      toast.error(msg, USER_MESSAGES.RESET_FAILED_TITLE);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; email?: string; status: 'ACTIVE' | 'INACTIVE' }) => {
      await api.patch(`/users/${id}`, { status });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(
        USER_MESSAGES.STATUS_UPDATED_SUCCESS(vars.email || 'account', vars.status),
        vars.status === 'ACTIVE' ? 'User Activated' : 'User Deactivated',
      );
      setStatusConfirmUser(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to change status', USER_MESSAGES.STATUS_ERROR_TITLE);
      setStatusConfirmUser(null);
    },
  });

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setRole('RECEPTIONIST');
    setDepartmentId('');
    setEmployeeId('');
    setPhone('');
    setSelectedOrgId('');
    setErrors({});
    setFormError(null);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = USER_MESSAGES.FIRST_NAME_REQUIRED;
    if (!lastName.trim()) errs.lastName = USER_MESSAGES.LAST_NAME_REQUIRED;
    if (!email.trim()) {
      errs.email = USER_MESSAGES.EMAIL_REQUIRED;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please provide a valid email format.';
    }
    if (!password) {
      errs.password = USER_MESSAGES.PASSWORD_REQUIRED;
    } else if (password.length < 6) {
      errs.password = USER_MESSAGES.PASSWORD_MIN_LENGTH;
    }
    if (currentUser?.role === 'SUPER_ADMIN' && role !== 'SUPER_ADMIN' && !selectedOrgId) {
      errs.organizationId = 'Please select an organization.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    createMutation.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      departmentId: departmentId || undefined,
      employeeId: employeeId || undefined,
      phone: phone.trim() || undefined,
      organizationId: currentUser?.role === 'SUPER_ADMIN' ? (selectedOrgId || undefined) : undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            User Accounts & Roles
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Access management, authentication profiles, and role-based permissions.
          </p>
        </div>
        <Button size="sm" variant="primary" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4" />
          <span>New User Account</span>
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-surface rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-xs p-2 rounded-lg border border-border bg-surface text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
        >
          <option value="">All Roles</option>
          {currentUser?.role === 'SUPER_ADMIN' && (
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
          )}
          <option value="ORG_ADMIN">ORG_ADMIN</option>
          <option value="RECEPTIONIST">RECEPTIONIST</option>
          <option value="SECURITY">SECURITY</option>
          <option value="EMPLOYEE">EMPLOYEE</option>
        </select>
      </div>

      {/* Users Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-muted uppercase tracking-wider border-b border-border">
              <tr>
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                {currentUser?.role === 'SUPER_ADMIN' && (
                  <th className="py-3 px-4 font-semibold">Organization</th>
                )}
                <th className="py-3 px-4 font-semibold">Department</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={currentUser?.role === 'SUPER_ADMIN' ? 6 : 5} className="py-8 text-center text-muted">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={currentUser?.role === 'SUPER_ADMIN' ? 6 : 5} className="py-8 text-center text-muted">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id || (u as any)._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#22285B] text-white flex items-center justify-center font-bold text-xs uppercase">
                          {u.firstName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {u.firstName} {u.lastName}
                          </p>
                          <p className="text-[10px] text-muted">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="default">{u.role?.replace('_', ' ')}</Badge>
                    </td>
                    {currentUser?.role === 'SUPER_ADMIN' && (
                      <td className="py-3 px-4 text-muted font-medium">
                        {(u.organizationId as any)?.name || 'Platform (Global)'}
                      </td>
                    )}
                    <td className="py-3 px-4 text-muted">
                      {(u.departmentId as any)?.name || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={u.status || 'ACTIVE'}>{u.status || 'ACTIVE'}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setResetUser(u);
                          setNewPassword('');
                          setResetPasswordError(null);
                        }}
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Reset Pass</span>
                      </Button>
                      {(u.status === 'ACTIVE' || !u.status) ? (
                        <button
                          type="button"
                          onClick={() =>
                            setStatusConfirmUser({
                              id: u.id || (u as any)._id,
                              email: u.email,
                              nextStatus: 'INACTIVE',
                            })
                          }
                          className="text-xs text-rose-600 hover:text-rose-800 font-medium"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setStatusConfirmUser({
                              id: u.id || (u as any)._id,
                              email: u.email,
                              nextStatus: 'ACTIVE',
                            })
                          }
                          className="text-xs text-emerald-600 hover:text-emerald-800 font-medium"
                        >
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Confirmation Dialog for User Deactivation / Activation */}
      <ConfirmationDialog
        isOpen={!!statusConfirmUser}
        onClose={() => setStatusConfirmUser(null)}
        onConfirm={() => {
          if (statusConfirmUser) {
            toggleStatusMutation.mutate({
              id: statusConfirmUser.id,
              email: statusConfirmUser.email,
              status: statusConfirmUser.nextStatus,
            });
          }
        }}
        title={
          statusConfirmUser?.nextStatus === 'INACTIVE'
            ? USER_MESSAGES.DEACTIVATE_CONFIRM_TITLE(statusConfirmUser?.email || 'user')
            : USER_MESSAGES.ACTIVATE_CONFIRM_TITLE(statusConfirmUser?.email || 'user')
        }
        message={
          statusConfirmUser?.nextStatus === 'INACTIVE'
            ? USER_MESSAGES.DEACTIVATE_CONFIRM_MSG
            : USER_MESSAGES.ACTIVATE_CONFIRM_MSG
        }
        confirmText={
          statusConfirmUser?.nextStatus === 'INACTIVE'
            ? USER_MESSAGES.DEACTIVATE_CONFIRM_BUTTON
            : USER_MESSAGES.ACTIVATE_CONFIRM_BUTTON
        }
        variant={statusConfirmUser?.nextStatus === 'INACTIVE' ? 'danger' : 'primary'}
        isLoading={toggleStatusMutation.isPending}
      />

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          resetForm();
        }}
        title="Create User Account"
        description="Add a new authenticated user and assign their access role."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4" noValidate>
          {formError && (
            <div className="p-3 rounded-lg bg-red-50 text-danger text-xs flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="First Name *"
              value={firstName}
              error={errors.firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: '' }));
              }}
              placeholder="e.g. Pam"
              required
            />
            <Input
              label="Last Name *"
              value={lastName}
              error={errors.lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: '' }));
              }}
              placeholder="e.g. Beesly"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email Address *"
              type="email"
              value={email}
              error={errors.email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
              placeholder="pam@acmecorp.com"
              required
            />
            <Input
              label="Password *"
              type="password"
              value={password}
              error={errors.password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
              }}
              placeholder="••••••••••••"
              required
              minLength={6}
            />
          </div>

          {currentUser?.role === 'SUPER_ADMIN' && role !== 'SUPER_ADMIN' && (
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
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Role *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                required
              >
                <option value="RECEPTIONIST">RECEPTIONIST</option>
                <option value="SECURITY">SECURITY</option>
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="ORG_ADMIN">ORG_ADMIN</option>
                {currentUser?.role === 'SUPER_ADMIN' && (
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Department (Optional)</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">-- None / General --</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Link to Employee Record (Optional)</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">-- No employee record link --</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.fullName} ({emp.employeeId} - {emp.designation})
                </option>
              ))}
            </select>
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
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={!!resetUser}
        onClose={() => {
          setResetUser(null);
          setResetPasswordError(null);
        }}
        title={`Reset Password: ${resetUser?.email}`}
        description="Set a new authorized password for this account."
      >
        <div className="space-y-4">
          <Input
            label="New Password *"
            type="password"
            value={newPassword}
            error={resetPasswordError || undefined}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (resetPasswordError) setResetPasswordError(null);
            }}
            placeholder="••••••••••••"
            minLength={6}
            required
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setResetUser(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={resetPasswordMutation.isPending}
              onClick={() => {
                if (!newPassword || newPassword.length < 6) {
                  setResetPasswordError('Password must be at least 6 characters long.');
                  return;
                }
                if (resetUser) {
                  resetPasswordMutation.mutate({
                    id: resetUser.id || (resetUser as any)._id,
                    newPassword,
                  });
                }
              }}
            >
              Save New Password
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
