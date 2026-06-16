# Quick API Setup Checklist

Follow these steps to get the enhanced mapping features working in 10 minutes.

## ✅ Step-by-Step Setup

### 1. Get Google Maps API Key (5 minutes)

1. Go to https://console.cloud.google.com/
2. Create new project: "Blood Bond"
3. Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Directions API
4. Create API key (Credentials → Create Credentials → API key)
5. Copy the key (looks like: `AIzaSyD...`)

### 2. Get OpenRouteService API Key (3 minutes)

1. Go to https://openrouteservice.org/dev/#/signup
2. Sign up for free account
3. Verify email
4. Get API key from dashboard (looks like: `5b3ce3597851110001cf6248...`)

### 3. Update Your Project (2 minutes)

#### Update .env file:

```env
GOOGLE_MAPS_API_KEY=AIzaSyD...your_actual_key
OPENROUTESERVICE_API_KEY=5b3ce3597851110001cf6248...your_actual_key
```

#### Update index.html (line ~316):

Find:
```html
<script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places&callback=initMap"></script>
```

Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual key.

#### Update dashboard.html (line ~438):

Find:
```html
<script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places"></script>
```

Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual key.

### 4. Test It! (1 minute)

```bash
# Start server
node server.js

# Open browser
http://localhost:3000
```

Test features:
- ✅ Type in "Hospital/Location Address" field → See autocomplete suggestions
- ✅ Submit emergency request → See Google Maps with markers
- ✅ Check donor distances → See actual driving distance and time
- ✅ Click "Directions" button → Opens Google Maps with route

---

## 🎯 What You Get

### Before (OpenStreetMap):
- ❌ Basic map tiles
- ❌ No address autocomplete
- ❌ Straight-line distance only
- ❌ No turn-by-turn directions

### After (Google Maps + OpenRouteService):
- ✅ High-quality interactive maps
- ✅ Address autocomplete with suggestions
- ✅ Actual driving distance and time
- ✅ Turn-by-turn directions
- ✅ Street view and satellite imagery
- ✅ Nearby hospital/blood bank search

---

## 💰 Cost (Free Tier)

### Google Maps
- **$200 free credit/month**
- Covers ~28,000 map loads
- Perfect for development and small production

### OpenRouteService
- **2,000 requests/day free**
- 40 requests/minute
- More than enough for most use cases

---

## 🔒 Security (Optional but Recommended)

### Restrict Google Maps API Key:

1. Go to Google Cloud Console → Credentials
2. Click your API key
3. Under "Application restrictions":
   - Select "HTTP referrers"
   - Add: `http://localhost:3000/*`
   - Add your production domain later
4. Under "API restrictions":
   - Select "Restrict key"
   - Select only the 4 APIs you enabled
5. Save

---

## 🐛 Troubleshooting

### Map not loading?
- Check browser console for errors
- Verify API key is correct in HTML files
- Ensure APIs are enabled in Google Cloud Console

### Autocomplete not working?
- Check Places API is enabled
- Verify API key in HTML matches your Google Cloud key
- Clear browser cache

### Distance shows as straight-line?
- Check OpenRouteService API key in .env
- Verify you haven't exceeded daily limit (2,000 requests)
- Check server console for error messages

### "Google Maps API not loaded" error?
- Wait a few seconds for API to load
- Check internet connection
- Verify script tag is correct in HTML

---

## 📚 Full Documentation

- **Detailed Setup**: See `API_SETUP_GUIDE.md`
- **API Usage**: See `API_USAGE_REFERENCE.md`
- **Code Examples**: Check `services/locationService.js` and `map-service.js`

---

## 🚀 Next Steps

1. ✅ Complete setup above
2. 📊 Monitor API usage in dashboards
3. 🎨 Customize map styles (optional)
4. 🔐 Add API key restrictions for production
5. 💾 Cache geocoded addresses in database
6. 📱 Test on mobile devices

---

## 💡 Pro Tips

1. **Save API keys securely** - Never commit .env to git
2. **Monitor usage** - Check Google Cloud Console and OpenRouteService dashboard
3. **Cache results** - Store geocoded addresses to reduce API calls
4. **Set up billing alerts** - Get notified if you exceed free tier
5. **Use environment variables** - Different keys for dev/production

---

**That's it! You now have enterprise-grade mapping in your Blood Bond app! 🎉**

Questions? Check the full guides or server console logs for detailed error messages.
