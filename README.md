# 🏥 Clinic Management System

A full-featured clinic management solution designed to streamline patient appointments, medical records, laboratory services, billing, inventory, and reporting – built using MERN Stack with Next.js and TypeScript.

## 🚀 Features

- 🔐 Secure role-based authentication system (Super Admin, Admin, Receptionist, Doctor, Lab Technician, Patient)
- 📅 Real-time appointment booking & scheduling
- 🏥 Complete patient management & medical records
- 🧪 Laboratory module: test ordering, result management, and billing
- 💰 Integrated billing & multiple payment gateways (Khalti, eSewa, Fonepay)
- 📦 Inventory management with expiry & stock alerts
- 📈 Advanced reporting with data visualization

## 🛠️ Technology Stack

### Frontend
- Next.js 14 (React 18)
- TypeScript
- Redux Toolkit
- Material-UI (MUI)
- Chart.js
- React Hook Form

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose ODM
- JWT Authentication
- bcryptjs for password hashing

### Notifications
- Nodemailer/SendGrid (Email)
- Twilio (SMS)

### Payments
- Khalti
- eSewa
- Fonepay

## 📂 Project Structure

```
clinic-management-system/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── services/
│   ├── utils/
│   ├── .env.example
│   ├── server.js
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── app/
    │   ├── components/
    │   ├── contexts/
    │   ├── hooks/
    │   ├── layouts/
    │   ├── lib/
    │   ├── store/
    │   ├── styles/
    │   └── types/
    ├── .env.local.example
    ├── next.config.js
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pkhokhali/clinic-management-system.git
   cd clinic-management-system
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Copy environment file
   cp .env.example .env
   
   # Edit .env file with your configuration
   # Set MONGODB_URI, JWT_SECRET, etc.
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   
   # Copy environment file
   cp .env.local.example .env.local
   
   # Edit .env.local file with your configuration
   # Set NEXT_PUBLIC_API_URL
   ```

### Running the Application

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Server will run on `http://localhost:5000`

3. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   Application will run on `http://localhost:3000`

## 📝 Environment Variables

### Backend (.env)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/clinic_management
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Payment Gateways
KHALTI_SECRET_KEY=your_khalti_secret_key
KHALTI_PUBLIC_KEY=your_khalti_public_key
ESEWA_MERCHANT_ID=your_esewa_merchant_id
ESEWA_SECRET_KEY=your_esewa_secret_key
FONEPAY_MERCHANT_ID=your_fonepay_merchant_id
FONEPAY_SECRET_KEY=your_fonepay_secret_key
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🚀 Development Roadmap

### ✅ Phase 1: Core Infrastructure & Authentication
- [x] Set up Express.js server with MongoDB connection
- [x] Implement JWT authentication & role-based authorization
- [x] Create user schema with all roles: Super Admin, Admin, Receptionist, Doctor, Lab Technician, Patient
- [x] Initialize Next.js project with TypeScript
- [x] Build authentication pages (Login, Registration, Password Reset)
- [x] Implement Redux Toolkit for state management
- [x] Develop role-based navigation and responsive dashboard

### ✅ Phase 2: Appointment Management (Backend Complete)
- [x] Appointment schema with status tracking
- [x] Doctor availability scheduler & conflict detection
- [x] Calendar integration & notification endpoints
- [x] Appointment booking API endpoints
- [x] Doctor availability API
- [ ] Appointment booking interface with interactive calendar (Frontend)
- [ ] Real-time appointment status updates (Frontend)

### ✅ Phase 3: Medical Records & Patient Management (Backend Complete)
- [x] Medical history & prescription management schemas
- [x] Patient profile endpoints with access controls
- [x] All user roles implemented in schema
- [x] User management endpoints
- [ ] Patient profile and medical history viewer (Frontend)
- [ ] Prescription management UI & secure file handling (Frontend)

### ✅ Phase 4: Laboratory Services (Backend Complete)
- [x] Laboratory test catalog schema
- [x] Lab request & result schemas
- [x] Lab test CRUD endpoints
- [x] Lab request & result endpoints
- [ ] Lab test ordering interface (Frontend)
- [ ] Lab technician dashboard (Frontend)
- [ ] Lab results viewer (Frontend)

### ✅ Phase 5: Billing & Financial Management (Backend Complete)
- [x] Invoice & payment schemas
- [x] Payment service integration (Khalti, eSewa, Fonepay)
- [x] Financial reporting endpoints
- [x] Invoice generation API
- [x] Payment workflow endpoints
- [ ] Invoice generation UI (Frontend)
- [ ] Payment workflow UI (Frontend)
- [ ] Financial reports & revenue charts (Frontend)

### ✅ Phase 6: Inventory Management (Backend Complete)
- [x] Medicine/inventory schema with expiry tracking
- [x] Low-stock tracking
- [x] Supplier management schema & endpoints
- [x] Inventory CRUD endpoints
- [ ] Inventory dashboard (Frontend)
- [ ] Barcode scanning support (Frontend)
- [ ] Supplier management UI (Frontend)

### ✅ Phase 7: Reporting & Notifications (Backend Complete)
- [x] Analytics endpoints
- [x] Email notification service (Nodemailer)
- [x] SMS notification service (Twilio)
- [x] Dashboard stats endpoints
- [x] Revenue reporting endpoints
- [ ] Reporting dashboard with data visualizations (Frontend)
- [ ] Notification center (Frontend)

### ⬜ Phase 8: Testing & Deployment
- [ ] Unit & integration testing (Jest, Cypress)
- [ ] Security & accessibility audits
- [ ] CI/CD pipeline setup (Vercel + AWS/Heroku)
- [ ] Production optimizations & error monitoring

## 👥 User Roles

1. **Super Admin** - Full system access
2. **Admin** - Administrative access
3. **Receptionist** - Patient registration, appointments, billing
4. **Doctor** - Patient management, medical records, prescriptions
5. **Lab Technician** - Laboratory test management
6. **Patient** - View appointments, medical records, lab results

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Input validation and sanitization
- CORS protection
- Rate limiting

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**pkhokhali**

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📞 Support

For support, email support@clinicmanagement.com or open an issue in the repository.

---

Built with ❤️ using MERN Stack
