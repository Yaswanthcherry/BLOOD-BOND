# API Integration Setup Guide

This guide will help you set up the three mapping and location APIs for the Blood Bond application.

## 🗺️ APIs Integrated

1. **Google Maps API** - Enhanced mapping with street-level detail
2. **Google Places API** - Auto-suggest hospitals and blood banks
3. **OpenRouteService API** - Calculate actual driving distance and time

---

## 1. Google Maps & Places API Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "Blood Bond" → Click "Create"

### Step 2: Enable Required APIs

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search and enable the following APIs:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**
   - **Directions API**

### Step 3: Create API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **API key**
3. Copy the API key (it will look like: `AIzaSyD...`)

### Step 4: Secure Your API Key (Recommended)

1. Click on your API key to edit it
2. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add your domains:
     - `http://localhost:3000/*`
     - `http://127.0.0.1:3000/*`
     - Add your production domain when ready
3. Under "API restrictions":
   - Select "Restrict key"
   - Select only the APIs you enabled above
4. Click **Save**

### Step 5: Add to Your Project

1. Open `.env` file in your project root
2. Add your Google Maps API key:
   ```
   GOOGLE_MAPS_API_KEY=AIzaSyD...your_actual_key_here
   ```

3. Update `index.html` and `dashboard.html`:
   - Find: `YOUR_GOOGLE_MAPS_API_KEY`
   - Replace with your actual API key

---

## 2. OpenRouteService API Setup

### Step 1: Create Account

1. Go to [OpenRouteService](https://openrouteservice.org/dev/#/signup)
2. Click "Sign Up" and create a free account
3. Verify your email address

### Step 2: Get API Key

1. Log in to your OpenRouteService account
2. Go to [Dashboard](https://openrouteservice.org/dev/#/home)
3. Click "Request a Token" or view your existing tokens
4. Copy your API key (it will look like: `5b3ce3597851110001cf6248...`)

### Step 3: Free Tier Limits

The free tier includes:
- 2,000 requests per day
- 40 requests per minute
- Perfect for development and small-scale production

### Step 4: Add to Your Project

1. Open `.env` file
2. Add your OpenRouteService API key:
   ```
   OPENROUTESERVICE_API_KEY=5b3ce3597851110001cf6248...your_actual_key_here
   ```

---

## 3. Update Configuration Files

### Update .env file

Your `.env` file should now look like this:

```env
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone

# Gmail SMTP Configuration
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password

# Firebase Cloud Messaging
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_VAPID_KEY=your_vapid_key
FIREBASE_SERVER_KEY=your_firebase_server_key

# Google Maps & Places API
GOOGLE_MAPS_API_KEY=AIzaSyD...your_actual_key_here

# OpenRouteService API
OPENROUTESERVICE_API_KEY=5b3ce3597851110001cf6248...your_actual_key_here
```

### Update HTML Files

1. **index.html** - Line ~316:
   ```html
   <script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places&callback=initMap"></script>
   ```
   Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual key.

2. **dashboard.html** - Line ~438:
   ```html
   <script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places"></script>
   ```
   Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual key.

---

## 4. Testing the Integration

### Test 1: Address Autocomplete

1. Start your server: `node server.js`
2. Open http://localhost:3000
3. In the "Hospital/Location Address" field, start typing an address
4. You should see autocomplete suggestions from Google Places

### Test 2: Donor Search with Map

1. Fill out the emergency request form
2. Select a blood type
3. Submit the form
4. You should see:
   - Google Maps with markers for your location and donors
   - Distance and drive time for each donor
   - "Directions" button for each donor

### Test 3: Backend Distance Calculation

Check your server console for logs like:
```
✅ Calculated route: 5.2 km, 12 minutes
```

---

## 5. Features Enabled

### ✅ Google Maps Features

- **Interactive map** with zoom, street view, and satellite view
- **Custom markers** for user location, donors, and hospitals
- **Info windows** with donor/hospital details
- **Route visualization** with turn-by-turn directions
- **Fit bounds** to show all markers automatically

### ✅ Google Places Features

- **Address autocomplete** for hospital/location input
- **Donor address autocomplete** in registration form
- **Nearby search** for hospitals and blood banks
- **Place details** including phone numbers and hours

### ✅ OpenRouteService Features

- **Driving distance** calculation (not straight-line)
- **Estimated drive time** for each donor
- **Route optimization** for fastest path
- **Fallback** to straight-line distance if API unavailable

---

## 6. Cost Considerations

### Google Maps Pricing

- **$200 free credit per month** (covers ~28,000 map loads)
- After free tier:
  - Maps JavaScript API: $7 per 1,000 loads
  - Places API: $17 per 1,000 requests
  - Directions API: $5 per 1,000 requests

### OpenRouteService Pricing

- **Free tier**: 2,000 requests/day
- **Standard plan**: €49/month for 500,000 requests
- **Premium plan**: Custom pricing

### Cost Optimization Tips

1. **Cache geocoded addresses** in your database
2. **Limit map reloads** by storing user location
3. **Use OpenRouteService** for distance calculations (cheaper than Google Directions)
4. **Set API key restrictions** to prevent unauthorized use

---

## 7. Alternative Free Options

If you want to stay completely free:

### Mapbox (Alternative to Google Maps)

- **Free tier**: 50,000 map loads/month
- Better free tier than Google Maps
- Similar features and quality
- Setup: https://www.mapbox.com/

### Nominatim (Alternative to Google Places)

- **Completely free** OpenStreetMap geocoding
- No API key required
- Less accurate than Google Places
- Setup: https://nominatim.org/

---

## 8. Troubleshooting

### Issue: "Google Maps API not loaded"

**Solution**: Check that:
1. API key is correct in HTML files
2. Maps JavaScript API is enabled in Google Cloud Console
3. No browser console errors about API key restrictions

### Issue: "OpenRouteService API error: 403"

**Solution**: 
1. Verify API key is correct in `.env`
2. Check you haven't exceeded daily limit (2,000 requests)
3. Ensure API key is active in OpenRouteService dashboard

### Issue: Address autocomplete not working

**Solution**:
1. Check Places API is enabled
2. Verify API key has Places API permission
3. Check browser console for errors

### Issue: Distance shows as straight-line

**Solution**:
1. This is the fallback when OpenRouteService is unavailable
2. Check your API key and daily limits
3. Server will log warnings if using fallback

---

## 9. Next Steps

1. ✅ Set up all three API keys
2. ✅ Test address autocomplete
3. ✅ Test donor search with distances
4. ✅ Test directions feature
5. 📊 Monitor API usage in respective dashboards
6. 🚀 Deploy to production with production domain restrictions

---

## Support

- **Google Maps**: https://developers.google.com/maps/support
- **OpenRouteService**: https://ask.openrouteservice.org/
- **Project Issues**: Check server console logs for detailed error messages

---

**Happy Mapping! 🗺️**
