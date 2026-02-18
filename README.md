# Blood Agent - Emergency Blood Donor Finder

A web application for finding nearby blood donors and blood banks in emergency situations.

## Features

### Emergency Search (index.html)
- 🚨 Emergency verification with hospital report upload
- 📍 Real-time location tracking using browser geolocation
- 🩸 Smart blood type compatibility matching
- 🗺️ Interactive map showing donors and blood banks (OpenStreetMap/Leaflet)
- 📞 Direct contact information for donors
- 🏥 Blood bank availability status
- 📱 Responsive, hospital-themed UI

### Donor Dashboard (dashboard.html)
- 👤 Donor registration with complete profile
- 📅 Track donation history and dates
- ⏳ 30-day eligibility checker (automatic calculation)
- 📊 Donation statistics (total donations, lives saved)
- ✏️ Edit profile and update information
- 💉 Add new donation records
- 🔔 Eligibility status display

## Setup

1. Open `index.html` for emergency blood search
2. Open `dashboard.html` to register as a donor
3. Allow location access when prompted (for emergency search)
4. All data is stored locally in your browser (localStorage)

## Usage

### For Donors:
1. Go to `dashboard.html`
2. Register with your details (name, blood type, contact, address)
3. Add your last donation date
4. Track your eligibility status (30-day rule)
5. Add new donations as you donate

### For Emergency Situations:
1. Go to `index.html`
2. Upload hospital report
3. Enter patient details and required blood type
4. View nearby eligible donors and blood banks on map

## Technologies Used

- HTML5, CSS3, JavaScript
- Leaflet.js for interactive maps
- OpenStreetMap API for map tiles
- Browser Geolocation API
- Node.js + Express (Backend)
- SQLite Database (Data Storage)

## Database Setup

The application now includes a backend database for persistent storage:

1. Install dependencies: `npm install`
2. Start the server: `npm start`
3. Server runs on http://localhost:3000
4. Database file: `blood_donors.db` (auto-created)

See `SETUP.md` for detailed instructions.

## Blood Type Compatibility

The app automatically filters donors based on blood type compatibility:
- O- is universal donor
- AB+ is universal recipient
- Compatible matches are shown based on medical standards

## Note

This is a demo application with mock data. For production use:
- Integrate with a real donor database API
- Implement proper hospital report verification
- Add backend authentication and security
- Connect to actual blood bank inventory systems
- Implement real-time donor availability updates

## Emergency Notice

⚠️ For life-threatening emergencies, always call 911 immediately.
