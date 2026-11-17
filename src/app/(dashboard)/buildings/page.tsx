'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Plus, AlertCircle, Building2 } from 'lucide-react';
import { api } from '../../../lib/api';
import { Building } from '../../../types';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { Modal } from '../../../components/ui/modal';
import { TableSkeleton } from '../../../components/ui/loader';
import { toast } from '../../../stores/toast.store';
import { BUILDING_MESSAGES } from '../../../constants/messages';

export default function BuildingsPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states & validation errors
  const [name, setName] = useState('');
  const [locationCode, setLocationCode] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: buildings = [], isLoading } = useQuery<Building[]>({
    queryKey: ['buildings'],
    queryFn: async () => {
      const res = await api.get('/buildings');
      return res.data?.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/buildings', payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      setIsCreateOpen(false);
      resetForm();
      toast.success(BUILDING_MESSAGES.CREATED_SUCCESS(data.data.name), BUILDING_MESSAGES.CREATED_TITLE);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to create building';
      setFormError(msg);
      toast.error(msg, BUILDING_MESSAGES.SAVE_ERROR_TITLE);
    },
  });

  const resetForm = () => {
    setName('');
    setLocationCode('');
    setAddress('');
    setDescription('');
    setErrors({});
    setFormError(null);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = BUILDING_MESSAGES.NAME_REQUIRED;
    if (!locationCode.trim()) {
      errs.locationCode = BUILDING_MESSAGES.CODE_REQUIRED;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    createMutation.mutate({
      name: name.trim(),
      locationCode: locationCode.trim().toUpperCase(),
      address: address.trim() || undefined,
      description: description.trim() || undefined,
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Buildings & Facilities
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Locations, campus facilities, and physical check-in security checkpoints.
          </p>
        </div>
        <Button size="sm" variant="primary" onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          <span>New Building</span>
        </Button>
      </div>

      <Card className="p-0 overflow-hidden w-full min-w-0">
        <div className="overflow-x-auto w-full min-w-0">
          <table className="w-full text-left text-xs whitespace-nowrap min-w-[600px]">
            <thead className="bg-gray-50/80 text-muted uppercase tracking-wider border-b border-border text-[11px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Location Code</th>
                <th className="py-3 px-4 font-semibold">Facility Name</th>
                <th className="py-3 px-4 font-semibold">Physical Address</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <TableSkeleton rows={4} cols={5} />
              ) : buildings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted">
                    No buildings created yet.
                  </td>
                </tr>
              ) : (
                buildings.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-primary">
                      {b.locationCode}
                    </td>
                    <td className="py-3 px-4 font-semibold text-foreground">
                      {b.name}
                    </td>
                    <td className="py-3 px-4 text-muted">
                      {b.address || '—'}
                    </td>
                    <td className="py-3 px-4 text-muted">
                      {b.description || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={b.status}>{b.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Building Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          resetForm();
        }}
        title="Add Facility / Building"
        description="Register a new building or entrance location for access control."
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
              label="Building Name *"
              value={name}
              error={errors.name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="e.g. West Campus Tower 1"
              required
            />
            <Input
              label="Location Code *"
              value={locationCode}
              error={errors.locationCode}
              onChange={(e) => {
                setLocationCode(e.target.value);
                if (errors.locationCode) setErrors((prev) => ({ ...prev, locationCode: '' }));
              }}
              placeholder="e.g. BLD-W1"
              required
            />
          </div>

          <Input
            label="Street Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="250 West Gate Blvd, Building 1"
          />

          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Main reception and security checkpoint"
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
              Create Building
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
