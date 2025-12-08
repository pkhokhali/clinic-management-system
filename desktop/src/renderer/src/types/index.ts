export interface User {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'Super Admin' | 'Admin' | 'Doctor' | 'Patient' | 'Receptionist' | 'Lab Technician';
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  bloodGroup?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  isActive?: boolean;
}

export interface Appointment {
  _id?: string;
  id?: string;
  patient: string | User;
  doctor: string | User;
  appointmentDate: string | Date;
  appointmentTime: string;
  status: 'Scheduled' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show';
  reason?: string;
  notes?: string;
}

export interface MedicalRecord {
  _id?: string;
  id?: string;
  patient: string | User;
  doctor: string | User;
  appointment?: string | Appointment;
  date: string | Date;
  chiefComplaint?: string;
  diagnosis?: string[];
  treatment?: string;
  followUp?: {
    date?: string | Date;
    notes?: string;
  };
}

export interface LabRequest {
  _id?: string;
  id?: string;
  patient: string | User;
  doctor: string | User;
  tests: Array<{
    test: string | LabTest;
    notes?: string;
  }>;
  orderDate: string | Date;
  status: 'Pending' | 'Sample Collected' | 'In Progress' | 'Completed' | 'Cancelled';
  priority: 'Routine' | 'Urgent' | 'Stat';
}

export interface LabTest {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  cost: number;
  description?: string;
}

export interface Invoice {
  _id?: string;
  id?: string;
  invoiceNumber: string;
  patient: string | User;
  invoiceDate: string | Date;
  items: Array<{
    itemType: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'Pending' | 'Partially Paid' | 'Paid' | 'Cancelled';
  payments?: Array<{
    amount: number;
    method: string;
    date: string | Date;
    status: 'Pending' | 'Completed' | 'Failed';
  }>;
}

