export type Role = 'SUPER_ADMIN' | 'ORG_ADMIN' | 'RECEPTIONIST' | 'SECURITY' | 'EMPLOYEE';

export type VisitStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT';

export type VisitType = 'APPOINTMENT' | 'WALK_IN';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  organizationId?: string | null;
  organizationName?: string | null;
  departmentId?: string | null;
  employeeId?: string | null;
  phone?: string;
  status?: string;
  avatarFileId?: string;
}

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  address?: string;
  logo?: string;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  _id: string;
  organizationId: string;
  name: string;
  description?: string;
  headEmployeeId?: {
    _id: string;
    fullName: string;
    email: string;
    designation: string;
  } | null;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Building {
  _id: string;
  organizationId: string;
  name: string;
  locationCode: string;
  address?: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Employee {
  _id: string;
  organizationId: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone?: string;
  departmentId?: {
    _id: string;
    name: string;
  };
  designation: string;
  userId?: {
    _id: string;
    email: string;
    role: Role;
  } | null;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Visitor {
  _id: string;
  organizationId: string;
  fullName: string;
  phone: string;
  email?: string;
  company?: string;
  photoFileId?: string;
  identificationType?: string;
  identificationNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface Visit {
  _id: string;
  organizationId: string;
  visitorId: Visitor;
  hostId: Employee;
  departmentId?: { _id: string; name: string };
  buildingId?: { _id: string; name: string; locationCode: string };
  visitType: VisitType;
  purpose: string;
  scheduledDate: string;
  scheduledTime: string;
  expectedDurationMinutes: number;
  status: VisitStatus;
  passCode?: string;
  qrTokenHash?: string;
  qrPassExpiresAt?: string;
  checkInAt?: string;
  checkInBy?: { firstName: string; lastName: string; email: string };
  checkOutAt?: string;
  checkOutBy?: { firstName: string; lastName: string; email: string };
  notes?: string;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

export interface OrganizationSettings {
  organizationId: string;
  requireApprovalByDefault: boolean;
  defaultVisitDurationMinutes: number;
  allowWalkIns: boolean;
  notifyHostOnArrival: boolean;
  timezone: string;
  passExpiryHours: number;
}

