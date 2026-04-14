# ZDSPGC DIMATALING QR Code Event Attendance System

A modern, real-time attendance tracking system using dynamic QR codes for educational institutions.

## Features

- **Role-based Access**: Admin, Staff, and Student portals
- **Dynamic QR Codes**: Staff display QR codes, students scan to mark attendance
- **Real-time Monitoring**: Live attendance tracking and reports
- **Event Management**: Create, manage, and track events
- **Responsive Design**: Works on desktop and mobile devices
- **Secure Authentication**: Firebase Authentication with protected routes

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **QR Code Scanning**: html5-qrcode
- **QR Code Generation**: qrcode.react

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/zdspgc-attendance.git
   cd zdspgc-attendance
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Get your Firebase configuration

4. **Create environment file**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your Firebase credentials:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

### Creating Admin Account

1. Register a user through the web interface
2. Go to Firebase Console → Firestore Database
3. Find the user document in `users` collection
4. Change the `role` field from `"student"` to `"admin"`
5. Log out and log back in

## Deployment

### Deploy to Netlify

1. Push code to GitHub
2. Connect Netlify to your GitHub repository
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Add environment variables in Netlify dashboard

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Usage

### For Staff:
1. Login with staff credentials
2. View events on dashboard
3. Show QR code to students for attendance
4. View attendance reports

### For Students:
1. Login with student credentials
2. Scan QR code displayed by staff
3. View attendance history
4. Check upcoming events

## Project Structure

```
app/
├── admin/          # Admin portal pages
├── staff/          # Staff portal pages
├── student/        # Student portal pages
├── login/          # Login pages
├── register/       # Registration page
├── page.tsx        # Homepage
components/
├── admin/          # Admin components
├── staff/          # Staff components
├── student/        # Student components
contexts/
└── AuthContext.tsx # Authentication context
lib/
└── firebase.ts     # Firebase configuration
```

## License

MIT License - free to use for educational purposes.

## Support

For issues or questions, please open a GitHub issue.
# Deploy trigger Tue, Apr 14, 2026  9:28:55 PM
