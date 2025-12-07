# 🔧 Fix User Form - Add Role-Specific Required Fields

## ❌ Current Problem

Creating a Doctor user fails with validation error:
```
User validation failed: 
- dateOfBirth: Path `dateOfBirth` is required.
- gender: Path `gender` is required.
- specialization: Path `specialization` is required.
- licenseNumber: Path `licenseNumber` is required.
```

## ✅ Required Fields by Role

### All Roles (Always Required):
- firstName
- lastName
- email
- phone
- password (when creating)
- role
- isActive

### Doctor Role (Additional Required):
- dateOfBirth
- gender (Male, Female, Other)
- specialization
- licenseNumber

### Patient Role (Additional Required):
- dateOfBirth
- gender (Male, Female, Other)
- bloodGroup (A+, A-, B+, B-, AB+, AB-, O+, O-)

### Other Roles (Super Admin, Admin, Receptionist, Lab Technician):
- No additional required fields

## 🔧 Solution

1. Update UserFormData interface (already done)
2. Update form initialization to include all fields
3. Add dynamic form fields that show/hide based on role
4. Update handleSubmit to include all required fields
5. Update handleEdit to populate role-specific fields
6. Update resetForm to reset all fields
7. Add proper validation

## 📝 Implementation

The form needs to:
- Show dateOfBirth and gender when role is Doctor or Patient
- Show specialization and licenseNumber when role is Doctor
- Show bloodGroup when role is Patient
- Send all required fields in API request based on role

