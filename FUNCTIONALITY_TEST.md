# Blood Bond - Functionality Test Checklist

## ✅ Navigation Tests

### Main Website (index.html)
- [ ] Click "Emergency Search" tab in header → Should stay on current page
- [ ] Click "Donor Dashboard" tab in header → Should navigate to dashboard.html
- [ ] Click "Call 108" button in sidebar → Should open phone dialer
- [ ] Click footer links → Should navigate to respective sections

### Dashboard (dashboard.html)
- [ ] Click "Emergency Search" tab in header → Should navigate to index.html
- [ ] Click "Donor Dashboard" tab in header → Should stay on current page
- [ ] Click "Register as Donor" tab → Should show registration form
- [ ] Click "My Profile" tab → Should show profile or "No Profile" message
- [ ] Click "Register Now" button (when no profile) → Should switch to Register tab

## ✅ Registration Tests

### Donor Registration Form
- [ ] Fill all required fields
- [ ] Check both consent checkboxes
- [ ] Click "Register as Donor" button
- [ ] Should see success message
- [ ] Should automatically switch to "My Profile" tab
- [ ] Should see profile information displayed
- [ ] Should see notification permission popup (if Firebase configured)

## ✅ Profile Tests

### Profile Display
- [ ] Profile name should display correctly
- [ ] Blood type badge should show
- [ ] Eligibility status should show
- [ ] Contact information should display
- [ ] Medical information should display
- [ ] Statistics should show (0 initially)

### Edit Profile
- [ ] Click "Edit Profile" button
- [ ] Should switch to Register tab
- [ ] Form should be pre-filled with current data
- [ ] Can update information
- [ ] Submit updates profile

### Add Donation
- [ ] Click "Add Donation" button
- [ ] Form should appear
- [ ] Fill donation date and location
- [ ] Click "Save Donation"
- [ ] Should see success message
- [ ] Donation should appear in history
- [ ] Statistics should update
- [ ] Eligibility status should update

## ✅ Emergency Search Tests

### Emergency Request Form
- [ ] Upload hospital report (drag & drop or click)
- [ ] File upload area should show uploaded file
- [ ] Fill patient name
- [ ] Select blood type
- [ ] Enter emergency contact number
- [ ] Enter requester email
- [ ] Check confirmation checkbox
- [ ] Click "Search for Donors Now"
- [ ] Should show loading state
- [ ] Should request location permission
- [ ] Should display results section

### Results Display
- [ ] Map should display
- [ ] Donor list should show compatible donors
- [ ] Blood bank list should show
- [ ] Click "Call" button on donor → Should open phone dialer
- [ ] Click "Email" button on donor → Should open email client
- [ ] Click "Start New Search" → Should return to form

## ✅ Backend Integration Tests

### API Calls
- [ ] Open browser console (F12)
- [ ] Register a donor
- [ ] Check console for "✅ Donor registered with backend"
- [ ] Make emergency request
- [ ] Check console for API responses
- [ ] Verify notifications sent (check console logs)

## ✅ Notification Tests

### Email Notifications (if configured)
- [ ] Register as donor
- [ ] Check email for registration confirmation
- [ ] Make emergency request matching your blood type
- [ ] Check email for emergency alert

### SMS Notifications (if configured)
- [ ] Register with your phone number
- [ ] Make emergency request matching your blood type
- [ ] Check phone for SMS alert

### Push Notifications (if configured)
- [ ] Register as donor
- [ ] Allow notification permission
- [ ] Keep browser tab open
- [ ] Make emergency request matching your blood type
- [ ] Should see browser notification

## ✅ Responsive Design Tests

### Mobile View (< 768px)
- [ ] Header should stack properly
- [ ] Navigation tabs should be vertical
- [ ] Forms should be single column
- [ ] Sidebar should move below main content
- [ ] All buttons should be touch-friendly

### Tablet View (768px - 1024px)
- [ ] Layout should adjust properly
- [ ] Forms should be readable
- [ ] Navigation should work

## ✅ Browser Console Tests

### Check for Errors
1. Open browser console (F12)
2. Navigate through all pages
3. Perform all actions
4. Check for:
   - [ ] No JavaScript errors
   - [ ] No 404 errors for resources
   - [ ] Proper initialization messages
   - [ ] API responses logged correctly

## 🐛 Common Issues & Fixes

### Navigation Not Working
- **Issue**: Clicking nav items does nothing
- **Fix**: Check browser console for errors, ensure JavaScript files are loaded

### Forms Not Submitting
- **Issue**: Submit button doesn't work
- **Fix**: Check all required fields are filled, check console for validation errors

### Profile Not Displaying
- **Issue**: After registration, profile doesn't show
- **Fix**: Check localStorage in browser DevTools → Application → Local Storage

### Notifications Not Working
- **Issue**: No emails/SMS received
- **Fix**: Check .env file has correct credentials, check server console logs

### Map Not Displaying
- **Issue**: Map area is blank
- **Fix**: Check browser console for Leaflet errors, ensure internet connection

## 🔧 Debug Commands

### Check LocalStorage
```javascript
// In browser console
console.log('Donor Profile:', localStorage.getItem('donorProfile'));
console.log('Available Donors:', localStorage.getItem('availableDonors'));
```

### Clear LocalStorage
```javascript
// In browser console
localStorage.clear();
location.reload();
```

### Test Notification Functions
```javascript
// In browser console (on dashboard page)
switchTab('profile'); // Should switch tabs
```

```javascript
// In browser console (on index page)
callDonor('+1234567890'); // Should open phone dialer
emailDonor('test@example.com'); // Should open email client
```

## ✅ Server Tests

### Check Server Status
```bash
# Server should be running
npm start

# Check console output:
# ✅ Twilio SMS initialized
# ✅ Gmail SMTP initialized
# Blood Bond server running on http://localhost:3000
# Connected to SQLite database
# Database tables initialized
```

### Test API Endpoints
```bash
# Test donor registration
curl -X POST http://localhost:3000/api/donors \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","bloodType":"O+","phone":"+1234567890","email":"test@example.com","address":"123 Test St","age":30,"weight":70}'

# Test emergency request
curl -X POST http://localhost:3000/api/emergency-request \
  -H "Content-Type: application/json" \
  -d '{"patientName":"Test Patient","bloodType":"O+","emergencyContact":"+1234567890","requesterEmail":"requester@example.com"}'
```

## 📊 Success Criteria

All tests should pass with:
- ✅ No JavaScript errors in console
- ✅ All navigation working
- ✅ Forms submitting successfully
- ✅ Data persisting correctly
- ✅ Notifications sending (if configured)
- ✅ Responsive design working
- ✅ Backend API responding

---

## 🎉 If All Tests Pass

Your Blood Bond application is fully functional and ready to use!

Visit: http://localhost:3000
