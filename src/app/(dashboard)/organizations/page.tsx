'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, Search, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { api } from '../../../lib/api';
import { Organization } from '../../../types';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { Modal } from '../../../components/ui/modal';
import { ConfirmationDialog } from '../../../components/ui/confirmation-dialog';
import { TableSkeleton } from '../../../components/ui/loader';
import { toast } from '../../../stores/toast.store';
import { formatDate } from '../../../lib/utils';
import { ORGANIZATION_MESSAGES } from '../../../constants/messages';

export default function OrganizationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Status toggle confirmation dialog state
  const [statusConfirmTarget, setStatusConfirmTarget] = useState<{
    id: string;
    name: string;
    nextStatus: 'ACTIVE' | 'SUSPENDED';
  } | null>(null);

  // Form states & field-level errors
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: orgs = [], isLoading } = useQuery<Organization[]>({
    queryKey: ['organizations', search],
    queryFn: async () => {
      const res = await api.get(`/organizations?search=${encodeURIComponent(search)}`);
      return res.data?.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/organizations', payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['superAdminStats'] });
      setIsCreateOpen(false);
      resetForm();
      toast.success(
        ORGANIZATION_MESSAGES.CREATED_SUCCESS(data.data.organization.name),
        ORGANIZATION_MESSAGES.CREATED_TITLE,
      );
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to create organization';
      setFormError(msg);
      toast.error(msg, ORGANIZATION_MESSAGES.CREATION_FAILED_TITLE);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'ACTIVE' | 'SUSPENDED' }) => {
      await api.patch(`/organizations/${id}`, { status });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['superAdminStats'] });
      toast.success(
        `Organization status changed to ${vars.status.toLowerCase()}.`,
        ORGANIZATION_MESSAGES.STATUS_UPDATED_TITLE,
      );
      setStatusConfirmTarget(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update status', ORGANIZATION_MESSAGES.STATUS_ERROR_TITLE);
      setStatusConfirmTarget(null);
    },
  });

  const resetForm = () => {
    setName('');
    setSlug('');
    setEmail('');
    setPhone('');
    setAddress('');
    setAdminFirstName('');
    setAdminLastName('');
    setAdminEmail('');
    setAdminPassword('');
    setErrors({});
    setFormError(null);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = ORGANIZATION_MESSAGES.NAME_REQUIRED;
    if (!slug.trim()) {
      errs.slug = ORGANIZATION_MESSAGES.SLUG_REQUIRED;
    } else if (!/^[a-z0-9-]+$/.test(slug.trim())) {
      errs.slug = 'Slug may only contain lowercase letters, numbers, and dashes.';
    }

    if (!email.trim()) {
      errs.email = ORGANIZATION_MESSAGES.EMAIL_REQUIRED;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please provide a valid email format.';
    }

    if (!phone.trim()) {
      errs.phone = ORGANIZATION_MESSAGES.PHONE_REQUIRED;
    }

    // If any admin field is touched, validate them all
    if (adminEmail || adminPassword || adminFirstName || adminLastName) {
      if (!adminEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail.trim())) {
        errs.adminEmail = ORGANIZATION_MESSAGES.ADMIN_EMAIL_REQUIRED;
      }
      if (!adminPassword || adminPassword.length < 8) {
        errs.adminPassword = ORGANIZATION_MESSAGES.ADMIN_PASSWORD_REQUIRED;
      }
      if (!adminFirstName.trim()) {
        errs.adminFirstName = ORGANIZATION_MESSAGES.ADMIN_NAME_REQUIRED;
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    const payload: any = {
      name: name.trim(),
      slug: slug.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim() || undefined,
    };

    if (adminEmail && adminPassword) {
      payload.initialAdmin = {
        firstName: adminFirstName.trim() || 'Admin',
        lastName: adminLastName.trim() || 'User',
        email: adminEmail.trim(),
        password: adminPassword,
      };
    }

    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Organizations
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Manage multi-tenant organizations, activation status, and administrative credentials.
          </p>
        </div>
        <Button size="sm" variant="primary" onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          <span>New Organization</span>
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3 w-full">
        <div className="relative w-full sm:max-w-sm">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search organizations by name, slug or email..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-surface rounded-none border border-border focus:outline-none focus:border-foreground"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden w-full min-w-0">
        <div className="overflow-x-auto w-full min-w-0">
          <table className="w-full text-left text-xs whitespace-nowrap min-w-[650px]">
            <thead className="bg-gray-50/80 text-muted uppercase tracking-wider border-b border-border text-[11px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Organization</th>
                <th className="py-3 px-4 font-semibold">Slug</th>
                <th className="py-3 px-4 font-semibold">Contact</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Created</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <TableSkeleton rows={5} cols={6} />
              ) : orgs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted">
                    No organizations found.
                  </td>
                </tr>
              ) : (
                orgs.map((org) => (
                  <tr key={org._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-none bg-black text-white flex items-center justify-center font-bold font-mono text-xs shrink-0">
                          {org.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{org.name}</p>
                          {org.address && <p className="text-[10px] text-muted">{org.address}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-muted">{org.slug}</td>
                    <td className="py-3 px-4">
                      <p className="text-foreground">{org.email}</p>
                      <p className="text-[10px] text-muted">{org.phone}</p>
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={org.status}>{org.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-muted">{formatDate(org.createdAt)}</td>
                    <td className="py-3 px-4 text-right">
                      {org.status === 'ACTIVE' ? (
                        <button
                          type="button"
                          onClick={() =>
                            setStatusConfirmTarget({
                              id: org._id,
                              name: org.name,
                              nextStatus: 'SUSPENDED',
                            })
                          }
                          className="text-xs text-rose-600 hover:text-rose-800 font-medium transition-colors"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setStatusConfirmTarget({
                              id: org._id,
                              name: org.name,
                              nextStatus: 'ACTIVE',
                            })
                          }
                          className="text-xs text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
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

      {/* Confirmation Dialog for Suspension / Activation */}
      <ConfirmationDialog
        isOpen={!!statusConfirmTarget}
        onClose={() => setStatusConfirmTarget(null)}
        onConfirm={() => {
          if (statusConfirmTarget) {
            toggleStatusMutation.mutate({
              id: statusConfirmTarget.id,
              status: statusConfirmTarget.nextStatus,
            });
          }
        }}
        title={
          statusConfirmTarget?.nextStatus === 'SUSPENDED'
            ? ORGANIZATION_MESSAGES.SUSPEND_CONFIRM_TITLE(statusConfirmTarget?.name || 'this organization')
            : ORGANIZATION_MESSAGES.ACTIVATE_CONFIRM_TITLE(statusConfirmTarget?.name || 'this organization')
        }
        message={
          statusConfirmTarget?.nextStatus === 'SUSPENDED'
            ? ORGANIZATION_MESSAGES.SUSPEND_CONFIRM_MSG
            : ORGANIZATION_MESSAGES.ACTIVATE_CONFIRM_MSG
        }
        confirmText={
          statusConfirmTarget?.nextStatus === 'SUSPENDED'
            ? ORGANIZATION_MESSAGES.SUSPEND_CONFIRM_BUTTON
            : ORGANIZATION_MESSAGES.ACTIVATE_CONFIRM_BUTTON
        }
        variant={statusConfirmTarget?.nextStatus === 'SUSPENDED' ? 'danger' : 'primary'}
        isLoading={toggleStatusMutation.isPending}
      />

      {/* Create Organization Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          resetForm();
        }}
        title="Create New Organization"
        description="Provision a new tenant organization and optionally setup its first Organization Administrator."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4" noValidate>
          {formError && (
            <div className="p-3 rounded-none bg-red-50 text-danger text-xs flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Organization Name *"
              value={name}
              error={errors.name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                if (!slug) {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                }
              }}
              placeholder="e.g. Acme Corporation"
              required
            />
            <Input
              label="URL Slug *"
              value={slug}
              error={errors.slug}
              onChange={(e) => {
                setSlug(e.target.value);
                if (errors.slug) setErrors((prev) => ({ ...prev, slug: '' }));
              }}
              placeholder="e.g. acme-corp"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Contact Email *"
              type="email"
              value={email}
              error={errors.email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
              placeholder="admin@acme.com"
              required
            />
            <Input
              label="Phone Number *"
              value={phone}
              error={errors.phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
              }}
              placeholder="+1-555-0100"
              required
            />
          </div>

          <Input
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="100 Innovation Park, Suite 400"
          />

          {/* Initial Org Admin Account Section */}
          <div className="pt-3 border-t border-border space-y-3">
            <p className="text-xs font-semibold text-foreground">
              Initial Organization Administrator (Optional)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Admin First Name"
                value={adminFirstName}
                error={errors.adminFirstName}
                onChange={(e) => {
                  setAdminFirstName(e.target.value);
                  if (errors.adminFirstName) setErrors((prev) => ({ ...prev, adminFirstName: '' }));
                }}
                placeholder="Jane"
              />
              <Input
                label="Admin Last Name"
                value={adminLastName}
                onChange={(e) => setAdminLastName(e.target.value)}
                placeholder="Doe"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Admin Email"
                type="email"
                value={adminEmail}
                error={errors.adminEmail}
                onChange={(e) => {
                  setAdminEmail(e.target.value);
                  if (errors.adminEmail) setErrors((prev) => ({ ...prev, adminEmail: '' }));
                }}
                placeholder="jane.doe@acme.com"
              />
              <Input
                label="Admin Password"
                type="password"
                value={adminPassword}
                error={errors.adminPassword}
                onChange={(e) => {
                  setAdminPassword(e.target.value);
                  if (errors.adminPassword) setErrors((prev) => ({ ...prev, adminPassword: '' }));
                }}
                placeholder="••••••••••••"
              />
            </div>
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
              Create Organization
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
