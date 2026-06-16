# Blood Bond - Enhanced Architecture with API Integration

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          BLOOD BOND APPLICATION                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND LAYER                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │
│  │  index.html  │  │dashboard.html│  │  styles.css  │                │
│  │              │  │              │  │              │                │
│  │ - Emergency  │  │ - Donor Reg  │  │ - Styling    │                │
│  │   Request    │  │ - Profile    │  │ - Responsive │                │
│  │ - Map View   │  │ - History    │  │ - Buttons    │                │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘                │
│         │                  │                                            │
│         └──────────┬───────┘                                            │
│                    │                                                    │
│  ┌─────────────────▼────────────────────────────────────────────┐     │
│  │                    JAVASCRIPT LAYER                          │     │
│  ├──────────────────────────────────────────────────────────────┤     │
│  │                                                              │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │     │
│  │  │   app.js     │  │dashboard.js  │  │map-service.js│     │     │
│  │  │              │  │              │  │              │     │     │
│  │  │ - Form       │  │ - Donor Mgmt │  │ - Google Maps│     │     │
│  │  │   Handling   │  │ - Profile    │  │ - Markers    │     │     │
│  │  │ - Search     │  │ - Donations  │  │ - Routes     │     │     │
│  │  │ - Display    │  │ - Stats      │  │ - Info Win   │     │     │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │     │
│  │         │                  │                  │             │     │
│  │         └──────────────────┼──────────────────┘             │     │
│  │                            │                                │     │
│  └────────────────────────────┼────────────────────────────────┘     │
│                               │                                       │
└───────────────────────────────┼───────────────────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   EXTERNAL APIs       │
                    │   (Client-Side)       │
                    ├───────────────────────┤
                    │                       │
                    │  ┌─────────────────┐ │
                    │  │  Google Maps    │ │
                    │  │  JavaScript API │ │
                    │  │                 │ │
                    │  │ - Map Display   │ │
                    │  │ - Markers       │ │
                    │  │ - Directions    │ │
                    │  └─────────────────┘ │
                    │                       │
                    │  ┌─────────────────┐ │
                    │  │ Google Places   │ │
                    │  │      API        │ │
                    │  │                 │ │
                    │  │ - Autocomplete  │ │
                    │  │ - Nearby Search │ │
                    │  └─────────────────┘ │
                    │                       │
                    └───────────────────────┘
                                │
                                │ HTTP Requests
                                │
