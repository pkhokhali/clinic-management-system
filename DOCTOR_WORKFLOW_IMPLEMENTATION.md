# Doctor Workflow Implementation Plan

## Overview
This document outlines the implementation plan for the comprehensive doctor workflow system that includes medical records, lab tests, prescriptions, and billing integration.

## Features to Implement

### 1. Doctor's Appointments View ✅
- [x] Create `/dashboard/my-appointments` page for doctors
- [x] Show only doctor's appointments
- [x] Filter and search functionality
- [x] View appointment details
- [x] Action buttons for adding medical records

### 2. Medical Record Enhancements
- [ ] Update MedicalRecord model to link to LabRequest
- [ ] Add support for creating lab requests from medical record form
- [ ] Add prescription creation from medical record form
- [ ] Update visibility controls (doctor, admin, super admin, reception)

### 3. Lab Request Integration
- [ ] Update LabRequest model to track billing status
- [ ] Link LabRequest to Invoice
- [ ] Add notification system for lab technicians
- [ ] Update visibility controls (lab technician, admin, super admin, reception)

### 4. Prescription Integration
- [ ] Allow prescription creation from medical record form
- [ ] Link prescription to medical record

### 5. Billing Integration
- [ ] Reception can bill lab tests
- [ ] After billing, send notification to lab technician
- [ ] Update lab request status based on billing

### 6. Notification System
- [ ] Create Notification model
- [ ] Create notification endpoints
- [ ] Store notifications in database (can be enhanced with email/SMS later)
- [ ] Notification for lab technicians when lab test is billed

### 7. Patient View for Lab Technician
- [ ] Show lab tests under patient in laboratory page
- [ ] Filter by patient
- [ ] Show pending tests

## Implementation Steps

### Phase 1: Models and Database (Backend)
1. Update MedicalRecord model to include labRequest reference
2. Update LabRequest model to include billing status and invoice reference
3. Create Notification model
4. Update existing models as needed

### Phase 2: Backend APIs
1. Create/update medical record endpoints with lab request integration
2. Create notification endpoints
3. Update billing endpoints to create notifications
4. Update visibility filters for different roles

### Phase 3: Frontend Pages
1. Doctor's appointments page (DONE)
2. Enhanced medical record form with lab request and prescription
3. Update laboratory page for patient view
4. Notification center (optional)

## Current Status
- ✅ Doctor's appointments page created
- ⏳ Working on remaining features

