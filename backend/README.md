# Backend API Documentation

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment file:
   ```bash
   cp env.example.txt .env
   ```

3. Update `.env` with your configuration

4. Run the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `POST /api/auth/forgotpassword` - Request password reset
- `PUT /api/auth/resetpassword/:resettoken` - Reset password
- `PUT /api/auth/updatepassword` - Update password (Protected)

### Users

- `GET /api/users` - Get all users (Admin/Super Admin)
- `GET /api/users/:id` - Get single user (Protected)
- `PUT /api/users/:id` - Update user (Protected)
- `DELETE /api/users/:id` - Deactivate user (Admin/Super Admin)

### Appointments

- `GET /api/appointments` - Get all appointments (Filtered by role)
- `POST /api/appointments` - Create appointment (Protected)
- `GET /api/appointments/:id` - Get single appointment (Protected)
- `PUT /api/appointments/:id` - Update appointment (Protected)
- `PUT /api/appointments/:id/cancel` - Cancel appointment (Protected)
- `GET /api/appointments/availability/:doctorId` - Get doctor availability

### Medical Records

- `GET /api/medical/records` - Get medical records (Filtered by role)
- `POST /api/medical/records` - Create medical record (Doctor/Admin)
- `GET /api/medical/prescriptions` - Get prescriptions (Filtered by role)
- `POST /api/medical/prescriptions` - Create prescription (Doctor/Admin)

### Laboratory Services

#### Lab Tests
- `GET /api/lab/tests` - Get all lab tests
- `POST /api/lab/tests` - Create lab test (Admin/Lab Technician)
- `GET /api/lab/tests/:id` - Get single lab test
- `PUT /api/lab/tests/:id` - Update lab test (Admin/Lab Technician)

#### Lab Requests
- `GET /api/lab/requests` - Get lab requests (Filtered by role)
- `POST /api/lab/requests` - Create lab request (Doctor/Receptionist/Admin)

#### Lab Results
- `GET /api/lab/results` - Get lab results (Filtered by role)
- `POST /api/lab/results` - Create lab result (Lab Technician/Admin)

### Invoices & Payments

- `GET /api/invoices` - Get all invoices (Filtered by role)
- `POST /api/invoices` - Create invoice (Receptionist/Admin)
- `GET /api/invoices/:id` - Get single invoice (Protected)
- `POST /api/invoices/:id/payment` - Add payment to invoice

### Inventory

- `GET /api/inventory/items` - Get inventory items
- `POST /api/inventory/items` - Create inventory item (Admin)
- `PUT /api/inventory/items/:id` - Update inventory item (Admin)
- `GET /api/inventory/suppliers` - Get suppliers
- `POST /api/inventory/suppliers` - Create supplier (Admin)

### Analytics

- `GET /api/analytics/dashboard` - Get dashboard statistics (Admin)
- `GET /api/analytics/revenue` - Get revenue report (Admin)

### Health Check

- `GET /api/health` - Server health check

## Models

### User

- firstName: String (required)
- lastName: String (required)
- email: String (required, unique)
- phone: String (required, 10 digits)
- password: String (required, min 6 characters)
- role: Enum ['Super Admin', 'Admin', 'Receptionist', 'Doctor', 'Lab Technician', 'Patient']
- dateOfBirth: Date
- gender: Enum ['Male', 'Female', 'Other']
- address: Object
- specialization: String (for Doctors)
- licenseNumber: String (for Doctors)
- bloodGroup: Enum (for Patients)
- emergencyContact: Object (for Patients)

### Appointment

- patient: ObjectId (required)
- doctor: ObjectId (required)
- appointmentDate: Date (required)
- appointmentTime: String (required)
- status: Enum ['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No Show']
- reason: String
- notes: String
- duration: Number (in minutes)

### Medical Record

- patient: ObjectId (required)
- doctor: ObjectId (required)
- appointment: ObjectId
- date: Date
- chiefComplaint: String
- historyOfPresentIllness: String
- physicalExamination: String
- diagnosis: [String]
- treatment: String
- followUp: Object
- attachments: [Object]

