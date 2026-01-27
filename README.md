# MyClinic Mobile App

Doctor booking mobile application built with React Native and Expo.

## 🚀 Quick Start

### Prerequisites
- Node.js and npm installed
- **Backend API running on `http://localhost:5001`**
- Expo Go app on your phone (iOS or Android)

### Installation

```bash
npm install
```

### Running the App

```bash
npm start
```

## 📱 How to Test

### ⚠️ IMPORTANT: This is a MOBILE APP, not a web app!

**DO NOT** try to open `localhost:8081` in your web browser - that will only show JSON metadata.

### Correct Ways to Test:

#### Option 1: On Your Phone (Recommended)
1. Install **Expo Go** from App Store (iOS) or Play Store (Android)
2. Run `npm start` in terminal
3. Scan the QR code with:
   - **iPhone**: Use Camera app
   - **Android**: Use Expo Go app
4. App will open in Expo Go

#### Option 2: iOS Simulator (Mac only)
1. Run `npm start`
2. Press `i` in the terminal
3. App opens in iOS Simulator

#### Option 3: Android Emulator
1. Start Android emulator first
2. Run `npm start`
3. Press `a` in the terminal
4. App opens in Android emulator

## 🔧 Configuration

### Environment Variables

Edit `.env` file:
```
API_BASE_URL=http://localhost:5001
```

**Important**: Make sure your backend API is running before testing the app!

## 📋 Features

- ✅ Mobile number authentication with OTP
- ✅ Location-based doctor discovery
- ✅ Doctor details and dispensary selection
- ✅ Time slot booking
- ✅ Booking confirmation

## 🐛 Troubleshooting

### "Unable to resolve asset" errors
- Assets have been created in `/assets` folder
- Reload app by pressing `r` in terminal

### "Cannot connect to API" errors
- Ensure backend is running on `http://localhost:5001`
- Check `.env` file for correct API_BASE_URL

### Port already in use
- Press `Y` when asked to use alternative port
- Or kill other Expo processes

### Testing on physical device
- Ensure phone and computer are on same WiFi network
- If QR code doesn't work, enter URL manually in Expo Go

## 📁 Project Structure

```
myclinic-mobile-sop/
├── src/
│   ├── components/       # Reusable UI components
│   ├── context/          # Auth & Location context
│   ├── navigation/       # App navigation
│   ├── screens/          # All screens
│   ├── services/         # API client
│   ├── theme/            # Design system
│   └── utils/            # Utilities
├── assets/               # Images
├── App.js               # Entry point
└── .env                 # Environment config
```

## 🎯 API Endpoints Used

- POST `/api/mobile/auth/signup-mobile` - Register
- GET `/api/users/mobile/{mobile}` - Check user
- POST `/api/util/send-otp` - Send OTP
- POST `/api/util/verify-otp` - Verify OTP
- GET `/api/location/doctors-nearby` - Find doctors
- GET `/api/timeslots/next-available/{doctorId}/{dispensaryId}` - Get slots
- POST `/api/bookings` - Create booking
- GET `/api/bookings/summary/{transactionId}` - Booking summary

## 📞 Support

For issues or questions, check the walkthrough document in the brain folder.
