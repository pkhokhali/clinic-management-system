export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  address?: Address;
  specialization?: string;
  licenseNumber?: string;
  bloodGroup?: BloodGroup;
  emergencyContact?: EmergencyContact;
  isActive: boolean;
  isEmailVerified: boolean;
}

export type UserRole = 
  | 'Super Admin'
  | 'Admin'
  | 'Receptionist'
  | 'Doctor'
  | 'Lab Technician'
  | 'Patient';

export type BloodGroup = 
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'AB+'
  | 'AB-'
  | 'O+'
  | 'O-';

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role?: UserRole;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  address?: Address;
  specialization?: string;
  licenseNumber?: string;
  bloodGroup?: BloodGroup;
  emergencyContact?: EmergencyContact;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Array<{ msg: string; param: string }>;
}