┌───────────────────────────────▼───────────────────────────────────────┐
│                          BACKEND LAYER                                │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                      server.js                              │    │
│  │                   (Express.js Server)                       │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │                                                             │    │
│  │  API ENDPOINTS:                                             │    │
│  │  ┌──────────────────────────────────────────────────────┐  │    │
│  │  │ /api/donors                  - Donor CRUD            │  │    │
│  │  │ /api/emergency-request       - Search & Notify       │  │    │
│  │  │ /api/blood-banks             - Blood Bank Info       │  │    │
│  │  │ /api/location/nearby-places  - Search Places         │  │    │
│  │  │ /api/location/calculate-route- Calculate Distance    │  │    │
│  │  │ /api/location/geocode        - Address → Coords      │  │    │
│  │  │ /api/location/place-details  - Place Information     │  │    │
│  │  └──────────────────────────────────────────────────────┘  │    │
│  │                                                             │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                │                                     │
│                    ┌───────────┴───────────┐                         │
│                    │                       │                         │
│  ┌─────────────────▼──────┐  ┌────────────▼──────────────┐          │
│  │   SERVICES LAYER       │  │   EXTERNAL APIs           │          │
│  ├────────────────────────┤  │   (Server-Side)           │          │
│  │                        │  ├───────────────────────────┤          │
│  │ ┌──────────────────┐  │  │                           │          │
│  │ │ locationService  │  │  │ ┌───────────────────────┐ │          │
│  │ │                  │  │  │ │ Google Geocoding API  │ │          │
│  │ │ - Geocoding      │◄─┼──┼─┤                       │ │          │
│  │ │ - Route Calc     │  │  │ │ - Address → Coords    │ │          │
│  │ │ - Nearby Search  │  │  │ └───────────────────────┘ │          │
│  │ │ - Donor Distance │  │  │                           │          │
│  │ └──────────────────┘  │  │ ┌───────────────────────┐ │          │
│  │                        │  │ │ Google Places API     │ │          │
│  │ ┌──────────────────┐  │  │ │                       │ │          │
│  │ │notificationService│◄─┼──┼─┤ - Nearby Search       │ │          │
│  │ │                  │  │  │ │ - Place Details       │ │          │
│  │ │ - Email          │  │  │ └───────────────────────┘ │          │
│  │ │ - SMS            │  │  │                           │          │
│  │ │ - Push           │  │  │ ┌───────────────────────┐ │          │
│  │ └──────────────────┘  │  │ │ OpenRouteService API  │ │          │
│  │                        │  │ │                       │ │          │
│  │ ┌──────────────────┐  │  │ │ - Driving Routes      │ │          │
│  │ │   fcmService     │  │  │ │ - Distance Calc       │ │          │
│  │ │                  │  │  │ │ - Time Estimates      │ │          │
│  │ │ - Push Tokens    │  │  │ └───────────────────────┘ │          │
│  │ │ - Notifications  │  │  │                           │          │
│  │ └──────────────────┘  │  └───────────────────────────┘          │
│  │                        │                                         │
│  └────────────────────────┘                                         │
│                    │                                                 │
│  ┌─────────────────▼──────────────────────────────────────┐         │
│  │                  DATABASE LAYER                        │         │
│  ├────────────────────────────────────────────────────────┤         │
│  │                                                        │         │
│  │  ┌──────────────────────────────────────────────┐    │         │
│  │  │         SQLite Database                      │    │         │
│  │  │         (blood_donors.db)                    │    │         │
│  │  ├──────────────────────────────────────────────┤    │         │
│  │  │                                              │    │         │
│  │  │  TABLES:                                     │    │         │
│  │  │  ┌────────────────────────────────────────┐ │    │         │
│  │  │  │ donors                                 │ │    │         │
│  │  │  │ - id, name, blood_type, phone, email  │ │    │         │
│  │  │  │ - address, age, weight, fcm_token     │ │    │         │
│  │  │  │ - last_donation_date, created_at      │ │    │         │
│  │  │  └────────────────────────────────────────┘ │    │         │
│  │  │                                              │    │         │
│  │  │  ┌────────────────────────────────────────┐ │    │         │
│  │  │  │ donations                              │ │    │         │
│  │  │  │ - id, donor_id, donation_date         │ │    │         │
│  │  │  │ - location, units, created_at         │ │    │         │
│  │  │  └────────────────────────────────────────┘ │    │         │
│  │  │                                              │    │         │
│  │  │  ┌────────────────────────────────────────┐ │    │         │
│  │  │  │ blood_banks                            │ │    │         │
│  │  │  │ - id, name, phone, address            │ │    │         │
│  │  │  │ - latitude, longitude, created_at     │ │    │         │
│  │  │  └────────────────────────────────────────┘ │    │         │
│  │  │                                              │    │         │
│  │  │  ┌────────────────────────────────────────┐ │    │         │
│  │  │  │ blood_inventory                        │ │    │         │
│  │  │  │ - id, blood_bank_id, blood_type       │ │    │         │
│  │  │  │ - status, units_available             │ │    │         │
│  │  │  └────────────────────────────────────────┘ │    │         │
│  │  │                                              │    │         │
│  │  └──────────────────────────────────────────────┘    │         │
│  │                                                        │         │
│  └────────────────────────────────────────────────────────┘         │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

## Data Flow: Emergency Blood Request

```
┌─────────────────────────────────────────────────────────────────────┐
│                    EMERGENCY REQUEST FLOW                           │
└─────────────────────────────────────────────────────────────────────┘

1. USER INPUT
   ┌──────────────────────────────────────┐
   │ User fills emergency request form:   │
   │ - Patient name                       │
   │ - Blood type                         │
   │ - Hospital address (autocomplete)    │◄─── Google Places API
   │ - Contact info                       │
   │ - Hospital report (file)             │
   └──────────────┬───────────────────────┘
                  │
                  ▼
2. ADDRESS GEOCODING
   ┌──────────────────────────────────────┐
   │ Selected address → Coordinates       │◄─── Google Geocoding API
   │ "123 Main St" → {lat: 40.7, lng: -74}│
   └──────────────┬───────────────────────┘
                  │
                  ▼
3. DONOR SEARCH
   ┌──────────────────────────────────────┐
   │ Backend searches database:           │
   │ - Compatible blood types             │
   │ - Eligible donors (30+ days)         │
   │ - Returns donor list                 │
   └──────────────┬───────────────────────┘
                  │
                  ▼
4. DISTANCE CALCULATION
   ┌──────────────────────────────────────┐
   │ For each donor:                      │
   │ 1. Geocode donor address             │◄─── Google Geocoding API
   │ 2. Calculate driving route           │◄─── OpenRouteService API
   │ 3. Get distance & time               │
   │ 4. Sort by distance                  │
   └──────────────┬───────────────────────┘
                  │
                  ▼
5. NOTIFICATIONS
   ┌──────────────────────────────────────┐
   │ Send alerts to matched donors:       │
   │ - Email notifications                │◄─── Gmail SMTP
   │ - SMS notifications                  │◄─── Twilio API
   │ - Push notifications                 │◄─── Firebase FCM
   └──────────────┬───────────────────────┘
                  │
                  ▼
6. RESULTS DISPLAY
   ┌──────────────────────────────────────┐
   │ Frontend displays:                   │
   │ - Google Map with markers            │◄─── Google Maps API
   │ - Donor list with distances          │
   │ - Blood bank locations               │
   │ - Directions buttons                 │
   └──────────────────────────────────────┘
```

