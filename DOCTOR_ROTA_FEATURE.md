# Doctor Rota/Schedule Management Feature

## Overview
This feature allows Super Admin and Admin to manage doctor schedules/rotas and ensures patients can only book appointments within available doctor schedules.

## Backend Implementation (✅ Completed)

### 1. Doctor Schedule Model (`backend/models/DoctorSchedule.model.js`)
- Supports recurring schedules (weekly by day of week)
- Supports one-time schedules (specific dates)
- Fields: doctor, dayOfWeek, specificDate, startTime, endTime, slotDuration, isRecurring, isActive, effectiveFrom, effectiveUntil
- Validates end time is after start time

### 2. Schedule Controller (`backend/controllers/doctorSchedule.controller.js`)
- ✅ `createSchedule` - Create new schedule
- ✅ `getSchedules` - Get all schedules (with filters)
- ✅ `getSchedule` - Get single schedule
- ✅ `updateSchedule` - Update schedule
- ✅ `deleteSchedule` - Delete schedule
- ✅ `getAvailableSlots` - Get available time slots for a doctor on a specific date (filters out past times if today)

### 3. Schedule Routes (`backend/routes/doctorSchedule.routes.js`)
- POST `/api/schedules` - Create schedule (Super Admin, Admin only)
- GET `/api/schedules` - Get all schedules
- GET `/api/schedules/:id` - Get single schedule
- PUT `/api/schedules/:id` - Update schedule (Super Admin, Admin only)
- DELETE `/api/schedules/:id` - Delete schedule (Super Admin, Admin only)
- GET `/api/schedules/availability/:doctorId?date=YYYY-MM-DD` - Get available slots (any authenticated user)

### 4. Appointment Controller Updates
- ✅ Added date validation (no past dates)
- ✅ Added time validation (no past times if today)
- ✅ Checks if doctor has schedule for selected date/time
- ✅ Validates time is within schedule time range
- ✅ Updated availability endpoint to use schedule-based logic

## Frontend Implementation (🔄 In Progress)

### 1. Appointment Form Updates
- ✅ Already uses `/api/appointments/availability/:doctorId` which now uses schedules
- ✅ Date input has min date validation (today)
- 🔄 Need to ensure time slots exclude past times for today (handled by backend)

### 2. Doctor Schedule Management Page (🔄 To Create)
- Location: `/dashboard/schedules`
- Access: Super Admin, Admin only
- Features:
  - View all doctor schedules
  - Add new schedule (recurring or one-time)
  - Edit schedule
  - Delete schedule
  - Filter by doctor
  - Toggle schedule active/inactive

## How It Works

1. **Setting Doctor Schedule:**
   - Super Admin/Admin creates schedules for doctors
   - Can set recurring weekly schedules (e.g., Monday 9 AM - 5 PM)
   - Can set one-time schedules for specific dates

2. **Booking Appointment:**
   - Patient selects doctor and date
   - System fetches available slots from doctor's schedule
   - System filters out:
     - Times outside schedule range
     - Already booked times
     - Past times (if booking for today)
   - Patient can only select from available slots

3. **Validation:**
   - Backend validates date is not in past
   - Backend validates time is not in past (if today)
   - Backend validates time is within doctor's schedule
   - Backend prevents double-booking

## Next Steps
1. ✅ Backend complete
2. 🔄 Create frontend Doctor Schedule Management page
3. ✅ Appointment booking already uses schedule-based availability

