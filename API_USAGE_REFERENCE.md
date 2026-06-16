# API Usage Reference

Quick reference for using the integrated mapping and location APIs in Blood Bond.

## 📍 Location Service (Backend)

Located in: `services/locationService.js`

### Calculate Driving Route

```javascript
const locationService = require('./services/locationService');

const origin = { lat: 40.7128, lng: -74.0060 };
const destination = { lat: 40.7589, lng: -73.9851 };

const route = await locationService.calculateDrivingRoute(origin, destination);
// Returns: { distance: "5.2", duration: 12, type: "driving" }
```

### Search Nearby Places

```javascript
const location = { lat: 40.7128, lng: -74.0060 };
const places = await locationService.searchNearbyPlaces(location, 'hospital', 5000);
// Returns array of nearby hospitals within 5km
```

### Geocode Address

```javascript
const location = await locationService.geocodeAddress('123 Main St, New York, NY');
// Returns: { lat: 40.7128, lng: -74.0060, formattedAddress: "..." }
```

### Calculate Donor Distances

```javascript
const userLocation = { lat: 40.7128, lng: -74.0060 };
const donors = [...]; // Array of donor objects

const donorsWithDistance = await locationService.calculateDonorDistances(userLocation, donors);
// Returns donors sorted by distance with distance and duration added
```

---

## 🗺️ Map Service (Frontend)

Located in: `map-service.js`

### Initialize Map

```javascript
const mapService = new MapService();
const center = { lat: 40.7128, lng: -74.0060 };

await mapService.initializeGoogleMap('map', center, 13);
```

### Add Markers

```javascript
// User location marker
mapService.addMarker(
    { lat: 40.7128, lng: -74.0060 },
    'Your Location',
    mapService.getMarkerIcon('user'),
    '<div>Your Location</div>'
);

// Donor marker
mapService.addMarker(
    { lat: 40.7589, lng: -73.9851 },
    'John Doe',
    mapService.getMarkerIcon('donor'),
    '<div><strong>John Doe</strong><br/>O+ Blood Type</div>'
);

// Hospital marker
mapService.addMarker(
    { lat: 40.7614, lng: -73.9776 },
    'City Hospital',
    mapService.getMarkerIcon('hospital'),
    '<div><strong>City Hospital</strong></div>'
);
```

### Calculate and Display Route

```javascript
const origin = { lat: 40.7128, lng: -74.0060 };
const destination = { lat: 40.7589, lng: -73.9851 };

const route = await mapService.calculateRoute(origin, destination);
// Returns: { distance: "5.2 km", duration: "12 mins", ... }
// Also displays route on map
```

### Search Nearby Places

```javascript
const location = { lat: 40.7128, lng: -74.0060 };
const hospitals = await mapService.searchNearbyPlaces(location, 'hospital', 5000);
```

### Fit Map to Markers

```javascript
const locations = [
    { lat: 40.7128, lng: -74.0060 },
    { lat: 40.7589, lng: -73.9851 },
    { lat: 40.7614, lng: -73.9776 }
];

mapService.fitBounds(locations);
```

### Clear All Markers

```javascript
mapService.clearMarkers();
```

---

## 🏥 Address Autocomplete (Frontend)

### Initialize Autocomplete

```javascript
const autocomplete = initializeAddressAutocomplete('address-input-id', (place) => {
    console.log('Selected place:', place);
    console.log('Address:', place.formatted_address);
    console.log('Location:', place.geometry.location);
});
```

### Example in HTML

```html
<input type="text" id="hospital-address" placeholder="Start typing address...">

<script>
    initializeAddressAutocomplete('hospital-address', (place) => {
        if (place.geometry) {
            const location = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                address: place.formatted_address
            };
            // Use location for search
        }
    });
</script>
```

---

## 🔌 Backend API Endpoints

### POST /api/location/nearby-places

Search for nearby hospitals or blood banks.