## API Integration Points

```
┌─────────────────────────────────────────────────────────────────────┐
│                      API INTEGRATION MATRIX                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  FEATURE                    │  API USED              │  LOCATION   │
│  ──────────────────────────────────────────────────────────────────│
│                                                                     │
│  Address Autocomplete       │  Google Places         │  Frontend   │
│  Map Display                │  Google Maps JS        │  Frontend   │
│  Custom Markers             │  Google Maps JS        │  Frontend   │
│  Route Visualization        │  Google Maps JS        │  Frontend   │
│  Info Windows               │  Google Maps JS        │  Frontend   │
│                                                                     │
│  Address → Coordinates      │  Google Geocoding      │  Backend    │
│  Nearby Hospital Search     │  Google Places         │  Backend    │
│  Place Details              │  Google Places         │  Backend    │
│  Driving Distance           │  OpenRouteService      │  Backend    │
│  Drive Time Estimate        │  OpenRouteService      │  Backend    │
│                                                                     │
│  Email Notifications        │  Gmail SMTP            │  Backend    │
│  SMS Notifications          │  Twilio                │  Backend    │
│  Push Notifications         │  Firebase FCM          │  Backend    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TECHNOLOGY STACK                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  FRONTEND                                                           │
│  ├─ HTML5, CSS3, JavaScript (ES6+)                                 │
│  ├─ Google Maps JavaScript API                                     │
│  ├─ Google Places API (Autocomplete)                               │
│  └─ Firebase SDK (Push Notifications)                              │
│                                                                     │
│  BACKEND                                                            │
│  ├─ Node.js + Express.js                                           │
│  ├─ SQLite3 (Database)                                             │
│  ├─ dotenv (Environment Variables)                                 │
│  └─ CORS (Cross-Origin Resource Sharing)                           │
│                                                                     │
│  EXTERNAL APIS                                                      │
│  ├─ Google Maps API (Mapping)                                      │
│  ├─ Google Places API (Location Search)                            │
│  ├─ Google Geocoding API (Address Conversion)                      │
│  ├─ OpenRouteService API (Route Calculation)                       │
│  ├─ Twilio API (SMS)                                               │
│  ├─ Gmail SMTP (Email)                                             │
│  └─ Firebase FCM (Push Notifications)                              │
│                                                                     │
│  DEVELOPMENT TOOLS                                                  │
│  ├─ npm (Package Manager)                                          │
│  ├─ nodemon (Auto-restart)                                         │
│  └─ Git (Version Control)                                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SECURITY MEASURES                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  API KEY PROTECTION                                                 │
│  ├─ Environment Variables (.env file)                              │
│  ├─ .gitignore (Never commit .env)                                 │
│  ├─ HTTP Referrer Restrictions                                     │
│  └─ API Scope Restrictions                                         │
│                                                                     │
│  DATA VALIDATION                                                    │
│  ├─ Form Input Validation                                          │
│  ├─ File Type Validation                                           │
│  ├─ File Size Limits (5MB)                                         │
│  └─ SQL Injection Prevention                                       │
│                                                                     │
│  AUTHENTICATION                                                     │
│  ├─ Email Verification                                             │
│  ├─ Emergency Confirmation Checkbox                                │
│  └─ Hospital Report Requirement                                    │
│                                                                     │
│  RATE LIMITING                                                      │
│  ├─ API Request Throttling                                         │
│  ├─ Daily Quota Monitoring                                         │
│  └─ Billing Alerts                                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Performance Optimization

```
┌─────────────────────────────────────────────────────────────────────┐
│                   PERFORMANCE OPTIMIZATIONS                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  FRONTEND                                                           │
│  ├─ Async Script Loading (Google Maps)                             │
│  ├─ Lazy Map Initialization                                        │
│  ├─ Marker Clustering (Future)                                     │
│  └─ Debounced Autocomplete                                         │
│                                                                     │
│  BACKEND                                                            │
│  ├─ Parallel Distance Calculations                                 │
│  ├─ Database Indexing                                              │
│  ├─ Caching Geocoded Addresses (Future)                            │
│  └─ Connection Pooling                                             │
│                                                                     │
│  API USAGE                                                          │
│  ├─ Batch Requests Where Possible                                  │
│  ├─ Fallback to Straight-Line Distance                             │
│  ├─ Cache API Responses (Future)                                   │
│  └─ Request Deduplication                                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

**Last Updated:** 2024  
**Version:** 1.0  
**Architecture:** Microservices with External API Integration
