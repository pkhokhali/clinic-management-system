// Configuration for mandatory fields per role
export interface MandatoryFieldsConfig {
  [role: string]: {
    [field: string]: boolean; // true = mandatory, false = optional
  };
}

// Default mandatory fields configuration
const DEFAULT_MANDATORY_FIELDS: MandatoryFieldsConfig = {
  'Super Admin': {
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    password: true,
    role: true,
  },
  'Admin': {
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    password: true,
    role: true,
  },
  'Doctor': {
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    password: true,
    role: true,
    dateOfBirth: true,
    gender: true,
    specialization: true,
    licenseNumber: true,
  },
  'Receptionist': {
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    password: true,
    role: true,
  },
  'Lab Technician': {
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    password: true,
    role: true,
  },
  'Patient': {
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    password: true,
    role: true,
    dateOfBirth: true,
    gender: true,
    bloodGroup: true,
  },
};

// All possible fields across all roles
export const ALL_FIELDS = [
  { key: 'firstName', label: 'First Name', roles: ['all'] },
  { key: 'lastName', label: 'Last Name', roles: ['all'] },
  { key: 'email', label: 'Email', roles: ['all'] },
  { key: 'phone', label: 'Phone', roles: ['all'] },
  { key: 'password', label: 'Password', roles: ['all'] },
  { key: 'role', label: 'Role', roles: ['all'] },
  { key: 'dateOfBirth', label: 'Date of Birth', roles: ['Doctor', 'Patient'] },
  { key: 'gender', label: 'Gender', roles: ['Doctor', 'Patient'] },
  { key: 'specialization', label: 'Specialization', roles: ['Doctor'] },
  { key: 'licenseNumber', label: 'License Number', roles: ['Doctor'] },
  { key: 'bloodGroup', label: 'Blood Group', roles: ['Patient'] },
];

const STORAGE_KEY = 'user_creation_mandatory_fields_config';

// Load configuration from localStorage or return default
export const loadMandatoryFieldsConfig = (): MandatoryFieldsConfig => {
  if (typeof window === 'undefined') return DEFAULT_MANDATORY_FIELDS;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with default to ensure all roles and fields exist
      const merged: MandatoryFieldsConfig = {};
      const roles = Object.keys(DEFAULT_MANDATORY_FIELDS);
      
      roles.forEach((role) => {
        merged[role] = { ...DEFAULT_MANDATORY_FIELDS[role], ...(parsed[role] || {}) };
      });
      
      return merged;
    }
  } catch (error) {
    console.error('Error loading mandatory fields config:', error);
  }
  
  return DEFAULT_MANDATORY_FIELDS;
};

// Save configuration to localStorage
export const saveMandatoryFieldsConfig = (config: MandatoryFieldsConfig): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Error saving mandatory fields config:', error);
  }
};

// Check if a field is mandatory for a role
export const isFieldMandatory = (role: string, field: string, config?: MandatoryFieldsConfig): boolean => {
  const currentConfig = config || loadMandatoryFieldsConfig();
  return currentConfig[role]?.[field] ?? false;
};

// Reset to default configuration
export const resetToDefaultConfig = (): MandatoryFieldsConfig => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  return DEFAULT_MANDATORY_FIELDS;
};

// Get fields relevant to a specific role
export const getFieldsForRole = (role: string): Array<{ key: string; label: string }> => {
  const commonFields = ALL_FIELDS.filter((f) => f.roles.includes('all'));
  const roleSpecificFields = ALL_FIELDS.filter(
    (f) => f.roles.includes(role) && !f.roles.includes('all')
  );
  return [...commonFields, ...roleSpecificFields].map(({ key, label }) => ({ key, label }));
};

