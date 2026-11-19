'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Search, History, AlertCircle, Phone, Mail, Building, UserCheck, Upload } from 'lucide-react';
import { api } from '../../../lib/api';
import { Visitor, Visit } from '../../../types';
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
import { TableSkeleton } from '../../../components/ui/loader';
import { toast } from '../../../stores/toast.store';
import { formatDate, formatTime } from '../../../lib/utils';
import { VISITOR_MESSAGES } from '../../../constants/messages';

export default function VisitorsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedVisitorForHistory, setSelectedVisitorForHistory] = useState<Visitor | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states & validation errors
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [identificationType, setIdentificationType] = useState('NATIONAL_ID');
  const [identificationNumber, setIdentificationNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery<{ data: Visitor[]; pagination: any }>({
    queryKey: ['visitors', search, page],
    queryFn: async () => {
      const res = await api.get(`/visitors?search=${encodeURIComponent(search)}&page=${page}&limit=15`);
      return res.data;
    },
  });

  const visitors = data?.data || [];
  const pagination = data?.pagination;

  // Visitor history query
  const { data: visitorHistory = [], isLoading: historyLoading } = useQuery<Visit[]>({
    queryKey: ['visitorHistory', selectedVisitorForHistory?._id],
    queryFn: async () => {
      if (!selectedVisitorForHistory?._id) return [];
      const res = await api.get(`/visitors/${selectedVisitorForHistory._id}/history`);
      return res.data?.data || [];
    },
    enabled: !!selectedVisitorForHistory?._id,
  });

  const registerMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/visitors', payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
      setIsRegisterOpen(false);
      resetForm();
      toast.success(VISITOR_MESSAGES.SAVED_SUCCESS(data.data.fullName), VISITOR_MESSAGES.SAVED_TITLE);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to register visitor';
      setFormError(msg);
      toast.error(msg, VISITOR_MESSAGES.REGISTRATION_ERROR_TITLE);
    },
  });

  const resetForm = () => {
    setFullName('');
    setPhone('');
    setEmail('');
    setCompany('');
    setIdentificationType('NATIONAL_ID');
    setIdentificationNumber('');
    setNotes('');
    setPhotoFile(null);
    setErrors({});
    setFormError(null);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = VISITOR_MESSAGES.NAME_REQUIRED;
    if (!phone.trim()) {
      errs.phone = VISITOR_MESSAGES.PHONE_REQUIRED;
    } else if (phone.trim().length < 7) {
      errs.phone = VISITOR_MESSAGES.PHONE_REQUIRED;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = VISITOR_MESSAGES.EMAIL_INVALID;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    let photoFileId: string | undefined = undefined;

    if (photoFile) {
      setUploadingPhoto(true);
      try {
        const formData = new FormData();
        formData.append('file', photoFile);
        const uploadRes = await api.post('/storage/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        photoFileId = uploadRes.data?.data?.fileId;
        toast.info(VISITOR_MESSAGES.PHOTO_UPLOADED, VISITOR_MESSAGES.PHOTO_TITLE);
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to upload visitor photograph';
        setFormError(msg);
        toast.error(msg, VISITOR_MESSAGES.UPLOAD_FAILED_TITLE);
        setUploadingPhoto(false);
        return;
      } finally {
        setUploadingPhoto(false);
      }
    }

    registerMutation.mutate({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      company: company.trim() || undefined,
      identificationType,
      identificationNumber: identificationNumber.trim() || undefined,
      notes: notes.trim() || undefined,
      photoFileId,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Visitor Repository
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Reusable visitor profiles, visit history, identification and compliance credentials.
          </p>
        </div>
        <Button size="sm" variant="primary" onClick={() => setIsRegisterOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          <span>Register Visitor</span>
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by visitor name, phone, email, company..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-surface rounded-none border border-border focus:outline-none focus:border-foreground"
          />
        </div>
      </div>

      {/* Visitors Table */}
      <Card className="p-0 overflow-hidden w-full min-w-0">
        <div className="overflow-x-auto w-full min-w-0">
          <table className="w-full text-left text-xs whitespace-nowrap min-w-[650px]">
            <thead className="bg-gray-50/80 text-muted uppercase tracking-wider border-b border-border">
              <tr>
                <th className="py-3 px-4 font-semibold">Visitor Profile</th>
                <th className="py-3 px-4 font-semibold">Contact Info</th>
                <th className="py-3 px-4 font-semibold">Company / Org</th>
                <th className="py-3 px-4 font-semibold">ID Document</th>
                <th className="py-3 px-4 font-semibold">Registered</th>
                <th className="py-3 px-4 font-semibold text-right">History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <TableSkeleton rows={5} cols={6} />
              ) : visitors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted">
                    No visitor records found.
                  </td>
                </tr>
              ) : (
                visitors.map((visitor) => (
                  <tr key={visitor._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-none bg-black text-white flex items-center justify-center font-bold font-mono text-xs shrink-0 overflow-hidden border border-zinc-800">
                          {visitor.photoFileId ? (
                            <img
                              src={`http://localhost:4000/api/v1/storage/${visitor.photoFileId}`}
                              alt={visitor.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            visitor.fullName.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{visitor.fullName}</p>
                          {visitor.notes && (
                            <p className="text-[10px] text-muted truncate max-w-xs">{visitor.notes}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 space-y-0.5">
                      <p className="text-foreground flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-muted" /> {visitor.phone}
                      </p>
                      {visitor.email && (
                        <p className="text-[10px] text-muted flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-muted" /> {visitor.email}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-foreground">
                        {visitor.company || 'Individual Visitor'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="neutral">
                        {visitor.identificationType?.replace('_', ' ')}
                      </Badge>
                      {visitor.identificationNumber && (
                        <span className="text-[10px] text-muted block font-mono mt-0.5">
                          {visitor.identificationNumber}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted">{formatDate(visitor.createdAt)}</td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedVisitorForHistory(visitor)}
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>Visits</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-3 border-t border-border flex items-center justify-between text-xs text-muted">
            <span>
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Register Visitor Modal */}
      <Modal
        isOpen={isRegisterOpen}
        onClose={() => {
          setIsRegisterOpen(false);
          resetForm();
        }}
        title="Register Visitor Profile"
        description="Create a permanent reusable profile for a visitor."
        maxWidth="lg"
      >
        <form onSubmit={handleRegisterSubmit} className="space-y-4" noValidate>
          {formError && (
            <div className="p-3 rounded-none bg-red-50 text-danger text-xs flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Full Name *"
              value={fullName}
              error={errors.fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
              }}
              placeholder="e.g. Michael Scott"
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
              placeholder="+1-555-0199"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email Address"
              type="email"
              value={email}
              error={errors.email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
              placeholder="mscott@dundermifflin.com"
            />
            <Input
              label="Organization / Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Dunder Mifflin Paper Co."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Identification Type</Label>
              <Select
                value={identificationType}
                onValueChange={(val) => setIdentificationType(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ID type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NATIONAL_ID">National ID / Aadhaar</SelectItem>
                  <SelectItem value="PASSPORT">Passport</SelectItem>
                  <SelectItem value="DRIVING_LICENSE">Driver's License</SelectItem>
                  <SelectItem value="OTHER">Other Government ID</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              label="ID Document Number"
              value={identificationNumber}
              onChange={(e) => setIdentificationNumber(e.target.value)}
              placeholder="ID-98234-A"
            />
          </div>

          {/* Photograph Upload */}
          <div className="space-y-1.5">
            <Label>Visitor Photograph (Optional)</Label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                className="text-xs text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-none file:border file:border-border file:text-xs file:font-mono file:font-semibold file:bg-surface file:text-foreground hover:file:bg-zinc-100"
              />
            </div>
            <p className="text-[10px] text-muted">Supports JPG, PNG or WEBP up to 5MB.</p>
          </div>

          <Input
            label="Internal Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Special clearance required, VIP visitor, etc."
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsRegisterOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={registerMutation.isPending || uploadingPhoto}
            >
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* Visitor History Modal */}
      <Modal
        isOpen={!!selectedVisitorForHistory}
        onClose={() => setSelectedVisitorForHistory(null)}
        title={`Visit History: ${selectedVisitorForHistory?.fullName}`}
        description="All past appointments, check-ins and access records for this visitor."
        maxWidth="xl"
      >
        <div className="space-y-3">
          {historyLoading ? (
            <div className="py-8 text-center text-xs text-muted">Loading visit history...</div>
          ) : visitorHistory.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted">
              No previous visit records found for this visitor.
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto divide-y divide-border">
              {visitorHistory.map((v) => (
                <div key={v._id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-foreground font-mono">
                      Pass: {v.passCode || '—'}
                    </span>
                    <Badge status={v.status}>{v.status}</Badge>
                  </div>
                  <p className="text-xs text-muted">
                    <strong>Host:</strong> {v.hostId?.fullName} ({v.departmentId?.name || 'Department'})
                  </p>
                  <p className="text-xs text-muted">
                    <strong>Purpose:</strong> {v.purpose}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-muted pt-1">
                    <span>Scheduled: {formatDate(v.scheduledDate)} at {v.scheduledTime}</span>
                    {v.checkInAt && <span>In: {formatTime(v.checkInAt)}</span>}
                    {v.checkOutAt && <span>Out: {formatTime(v.checkOutAt)}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
