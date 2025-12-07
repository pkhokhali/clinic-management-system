# 📋 User Form Requirements by Role

## ✅ Required Fields for ALL Roles:
- First Name
- Last Name
- Email
- Phone
- Password (when creating new user)
- Role
- Status (Active/Inactive)

## ✅ Required for Doctor Role:
- dateOfBirth
- gender (Male, Female, Other)
- specialization
- licenseNumber

## ✅ Required for Patient Role:
- dateOfBirth
- gender (Male, Female, Other)
- bloodGroup (A+, A-, B+, B-, AB+, AB-, O+, O-)

## ⚪ Optional for All Roles:
- address (street, city, state, zipCode, country)
- emergencyContact (for patients - name, relationship, phone)

## 🔧 Current Issue:
The form doesn't show role-specific fields, causing validation errors when creating Doctors or Patients.

## ✅ Solution:
Make the form dynamic - show/hide fields based on selected role!

