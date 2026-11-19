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
import { Label } from '../../../components/ui/label';
import { Combobox } from '../../../components/ui/combobox';
import { TableSkeleton } from '../../../components/ui/loader';
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
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Departments
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Organizational units, cost centers, and department leaders.
          </p>
        </div>
        <Button size="sm" variant="primary" onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          <span>New Department</span>
        </Button>
      </div>

      <Card className="p-0 overflow-hidden w-full min-w-0">
        <div className="overflow-x-auto w-full min-w-0">
          <table className="w-full text-left text-xs whitespace-nowrap min-w-[500px]">
            <thead className="bg-gray-50/80 text-muted uppercase tracking-wider border-b border-border text-[11px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Department Name</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold">Department Head</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <TableSkeleton rows={4} cols={4} />
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
            <div className="p-3 rounded-none bg-red-50 text-danger text-xs flex items-center gap-2 border border-red-200">
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
            <Label>Department Head (Optional)</Label>
            <Combobox
              options={employees.map((emp) => ({
                value: emp._id,
                label: emp.fullName,
                sublabel: `${emp.designation || 'Staff'} • ${emp.employeeId}`,
                badge: emp.employeeId,
              }))}
              value={headEmployeeId}
              onChange={(val) => setHeadEmployeeId(val)}
              placeholder="Search or choose department head..."
              searchPlaceholder="Search employee name, ID, or title..."
              emptyText="No employees found."
            />
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