```javascript
fetch('/api/location/nearby-places', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        location: { lat: 40.7128, lng: -74.0060 },
        type: 'hospital',
        radius: 5000
    })
})
.then(res => res.json())
.then(data => console.log(data.places));
```

### POST /api/location/calculate-route

Calculate driving route between two points.

```javascript
fetch('/api/location/calculate-route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        origin: { lat: 40.7128, lng: -74.0060 },
        destination: { lat: 40.7589, lng: -73.9851 }
    })
})
.then(res => res.json())
.then(data => console.log(data.route));
```

### POST /api/location/geocode

Convert address to coordinates.

```javascript
fetch('/api/location/geocode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        address: '123 Main St, New York, NY'
    })
})
.then(res => res.json())
.then(data => console.log(data.location));
```

### GET /api/location/place-details/:placeId

Get detailed information about a place.

```javascript
fetch('/api/location/place-details/ChIJN1t_tDeuEmsRUsoyG83frY4')
    .then(res => res.json())
    .then(data => console.log(data.details));
```

---

## 🎨 Custom Marker Icons

Available marker types:
- `user` - Blue circle for user location
- `donor` - Red heart for blood donors
- `hospital` - Green cross for hospitals/blood banks

```javascript
const icon = mapService.getMarkerIcon('donor');
```

---

## 📊 Data Flow Example

### Emergency Blood Request Flow

1. **User enters address** → Google Places Autocomplete suggests addresses
2. **User submits form** → Address geocoded to coordinates
3. **Backend searches donors** → Compatible donors retrieved from database
4. **Calculate distances** → OpenRouteService calculates driving distance/time for each donor
5. **Display results** → Google Maps shows all locations with markers
6. **User clicks directions** → Google Maps Directions API shows route

```javascript
// Complete flow in app.js
async function handleEmergencyRequest(e) {
    e.preventDefault();
    
    // 1. Get location from autocomplete or geolocation
    const userLocation = await getUserLocation();
    
    // 2. Search for donors
    const response = await fetch('/api/emergency-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            bloodType: 'O+',
            userLocation: userLocation
        })
    });
    
    const { donors } = await response.json();
    // donors now include distance and duration
    
    // 3. Display on map
    initializeMap();
    displayDonors(donors); // Adds markers automatically
}
```

---

## 🔧 Configuration

### Environment Variables

```env
GOOGLE_MAPS_API_KEY=your_key_here
OPENROUTESERVICE_API_KEY=your_key_here
```

### HTML Script Tags

```html
<!-- index.html -->
<script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_KEY&libraries=places&callback=initMap"></script>

<!-- dashboard.html -->
<script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_KEY&libraries=places"></script>
```

---

## 🚨 Error Handling

### Fallback Behavior

If APIs are unavailable, the system automatically falls back to:
- **Straight-line distance** instead of driving distance
- **Estimated time** based on 40 km/h average speed
- **Basic geocoding** using browser geolocation

### Check API Status

```javascript
// Backend logs will show:
console.log('⚠️  OpenRouteService API key not configured, using straight-line distance');
console.log('⚠️  Google Maps API key not configured');
```

---

## 📈 Performance Tips

1. **Cache geocoded addresses** in database to avoid repeated API calls
2. **Batch distance calculations** for multiple donors
3. **Limit search radius** to reduce API calls
4. **Store donor coordinates** in database after first geocoding
5. **Use map clustering** for many markers (future enhancement)

---

## 🔗 Useful Links

- [Google Maps JavaScript API Docs](https://developers.google.com/maps/documentation/javascript)
- [Google Places API Docs](https://developers.google.com/maps/documentation/places/web-service)
- [OpenRouteService API Docs](https://openrouteservice.org/dev/#/api-docs)
- [Leaflet Documentation](https://leafletjs.com/reference.html) (fallback)

---

**Need help? Check the server console logs for detailed error messages!**
