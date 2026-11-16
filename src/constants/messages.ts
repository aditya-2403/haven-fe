export const AUTH_MESSAGES = {
  EMAIL_REQUIRED: 'Email address is required.',
  EMAIL_INVALID: 'Please enter a valid email address.',
  PASSWORD_REQUIRED: 'Password is required.',
  PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters.',
  WELCOME_BACK: (name: string) => `Welcome back, ${name}!`,
  SIGNED_IN_TITLE: 'Signed In',
  AUTH_FAILED_FALLBACK: 'Invalid email or password',
  AUTH_FAILED_TITLE: 'Authentication Failed',
  LOGGED_OUT_TOAST: 'You have been logged out.',
  LOGOUT_CONFIRM_TITLE: 'Are you sure you want to log out?',
  LOGOUT_CONFIRM_MSG: 'You will need to re-authenticate with your email and password to access Haven.',
  LOGOUT_CONFIRM_BUTTON: 'Sign Out',
} as const;

export const APPOINTMENT_MESSAGES = {
  VISITOR_REQUIRED: 'Please select a visitor.',
  HOST_REQUIRED: 'Please designate a host employee.',
  DATE_REQUIRED: 'Scheduled date is required.',
  DATE_PAST_ERROR: 'Scheduled date cannot be in the past.',
  TIME_REQUIRED: 'Scheduled arrival time is required.',
  PURPOSE_REQUIRED: 'Purpose of visit is required.',
  PURPOSE_MIN_LENGTH: 'Purpose must be at least 3 characters.',
  CREATED_SUCCESS: 'Appointment scheduled and pass token generated.',
  CREATED_TITLE: 'Appointment Booked',
  CREATION_FAILED_TITLE: 'Creation Failed',
  CANCELLED_SUCCESS: 'Appointment cancelled and pass revoked.',
  CANCELLED_TITLE: 'Visit Cancelled',
  CANCEL_ERROR_TITLE: 'Cancel Error',
  CANCEL_CONFIRM_TITLE: 'Cancel this scheduled appointment?',
  CANCEL_CONFIRM_MSG: 'This will revoke the visitor QR pass and mark the appointment as cancelled. This action cannot be undone.',
  CANCEL_CONFIRM_BUTTON: 'Cancel Visit',
  PRINT_INFO: 'Opening print view for visitor badge...',
  PRINT_TITLE: 'Print',
  PASS_NOT_AVAILABLE: 'Pass not available',
  PASS_ERROR_TITLE: 'Pass Error',
} as const;

export const APPROVAL_MESSAGES = {
  APPROVED_SUCCESS: (code: string) => `Visitor pass approved! Pass code: ${code}`,
  APPROVED_TITLE: 'Visit Approved',
  APPROVAL_ERROR_TITLE: 'Approval Error',
  REJECTED_SUCCESS: 'The visitor visit request was rejected.',
  REJECTED_TITLE: 'Request Rejected',
  REJECTION_ERROR_TITLE: 'Rejection Error',
  REJECTION_REASON_REQUIRED: 'Please enter a reason for rejecting this visit request.',
  APPROVE_CONFIRM_TITLE: 'Approve visitor access?',
  APPROVE_CONFIRM_MSG: (name: string) => `Approve visitor access for ${name}? A valid QR pass and check-in barcode will be generated immediately.`,
  APPROVE_CONFIRM_BUTTON: 'Approve & Issue Pass',
  REJECT_CONFIRM_TITLE: 'Reject visit request?',
  REJECT_CONFIRM_MSG: (name: string) => `Reject visit request for ${name}? The host and visitor will be notified of the decision.`,
  REJECT_CONFIRM_BUTTON: 'Reject Request',
} as const;

