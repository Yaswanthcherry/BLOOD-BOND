# Blood Bond - Quick Start Guide

## 🚀 Get Running in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Server
```bash
npm start
```

### 3. Open Browser
Visit: http://localhost:3000

---

## 📱 Add Notifications (Optional)

### Easiest First: Gmail (100% Free)
1. Enable 2FA on your Gmail account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Create `.env` file:
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_16_char_password
```
4. Restart server

✅ Now you get email confirmations!

---

### Most Impactful: Twilio SMS (Free $15 Credit)
1. Sign up: https://www.twilio.com/try-twilio
2. Get phone number with SMS capability
3. Add to `.env`:
```env
TWILIO_ACCOUNT_SID=ACxxxxx...
TWILIO_AUTH_TOKEN=xxxxx...
TWILIO_PHONE_NUMBER=+1234567890
```
4. Restart server

✅ Now donors get SMS alerts!

---

### Advanced: Firebase Push (100% Free)
1. Create project: https://console.firebase.google.com/
2. Register web app
3. Get config and update `public/fcm-init.js`
4. Add Firebase scripts to HTML files

✅ Now donors get browser notifications!

---

## 📖 Full Documentation

- **Complete Setup:** See `NOTIFICATION_SETUP.md`
- **Project Info:** See `README.md`
- **Database Setup:** See `SETUP.md`

---

## 🎯 Priority Order

1. **Start with Gmail** (5 minutes, free, easy)
2. **Add Twilio SMS** (10 minutes, $15 credit, high impact)
3. **Add Firebase FCM** (15 minutes, free, nice-to-have)

---

## ⚡ Without Notifications

The app works perfectly without any notification setup!
- Notifications will be logged to console
- All core features work
- Add notifications anytime later

---

## 🆘 Need Help?

Check `NOTIFICATION_SETUP.md` for detailed troubleshooting.