### Prescription

- patient: ObjectId (required)
- doctor: ObjectId (required)
- appointment: ObjectId
- medicalRecord: ObjectId
- medications: [Object] (required)
- date: Date
- notes: String
- status: Enum ['Active', 'Completed', 'Cancelled']

### Lab Test

- name: String (required, unique)
- category: String (required)
- description: String
- parameters: [Object]
- cost: Number (required)
- preparation: String
- duration: Number (in hours)
- isActive: Boolean

### Lab Request

- patient: ObjectId (required)
- doctor: ObjectId (required)
- appointment: ObjectId
- tests: [Object] (required)
- orderDate: Date
- requestedBy: ObjectId (required)
- status: Enum ['Pending', 'Sample Collected', 'In Progress', 'Completed', 'Cancelled']
- priority: Enum ['Routine', 'Urgent', 'Stat']

### Lab Result

- labRequest: ObjectId (required)
- test: ObjectId (required)
- patient: ObjectId (required)
- doctor: ObjectId (required)
- technician: ObjectId
- sampleCollectionDate: Date
- resultDate: Date
- resultValues: [Object]
- status: Enum ['Pending', 'In Progress', 'Completed', 'Verified', 'Cancelled']
- comments: String
- verifiedBy: ObjectId
- verifiedAt: Date
- attachments: [Object]

### Invoice

- invoiceNumber: String (required, unique)
- patient: ObjectId (required)
- appointment: ObjectId
- items: [Object] (required)
- subtotal: Number (required)
- discount: Number
- tax: Number
- total: Number (required)
- payments: [Object]
- status: Enum ['Draft', 'Pending', 'Partially Paid', 'Paid', 'Cancelled', 'Refunded']
- dueDate: Date
- notes: String
- createdBy: ObjectId
- invoiceDate: Date

### Inventory

- itemName: String (required)
- category: Enum ['Medicine', 'Lab Supplies', 'Equipment', 'Other']
- description: String
- sku: String (unique)
- barcode: String (unique)
- unit: Enum ['Piece', 'Box', 'Bottle', 'Pack', 'Unit', 'Other']
- quantity: Number (required)
- reorderLevel: Number
- unitCost: Number (required)
- sellingPrice: Number
- expiryDate: Date
- supplier: ObjectId
- location: String
- batchNumber: String
- isActive: Boolean

### Supplier

- name: String (required)
- contactPerson: String
- email: String
- phone: String (required)
- address: Object
- taxId: String
- paymentTerms: String
- notes: String
- isActive: Boolean

## Middleware

### Authentication

- `protect` - Requires valid JWT token
- `authorize(...roles)` - Requires specific role(s)

## Services

### Email Service

- `sendEmail(options)` - Send generic email
- `sendPasswordResetEmail(user, resetToken)` - Send password reset email
- `sendAppointmentConfirmation(user, appointment)` - Send appointment confirmation
- `sendLabResultNotification(user, labResult)` - Send lab result notification

### SMS Service

- `sendSMS(to, message)` - Send SMS
- `sendAppointmentReminder(phone, appointment)` - Send appointment reminder
- `sendLabResultNotification(phone, labResult)` - Send lab result notification

### Payment Service

- `initiateKhaltiPayment(amount, purchaseOrderId, purchaseOrderName)` - Initiate Khalti payment
- `verifyKhaltiPayment(pidx)` - Verify Khalti payment
- `initiateEsewaPayment(...)` - Initiate eSewa payment
- `verifyEsewaPayment(data)` - Verify eSewa payment
- `initiateFonepayPayment(...)` - Initiate Fonepay payment
- `generateFonepaySignature(data)` - Generate Fonepay signature

## Error Handling

All errors are returned in the following format:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (only in development)"
}
```

## Success Response

All successful responses are returned in the following format:

```json
{
  "success": true,
  "message": "Optional message",
  "data": {
    // Response data
  }
}
```