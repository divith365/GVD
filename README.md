# GVD Auto World - Vehicle Inspection & Detailing Portal

A mobile-first web app designed for multi-branch car and bike service centers. Built with React, TypeScript, Tailwind CSS, and Cloudflare D1 (Database) and Cloudflare R2 (Zero-egress Object Storage).

---

## 🌟 Key Features

### 1. 🔐 Role-Based Access Control
- **Manager PIN Login**: Touch-friendly 0–9 keypad with 4-digit PIN verification. Auto-detects assigned service center and vehicle workflow (Car vs Bike).
- **Admin Portal**: Multi-center management, center creation, manager generation with PIN assignment, aggregated inspection dashboards.

### 2. 🚗 Car Service Workflow (12 Inspection Angles)
- Registration number entry and customer details.
- **Guided Photo Capture**:
  - **4 Doors**: Front Left Door, Front Right Door, Rear Left Door, Rear Right Door
  - **Exterior**: Full Front View, Full Rear View
  - **Interior & Top**: Dashboard & Infotainment, Roof Top, Dicky / Boot Space
  - **Additional Angles**: Up to 3 custom photos (scratches, alloy wheels, custom spots)
- Pre-service condition check-in and post-service matching check-out.

### 3. 🏍️ Bike Service Workflow (Service Selection + 4 Angles)
- Two-wheeler registration number entry.
- **Service Type Selection**:
  - Wash (Foam wash & degreasing)
  - Teflon Coating (Gloss protect film)
  - Ceramic Coating (9H Nano glass shield)
  - PPF Coating (Self-healing paint wrap)
  - Other Service (Custom service description)
- **4 Guided Photos**: Front View, Rear View, Left Side View, Right Side View.

### 4. 🔍 Before & After Comparison Viewer
- **Next-to-Next Dual View**: Displays pre-service and post-service photos side by side for all angles.
- **Interactive Split Slider**: Draggable handle across the image to inspect finish and detailing quality.
- **Angle Switcher**: Quick horizontal chip selector for all car/bike positions.

### 5. ☁️ Cloudflare Architecture
- **Cloudflare D1**: Serverless relational database for service centers, managers, and inspection records.
- **Cloudflare R2**: High-speed object storage for full-resolution inspection photos with zero egress fees.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Installation
```bash
git clone https://github.com/divith365/GVD.git
cd GVD
npm install
```

### Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) on your desktop or mobile browser.

### Build for Production
```bash
npm run build
```

---

## 📱 PWA Support
- Standalone display mode with Web App Manifest
- Native Camera API integration (`capture="environment"`)
- Offline precaching via Workbox / Vite PWA

---

## 📄 License
MIT
