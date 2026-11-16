'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FolderTree, Plus, AlertCircle, Building2, User } from 'lucide-react';
import { api } from '../../../lib/api';
import { Department, Employee } from '../../../types';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { Modal } from '../../../components/ui/modal';
import { toast } from '../../../stores/toast.store';
import { DEPARTMENT_MESSAGES } from '../../../constants/messages';

export default function DepartmentsPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states & validation errors
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [headEmployeeId, setHeadEmployeeId] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  const { data: departments = [], isLoading } = useQuery<Department[]>({
    queryKey: ['departments'],
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
      const res = await api.post('/departments', payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setIsCreateOpen(false);
      resetForm();
      toast.success(DEPARTMENT_MESSAGES.CREATED_SUCCESS(data.data.name), DEPARTMENT_MESSAGES.CREATED_TITLE);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to create department';
      setFormError(msg);
      toast.error(msg, DEPARTMENT_MESSAGES.SAVE_ERROR_TITLE);
    },
  });

  const resetForm = () => {
    setName('');
    setDescription('');
    setHeadEmployeeId('');
    setNameError(null);
    setFormError(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setNameError(DEPARTMENT_MESSAGES.NAME_REQUIRED);
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      headEmployeeId: headEmployeeId || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Departments
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Organizational units, cost centers, and department leaders.
          </p>
        </div>
        <Button size="sm" variant="primary" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4" />
          <span>New Department</span>
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-muted uppercase tracking-wider border-b border-border">
              <tr>
                <th className="py-3 px-4 font-semibold">Department Name</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold">Department Head</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted">
                    Loading departments...
                  </td>
                </tr>
              ) : departments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted">
                    No departments created yet.
                  </td>
                </tr>
              ) : (
                departments.map((dept) => (
                  <tr key={dept._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-foreground">
                      {dept.name}
                    </td>
                    <td className="py-3 px-4 text-muted">
                      {dept.description || '—'}
                    </td>
                    <td className="py-3 px-4 text-muted">
                      {dept.headEmployeeId ? (
                        <div>
                          <p className="font-medium text-foreground">{dept.headEmployeeId.fullName}</p>
                          <p className="text-[10px]">{dept.headEmployeeId.designation}</p>
                        </div>
                      ) : (
                        'Not assigned'
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={dept.status}>{dept.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Department Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          resetForm();
        }}
        title="Create Department"
        description="Add a new functional department to the organization."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4" noValidate>
          {formError && (
            <div className="p-3 rounded-lg bg-red-50 text-danger text-xs flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Department Name *"
            value={name}
            error={nameError || undefined}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError(null);
            }}
            placeholder="e.g. Legal & Compliance"
            required
          />

          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Oversees legal policy, contracts, and visitor compliance."
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Department Head (Optional)</label>
            <select
              value={headEmployeeId}
              onChange={(e) => setHeadEmployeeId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">-- None / Select later --</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.fullName} ({emp.designation})
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
              Create Department
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
