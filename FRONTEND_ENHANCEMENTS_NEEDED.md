# Frontend Enhancements Needed

## Medical Records Page Updates

### 1. URL Parameter Support
- Read `appointment` parameter from URL
- Pre-fill appointment and patient data when parameter exists
- Auto-open dialog when appointment parameter is present

### 2. Enhanced Form State
- Add lab test selection (array of test IDs)
- Add prescription medications to record form
- Add lab priority and instructions
- Add prescription notes

### 3. Combined Submission
- Use new `/api/medical/records/complete` endpoint
- Submit medical record + lab request + prescription together

### 4. UI Enhancements
- Add Lab Tests section with multi-select
- Add Prescription section with medication management
- Show summary before submission

## Laboratory Page Updates

### 1. Patient View for Lab Technician
- Group lab requests by patient
- Show patient information with tests
- Filter by patient
- Show pending/billed tests

This is a large enhancement. Let me proceed with implementation.