export const CHECK_IN_MESSAGES = {
  SCAN_CODE_REQUIRED: 'Please enter a pass code or QR token to verify.',
  VERIFIED_SUCCESS: (name: string, company?: string) => `Pass verified for ${name}${company ? ` (${company})` : ''}.`,
  VERIFIED_TITLE: 'Pass Verified',
  VERIFICATION_FAILED_TITLE: 'Verification Failed',
  CHECK_IN_SUCCESS: (name: string) => `${name} is now checked in on-premise.`,
  CHECK_IN_TITLE: 'Visitor Checked In',
  CHECK_IN_ERROR_TITLE: 'Check-in Error',
  CHECK_OUT_SUCCESS: (name: string) => `${name} has been checked out successfully.`,
  CHECK_OUT_TITLE: 'Visitor Checked Out',
  CHECK_OUT_ERROR_TITLE: 'Check-out Error',
  CHECK_OUT_CONFIRM_TITLE: 'Check out visitor?',
  CHECK_OUT_CONFIRM_MSG: (name: string) => `Confirm check-out for ${name}. This will conclude their access badge session on premise.`,
  CHECK_OUT_CONFIRM_BUTTON: 'Check Out',
} as const;

export const EMPLOYEE_MESSAGES = {
  ID_REQUIRED: 'Employee ID is required.',
  NAME_REQUIRED: 'Full name is required.',
  EMAIL_REQUIRED: 'Work email is required.',
  EMAIL_INVALID: 'Enter a valid email address.',
  DEPARTMENT_REQUIRED: 'Please select a department.',
  DESIGNATION_REQUIRED: 'Designation / job title is required.',
  PASSWORD_REQUIRED: 'Password is required when login account is enabled.',
  PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters.',
  CREATED_SUCCESS: (name: string) => `Employee ${name} added successfully.`,
  CREATED_TITLE: 'Employee Created',
  CREATED_WITH_LOGIN_SUCCESS: (name: string) => `Employee ${name} and login account created successfully.`,
  PROVISION_LOGIN_SUCCESS: (name: string) => `Login account created for ${name}. They can now log in at /login.`,
  PROVISION_LOGIN_TITLE: 'Login Account Provisioned',
  UPDATED_SUCCESS: (name: string) => `Employee ${name} updated successfully.`,
  UPDATED_TITLE: 'Employee Updated',
  SAVE_ERROR_TITLE: 'Save Error',
} as const;

export const DEPARTMENT_MESSAGES = {
  NAME_REQUIRED: 'Department name is required.',
  CREATED_SUCCESS: (name: string) => `Department "${name}" created successfully.`,
  CREATED_TITLE: 'Department Created',
  UPDATED_SUCCESS: (name: string) => `Department "${name}" updated successfully.`,
  UPDATED_TITLE: 'Department Updated',
  SAVE_ERROR_TITLE: 'Save Error',
} as const;

export const BUILDING_MESSAGES = {
  NAME_REQUIRED: 'Building name is required.',
  CODE_REQUIRED: 'Location code is required (e.g. BLD-A).',
  CREATED_SUCCESS: (name: string) => `Facility "${name}" created successfully.`,
  CREATED_TITLE: 'Facility Registered',
  UPDATED_SUCCESS: (name: string) => `Facility "${name}" updated successfully.`,
  UPDATED_TITLE: 'Facility Updated',
  SAVE_ERROR_TITLE: 'Save Error',
} as const;

export const ORGANIZATION_MESSAGES = {
  NAME_REQUIRED: 'Organization name is required.',
  SLUG_REQUIRED: 'Slug is required.',
  EMAIL_REQUIRED: 'Contact email is required.',
  PHONE_REQUIRED: 'Phone number is required.',
  ADMIN_NAME_REQUIRED: 'Administrator first name is required.',
  ADMIN_EMAIL_REQUIRED: 'Administrator email is required.',
  ADMIN_PASSWORD_REQUIRED: 'Admin password must be at least 8 characters.',
  CREATED_SUCCESS: (name: string) => `Organization "${name}" and initial administrator account created.`,
  CREATED_TITLE: 'Organization Provisioned',
  CREATION_FAILED_TITLE: 'Creation Failed',
  STATUS_UPDATED_SUCCESS: (name: string, status: string) => `Organization "${name}" is now ${status.toLowerCase()}.`,
  STATUS_UPDATED_TITLE: 'Status Updated',
  STATUS_ERROR_TITLE: 'Status Error',
  SUSPEND_CONFIRM_TITLE: (name: string) => `Suspend ${name}?`,
  ACTIVATE_CONFIRM_TITLE: (name: string) => `Activate ${name}?`,
  SUSPEND_CONFIRM_MSG: 'Suspending this organization will immediately disable login access for all its users and reception portals.',
  ACTIVATE_CONFIRM_MSG: 'Activating this organization will restore access for all authorized personnel immediately.',
  SUSPEND_CONFIRM_BUTTON: 'Suspend Organization',
  ACTIVATE_CONFIRM_BUTTON: 'Activate Organization',
} as const;

