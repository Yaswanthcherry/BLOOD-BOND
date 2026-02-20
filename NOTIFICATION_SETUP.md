# Blood Bond - Notification Setup Guide

This guide will help you set up SMS, Email, and Push Notifications for Blood Bond.

## 🚀 Quick Overview

- **Twilio SMS** - Send emergency alerts to donors via SMS
- **Nodemailer + Gmail** - Send email confirmations and notifications
- **Firebase FCM** - Browser push notifications

---

## 1️⃣ Twilio SMS Setup (Emergency Alerts)

### Step 1: Create Twilio Account
1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for a free account (includes $15 credit)
3. Verify your phone number

### Step 2: Get Credentials
1. Go to [Twilio Console](https://console.twilio.com/)
2. Copy your **Account SID** and **Auth Token**
3. Get a phone number:
   - Go to Phone Numbers → Manage → Buy a number
   - Choose a number with SMS capability
   - Copy the phone number (format: +1234567890)

### Step 3: Add to .env
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### Testing
```bash
# The app will automatically send SMS when emergency requests are made
# Test numbers (free tier): Only verified numbers can receive SMS
```

---

## 2️⃣ Gmail SMTP Setup (Email Notifications)

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**

### Step 2: Generate App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select app: **Mail**
3. Select device: **Other (Custom name)** → Type "Blood Bond"
4. Click **Generate**
5. Copy the 16-character password (no spaces)

### Step 3: Add to .env
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

### What Gets Sent
- ✅ Registration confirmation emails
- 🚨 Emergency blood request alerts
- 📧 Match notifications to requesters

---

## 3️⃣ Firebase Cloud Messaging Setup (Push Notifications)

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add Project**
3. Enter project name: "Blood Bond"
4. Disable Google Analytics (optional)
5. Click **Create Project**

### Step 2: Register Web App
1. In Firebase Console, click the **Web icon** (</>)
2. Register app name: "Blood Bond Web"
3. Copy the **Firebase Config** object

### Step 3: Enable Cloud Messaging
1. Go to **Project Settings** → **Cloud Messaging**
2. Under **Web Push certificates**, click **Generate key pair**
3. Copy the **VAPID key**

### Step 4: Update Configuration Files

#### Update `public/firebase-messaging-sw.js`:
```javascript
firebase.initializeApp({
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
});
```

#### Update `public/fcm-init.js`:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// And update VAPID key:
const token = await messaging.getToken({
    vapidKey: 'YOUR_VAPID_KEY'
});
```

### Step 5: Add Firebase SDK to HTML
Add these scripts to `index.html` and `dashboard.html` before closing `</body>`:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"></script>
<script src="/fcm-init.js"></script>
```

### Step 6: Request Permission
Add this to your donor dashboard after registration:

```javascript
// Request notification permission
if ('Notification' in window && window.BloodBondFCM) {
    const enableNotifications = confirm('Enable push notifications for emergency alerts?');
    if (enableNotifications) {
        window.BloodBondFCM.requestPermission();
    }
}
```

---

## 📦 Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Create .env file:**
```bash
copy .env.example .env
```

3. **Edit .env with your credentials**

4. **Start the server:**
```bash
npm start
```

---

## 🧪 Testing Notifications

### Test SMS & Email
```javascript
// Make a POST request to emergency endpoint
fetch('http://localhost:3000/api/emergency-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        patientName: 'Test Patient',
        bloodType: 'O+',
        emergencyContact: '+1234567890',
        requesterEmail: 'requester@example.com'
    })
});
```

### Test Registration Email
1. Go to `dashboard.html`
2. Register as a new donor
3. Check your email for confirmation

### Test Push Notifications
1. Register as donor
2. Allow notification permission when prompted
3. Keep browser tab open
4. Make an emergency request matching your blood type
5. You should see a browser notification

---

## 💰 Cost Breakdown

| Service | Free Tier | Cost After |
|---------|-----------|------------|
| **Twilio SMS** | $15 credit (~500 SMS) | $0.0075/SMS |
| **Gmail SMTP** | Unlimited | Free |
| **Firebase FCM** | Unlimited | Free |

### Recommendations:
- Start with **Gmail + FCM** (completely free)
- Add **Twilio** when you have budget (most impactful)
- Use SMS for critical emergency alerts only

---

## 🔧 Troubleshooting

### SMS not sending
- Check Twilio account balance
- Verify phone numbers are in E.164 format (+1234567890)
- For free tier, verify recipient numbers in Twilio console

### Email not sending
- Verify 2FA is enabled on Gmail
- Use App Password, not regular password
- Check "Less secure app access" is OFF
- Remove spaces from app password in .env

### Push notifications not working
- Check HTTPS (required for FCM, or use localhost)
- Verify Firebase config is correct
- Check browser console for errors
- Ensure service worker is registered

---

## 🎯 What Happens When

### Donor Registers
- ✅ Email confirmation sent
- 📱 SMS welcome message (optional)

### Emergency Request Made
- 🚨 SMS alert to all compatible donors
- 📧 Email alert to all compatible donors
- 🔔 Push notification to donors (if online)
- ✅ Match confirmation email to requester

---

## 🔐 Security Notes

- Never commit `.env` file to git
- Keep API keys secret
- Use environment variables in production
- Rotate keys regularly
- Monitor usage to prevent abuse

---

## 📚 Additional Resources

- [Twilio SMS Docs](https://www.twilio.com/docs/sms)
- [Nodemailer Guide](https://nodemailer.com/about/)
- [Firebase FCM Docs](https://firebase.google.com/docs/cloud-messaging)

---

## ✅ Quick Start (Without Setup)

The app works without notifications! If credentials are not configured:
- SMS/Email will be logged to console
- App functionality remains intact
- Add credentials later when ready

---

Need help? Check the console logs for detailed error messages.
