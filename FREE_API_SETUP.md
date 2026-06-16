# 🆓 Blood Bond - 100% FREE API Setup

## Overview

Your Blood Bond application now uses completely FREE APIs with generous limits:

1. **Mapbox GL JS** - FREE: 50,000 map loads/month (better than Google's $200 credit)
2. **Nominatim (OpenStreetMap)** - 100% FREE: Unlimited geocoding and address search
3. **OpenRouteService** - FREE: 2,000 requests/day for routing

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get Mapbox Access Token (Optional - 3 minutes)

Mapbox is optional but recommended for better maps.

1. Go to https://account.mapbox.com/
2. Sign up for free account
3. Copy your default public token (starts with `pk.`)
4. Add to `.env` file:
   ```env
   MAPBOX_ACCESS_TOKEN=pk.your_token_here
   ```

**Free Tier:**
- 50,000 map loads per month
- No credit card required
- More than enough for development and small production

### Step 2: Get OpenRouteService API Key (Optional - 2 minutes)

OpenRouteService is optional but recommended for accurate driving distances.

1. Go to https://openrouteservice.org/dev/#/signup
2. Sign up for free account
3. Verify email
4. Get API key from dashboard
5. Add to `.env` file:
   ```env
   OPENROUTESERVICE_API_KEY=your_key_here
   ```

**Free Tier:**
- 2,000 requests per day
- 40 requests per minute
- No credit card required

### Step 3: That's It!

No other configuration needed! The app uses:
- **Nominatim** for geocoding (NO API KEY NEEDED)
- **OpenStreetMap** for map tiles (NO API KEY NEEDED)

---

## ✨ Features (All FREE)

### 1. Interactive Maps
- ✅ Mapbox GL JS (professional quality)
- ✅ Custom markers for users, donors, hospitals
- ✅ Info popups on click
- ✅ Zoom, pan, fullscreen controls

### 2. Address Autocomplete
- ✅ Nominatim-powered search
- ✅ Real-time suggestions as you type
- ✅ Keyboard navigation (arrow keys, enter)
- ✅ NO API KEY REQUIRED

### 3. Geocoding
- ✅ Address → Coordinates
- ✅ Coordinates → Address (reverse geocoding)
- ✅ Unlimited requests
- ✅ NO API KEY REQUIRED

### 4. Distance Calculation
- ✅ Actual driving distance (OpenRouteService)
- ✅ Drive time estimates
- ✅ Fallback to straight-line distance
- ✅ 2,000 requests/day FREE

### 5. Nearby Search
- ✅ Find hospitals within radius
- ✅ Find blood banks nearby
- ✅ NO API KEY REQUIRED

---

## 💰 Cost Comparison

### Google Maps (Paid)
- ❌ $200 free credit/month (then paid)
- ❌ Credit card required
- ❌ Complex pricing
- ❌ API key restrictions

### Our FREE Stack
- ✅ Mapbox: 50,000 loads/month FREE
- ✅ Nominatim: UNLIMITED FREE
- ✅ OpenRouteService: 2,000/day FREE
- ✅ NO credit card required
- ✅ Simple setup

---

## 🧪 Test the Integration

### 1. Start Server
```bash
npm start
```

### 2. Open Browser
```
http://localhost:3000
```

### 3. Test Features

**Address Autocomplete:**
- Type in "Hospital/Location Address" field
- See suggestions appear (powered by Nominatim)
- Select an address

**Map Display:**
- Fill emergency request form
- Submit form
- See Mapbox map with markers

**Distance Calculation:**
- Check donor list shows distance and time
- Powered by OpenRouteService (or straight-line fallback)

**Directions:**
- Click "Directions" button
- Opens OpenStreetMap with route

---

## 📊 Usage Limits

### Nominatim (OpenStreetMap)
- **Requests:** Unlimited
- **Rate Limit:** 1 request per second
- **Cost:** FREE forever
- **Requirements:** Must include User-Agent header (already done)

### Mapbox
- **Map Loads:** 50,000/month FREE
- **After Free Tier:** $5 per 1,000 loads
- **Requirements:** Free account, no credit card

### OpenRouteService
- **Requests:** 2,000/day FREE
- **Rate Limit:** 40/minute
- **After Free Tier:** €49/month for 500,000 requests
- **Requirements:** Free account, no credit card

---

## 🔧 Configuration

### Minimal Setup (Works Out of the Box)

No configuration needed! The app works with:
- Nominatim for geocoding (no key)
- OpenStreetMap for maps (no key)
- Straight-line distance calculation (no key)

### Recommended Setup (Better Experience)

Add to `.env` file:

```env
# Mapbox (Optional - for better maps)
MAPBOX_ACCESS_TOKEN=pk.your_token_here

# OpenRouteService (Optional - for accurate distances)
OPENROUTESERVICE_API_KEY=your_key_here
```

---

## 🐛 Troubleshooting

### Map Not Loading?

**Without Mapbox Token:**
- Map will show basic OpenStreetMap tiles
- Still fully functional

**With Mapbox Token:**
- Check token is correct in `.env`
- Verify token starts with `pk.`
- Check browser console for errors

### Autocomplete Not Working?

**Check:**
- Server is running
- Browser console for errors
- Type at least 3 characters
- Wait 300ms for debounce

**Note:** Nominatim has 1 request/second limit. If typing very fast, some requests may be skipped.

### Distance Shows Straight-Line?

**This is normal when:**
- OpenRouteService API key not configured
- Daily limit exceeded (2,000 requests)
- API temporarily unavailable

**Solution:**
- Add OpenRouteService API key to `.env`
- Check daily usage in dashboard
- Straight-line distance is accurate fallback

---

## 🚀 Deployment

### Environment Variables

```env
# Production .env
MAPBOX_ACCESS_TOKEN=pk.your_production_token
OPENROUTESERVICE_API_KEY=your_production_key
```

### No HTML Changes Needed

Unlike Google Maps, no API keys in HTML files!
All configuration is server-side in `.env`.

---

## 📈 Scaling

### For Higher Traffic

**Mapbox:**
- Free: 50,000 loads/month
- Paid: $5 per 1,000 loads after free tier
- Enterprise: Custom pricing

**OpenRouteService:**
- Free: 2,000 requests/day
- Standard: €49/month for 500,000 requests
- Premium: Custom pricing

**Nominatim:**
- Always free
- For high traffic, consider self-hosting
- Or use commercial providers (Geoapify, LocationIQ)

---

## 🎯 Best Practices

### 1. Respect Rate Limits

**Nominatim:**
- Max 1 request per second
- Include User-Agent header (already done)
- Cache results when possible

**OpenRouteService:**
- Max 40 requests per minute
- Max 2,000 requests per day
- Monitor usage in dashboard

### 2. Cache Results

Store geocoded addresses in database:
```javascript
// Cache donor coordinates after first geocoding
if (!donor.latitude) {
    const location = await geocodeAddress(donor.address);
    // Save to database
}
```

### 3. Monitor Usage

- Check Mapbox dashboard weekly
- Check OpenRouteService dashboard weekly
- Set up alerts for high usage

---

## 🔗 Useful Links

- [Mapbox Documentation](https://docs.mapbox.com/)
- [Nominatim Usage Policy](https://operations.osmfoundation.org/policies/nominatim/)
- [OpenRouteService API Docs](https://openrouteservice.org/dev/#/api-docs)
- [OpenStreetMap](https://www.openstreetmap.org/)

---

## ✅ Advantages Over Google Maps

1. **Cost:** Completely free for most use cases
2. **Setup:** Simpler, no credit card required
3. **Privacy:** No tracking, open source
4. **Limits:** More generous free tiers
5. **Flexibility:** Can self-host if needed

---

## 🎉 Summary

Your Blood Bond application now has:
- ✅ Professional interactive maps (Mapbox)
- ✅ Smart address autocomplete (Nominatim)
- ✅ Accurate distance calculation (OpenRouteService)
- ✅ Turn-by-turn directions (OpenStreetMap)
- ✅ 100% FREE for development
- ✅ Generous free tiers for production
- ✅ No credit card required

**Ready to save lives without breaking the bank! 🩸**

---

**Questions?** The app works out of the box with no configuration. Optional API keys just enhance the experience!