export const USER_MESSAGES = {
  FIRST_NAME_REQUIRED: 'First name is required.',
  LAST_NAME_REQUIRED: 'Last name is required.',
  EMAIL_REQUIRED: 'Email address is required.',
  PASSWORD_REQUIRED: 'Password is required.',
  PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters.',
  CREATED_SUCCESS: (email: string) => `User account for ${email} has been created.`,
  CREATED_TITLE: 'User Provisioned',
  CREATION_FAILED_TITLE: 'Creation Failed',
  PASSWORD_RESET_SUCCESS: 'User password has been updated securely.',
  PASSWORD_RESET_TITLE: 'Password Reset',
  RESET_FAILED_TITLE: 'Reset Failed',
  STATUS_UPDATED_SUCCESS: (email: string, status: string) => `User ${email} is now ${status.toLowerCase()}.`,
  STATUS_ERROR_TITLE: 'Status Error',
  DEACTIVATE_CONFIRM_TITLE: (email: string) => `Deactivate ${email}?`,
  ACTIVATE_CONFIRM_TITLE: (email: string) => `Activate ${email}?`,
  DEACTIVATE_CONFIRM_MSG: 'Deactivating this user will revoke their session and block them from logging in until reactivated.',
  ACTIVATE_CONFIRM_MSG: 'Activating this account will restore login permissions immediately.',
  DEACTIVATE_CONFIRM_BUTTON: 'Deactivate User',
  ACTIVATE_CONFIRM_BUTTON: 'Activate User',
} as const;

export const SETTINGS_MESSAGES = {
  SAVED_SUCCESS: 'Organization clearance policies and configuration updated.',
  SAVED_TITLE: 'Settings Saved',
  SAVE_ERROR_TITLE: 'Save Error',
} as const;

export const VISITOR_MESSAGES = {
  NAME_REQUIRED: 'Full name is required.',
  PHONE_REQUIRED: 'Valid phone number is required (min 7 digits).',
  EMAIL_INVALID: 'Enter a valid email address.',
  SAVED_SUCCESS: (name: string) => `Profile for "${name}" has been saved.`,
  SAVED_TITLE: 'Visitor Registered',
  REGISTRATION_ERROR_TITLE: 'Registration Error',
  PHOTO_UPLOADED: 'Visitor photograph uploaded securely.',
  PHOTO_TITLE: 'Media Stored',
  PHOTO_SIZE_ERROR: 'File size must be under 5MB.',
  UPLOAD_FAILED_TITLE: 'Upload Failed',
} as const;

export const REPORT_MESSAGES = {
  EXPORT_SUCCESS: 'Report exported successfully.',
  EXPORT_FAILED: 'Failed to export CSV report.',
} as const;

export const COMMON_MESSAGES = {
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
  CONFIRM_CANCEL: 'Cancel',
  CONFIRM_PROCEED: 'Confirm',
} as const;

export const MESSAGES = {
  AUTH: AUTH_MESSAGES,
  APPOINTMENT: APPOINTMENT_MESSAGES,
  APPROVAL: APPROVAL_MESSAGES,
  CHECK_IN: CHECK_IN_MESSAGES,
  EMPLOYEE: EMPLOYEE_MESSAGES,
  DEPARTMENT: DEPARTMENT_MESSAGES,
  BUILDING: BUILDING_MESSAGES,
  ORGANIZATION: ORGANIZATION_MESSAGES,
  USER: USER_MESSAGES,
  SETTINGS: SETTINGS_MESSAGES,
  VISITOR: VISITOR_MESSAGES,
  REPORT: REPORT_MESSAGES,
  COMMON: COMMON_MESSAGES,
} as const;
