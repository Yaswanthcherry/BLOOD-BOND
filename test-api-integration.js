// Test script for API integration
// Run with: node test-api-integration.js

require('dotenv').config();
const locationService = require('./services/locationService');

console.log('🧪 Testing Blood Bond API Integration\n');

// Test configuration
const testLocation = {
    lat: 40.7128,
    lng: -74.0060
};

const testDestination = {
    lat: 40.7589,
    lng: -73.9851
};

const testAddress = '1600 Amphitheatre Parkway, Mountain View, CA';

// Color codes for console
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

function log(message, color = 'reset') {
    console.log(colors[color] + message + colors.reset);
}

async function testAPIs() {
    let passedTests = 0;
    let totalTests = 0;

    // Test 1: Environment Variables
    console.log('📋 Test 1: Checking Environment Variables');
    totalTests++;
    
    const googleKey = process.env.GOOGLE_MAPS_API_KEY;
    const orsKey = process.env.OPENROUTESERVICE_API_KEY;
    
    if (googleKey && googleKey !== 'your_google_maps_api_key') {
        log('  ✅ Google Maps API key found', 'green');
        passedTests++;
    } else {
        log('  ❌ Google Maps API key not configured', 'red');
        log('     Add GOOGLE_MAPS_API_KEY to .env file', 'yellow');
    }
    
    if (orsKey && orsKey !== 'your_openrouteservice_api_key') {
        log('  ✅ OpenRouteService API key found', 'green');
    } else {
        log('  ⚠️  OpenRouteService API key not configured (will use fallback)', 'yellow');
    }
    
    console.log('');

    // Test 2: Geocoding
    console.log('📍 Test 2: Geocoding Address');
    totalTests++;
    
    try {
        const location = await locationService.geocodeAddress(testAddress);
        if (location && location.lat && location.lng) {
            log('  ✅ Geocoding successful', 'green');
            log(`     Address: ${location.formattedAddress}`, 'blue');
            log(`     Coordinates: ${location.lat}, ${location.lng}`, 'blue');
            passedTests++;
        } else {
            log('  ❌ Geocoding failed - no location returned', 'red');
        }
    } catch (error) {
        log('  ❌ Geocoding error: ' + error.message, 'red');
    }
    
    console.log('');

    // Test 3: Driving Route Calculation
    console.log('🚗 Test 3: Calculating Driving Route');
    totalTests++;
    
    try {
        const route = await locationService.calculateDrivingRoute(testLocation, testDestination);
        if (route && route.distance && route.duration) {
            log('  ✅ Route calculation successful', 'green');
            log(`     Distance: ${route.distance} km`, 'blue');
            log(`     Duration: ${route.duration} minutes`, 'blue');
            log(`     Type: ${route.type}`, 'blue');
            passedTests++;
        } else {
            log('  ❌ Route calculation failed', 'red');
        }
    } catch (error) {
        log('  ❌ Route calculation error: ' + error.message, 'red');
    }
    
    console.log('');

    // Test 4: Nearby Places Search
    console.log('🏥 Test 4: Searching Nearby Hospitals');
    totalTests++;
    
    try {
        const places = await locationService.searchNearbyPlaces(testLocation, 'hospital', 5000);
        if (places && places.length > 0) {
            log('  ✅ Nearby search successful', 'green');
            log(`     Found ${places.length} hospitals within 5km`, 'blue');
            log(`     Example: ${places[0].name}`, 'blue');
            passedTests++;
        } else {
            log('  ⚠️  No hospitals found (may need valid API key)', 'yellow');
        }
    } catch (error) {
        log('  ❌ Nearby search error: ' + error.message, 'red');
    }
    
    console.log('');

    // Test 5: Donor Distance Calculation
    console.log('👥 Test 5: Calculating Donor Distances');
    totalTests++;
    
    const mockDonors = [
        {
            id: 1,
            name: 'John Doe',
            blood_type: 'O+',
            address: '123 Main St, New York, NY'
        },
        {
            id: 2,
            name: 'Jane Smith',
            blood_type: 'A+',
            address: '456 Park Ave, New York, NY'
        }
    ];
    
    try {
        const donorsWithDistance = await locationService.calculateDonorDistances(testLocation, mockDonors);
        if (donorsWithDistance && donorsWithDistance.length > 0) {
            log('  ✅ Donor distance calculation successful', 'green');
            donorsWithDistance.forEach(donor => {
                if (donor.distance) {
                    log(`     ${donor.name}: ${donor.distance} km, ~${donor.duration} min`, 'blue');
                }
            });
            passedTests++;
        } else {
            log('  ❌ Donor distance calculation failed', 'red');
        }
    } catch (error) {
        log('  ❌ Donor distance error: ' + error.message, 'red');
    }
    
    console.log('');

    // Summary
    console.log('═'.repeat(50));
    console.log('📊 Test Summary');
    console.log('═'.repeat(50));
    
    const percentage = Math.round((passedTests / totalTests) * 100);
    const status = percentage === 100 ? '🎉 All tests passed!' : 
                   percentage >= 60 ? '⚠️  Some tests failed' : 
                   '❌ Most tests failed';
    
    log(`\n${status}`, percentage === 100 ? 'green' : percentage >= 60 ? 'yellow' : 'red');
    log(`Passed: ${passedTests}/${totalTests} (${percentage}%)`, 'blue');
    
    console.log('\n📝 Next Steps:');
    
    if (passedTests === totalTests) {
        log('  ✅ All APIs are working correctly!', 'green');
        log('  ✅ You can start using the application', 'green');
        log('  ✅ Run: node server.js', 'blue');
    } else {
        if (!googleKey || googleKey === 'your_google_maps_api_key') {
            log('  1. Add GOOGLE_MAPS_API_KEY to .env file', 'yellow');
            log('     See API_SETUP_GUIDE.md for instructions', 'yellow');
        }
        if (!orsKey || orsKey === 'your_openrouteservice_api_key') {
            log('  2. Add OPENROUTESERVICE_API_KEY to .env file (optional)', 'yellow');
            log('     App will use fallback distance calculation', 'yellow');
        }
        log('  3. Update API keys in index.html and dashboard.html', 'yellow');
        log('  4. Run this test again: node test-api-integration.js', 'yellow');
    }
    
    console.log('\n📚 Documentation:');
    log('  - Quick Setup: QUICK_API_SETUP.md', 'blue');
    log('  - Full Guide: API_SETUP_GUIDE.md', 'blue');
    log('  - API Usage: API_USAGE_REFERENCE.md', 'blue');
    
    console.log('');
}

// Run tests
testAPIs().catch(error => {
    log('\n❌ Fatal error running tests:', 'red');
    console.error(error);
    process.exit(1);
});
