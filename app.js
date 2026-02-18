// Blood Agent Application
let map;
let userLocation = null;
let markers = [];

// Mock data for demonstration
const mockDonors = [
    { id: 1, name: "John Smith", bloodType: "O+", phone: "+1234567890", email: "john@example.com", lat: 0, lng: 0, distance: 0 },
    { id: 2, name: "Sarah Johnson", bloodType: "A+", phone: "+1234567891", email: "sarah@example.com", lat: 0, lng: 0, distance: 0 },
    { id: 3, name: "Michael Brown", bloodType: "B+", phone: "+1234567892", email: "michael@example.com", lat: 0, lng: 0, distance: 0 },
    { id: 4, name: "Emily Davis", bloodType: "AB+", phone: "+1234567893", email: "emily@example.com", lat: 0, lng: 0, distance: 0 },
    { id: 5, name: "David Wilson", bloodType: "O-", phone: "+1234567894", email: "david@example.com", lat: 0, lng: 0, distance: 0 }
];

const mockBloodBanks = [
    { 
        id: 1, 
        name: "City General Hospital Blood Bank", 
        phone: "+1234567800", 
        address: "123 Medical Center Dr",
        lat: 0, 
        lng: 0, 
        distance: 0,
        availability: {
            "A+": "available", "A-": "limited", "B+": "available", "B-": "unavailable",
            "AB+": "limited", "AB-": "unavailable", "O+": "available", "O-": "limited"
        }
    },
    { 
        id: 2, 
        name: "Regional Medical Center", 
        phone: "+1234567801", 
        address: "456 Healthcare Ave",
        lat: 0, 
        lng: 0, 
        distance: 0,
        availability: {
            "A+": "available", "A-": "available", "B+": "limited", "B-": "limited",
            "AB+": "available", "AB-": "limited", "O+": "available", "O-": "available"
        }
    },
    { 
        id: 3, 
        name: "Community Blood Center", 
        phone: "+1234567802", 
        address: "789 Donor Plaza",
        lat: 0, 
        lng: 0, 
        distance: 0,
        availability: {
            "A+": "limited", "A-": "unavailable", "B+": "available", "B-": "limited",
            "AB+": "unavailable", "AB-": "unavailable", "O+": "available", "O-": "limited"
        }
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const verificationForm = document.getElementById('verification-form');
    const newSearchBtn = document.getElementById('new-search-btn');

    verificationForm.addEventListener('submit', handleVerification);
    newSearchBtn.addEventListener('click', resetSearch);
});

// Handle verification form submission
function handleVerification(e) {
    e.preventDefault();
    
    const reportFile = document.getElementById('hospital-report').files[0];
    const patientName = document.getElementById('patient-name').value;
    const bloodType = document.getElementById('blood-type').value;
    const emergencyContact = document.getElementById('emergency-contact').value;

    if (!reportFile) {
        alert('Please upload a valid hospital report');
        return;
    }

    // Simulate verification process
    alert('Verifying hospital report...');
    
    // Get user location
    getUserLocation(bloodType);
}

// Get user's current location
function getUserLocation(bloodType) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                showResults(bloodType);
            },
            (error) => {
                console.error('Error getting location:', error);
                // Use default location for demo
                userLocation = { lat: 40.7128, lng: -74.0060 }; // New York
                showResults(bloodType);
            }
        );
    } else {
        alert('Geolocation is not supported by your browser');
        userLocation = { lat: 40.7128, lng: -74.0060 };
        showResults(bloodType);
    }
}

// Show search results
function showResults(bloodType) {
    document.getElementById('verification-section').classList.add('hidden');
    document.getElementById('results-section').classList.remove('hidden');

    // Initialize map
    initializeMap();

    // Filter and display donors
    const filteredDonors = filterDonorsByBloodType(bloodType);
    displayDonors(filteredDonors);

    // Display blood banks
    displayBloodBanks(bloodType);
}

// Initialize Leaflet map
function initializeMap() {
    map = L.map('map').setView([userLocation.lat, userLocation.lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add user location marker
    const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: L.divIcon({
            className: 'user-marker',
            html: '<div style="background: #dc143c; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white;"></div>',
            iconSize: [20, 20]
        })
    }).addTo(map);
    userMarker.bindPopup('Your Location').openPopup();
    markers.push(userMarker);
}

// Filter donors by compatible blood types
function filterDonorsByBloodType(requestedType) {
    const compatibilityMap = {
        "O-": ["O-"],
        "O+": ["O-", "O+"],
        "A-": ["O-", "A-"],
        "A+": ["O-", "O+", "A-", "A+"],
        "B-": ["O-", "B-"],
        "B+": ["O-", "O+", "B-", "B+"],
        "AB-": ["O-", "A-", "B-", "AB-"],
        "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"]
    };

    const compatibleTypes = compatibilityMap[requestedType] || [];
    
    // Get registered donors from localStorage
    let registeredDonors = JSON.parse(localStorage.getItem('availableDonors') || '[]');
    
    // If no registered donors, use mock data
    if (registeredDonors.length === 0) {
        registeredDonors = mockDonors;
    }
    
    // Filter by blood type compatibility and check 30-day eligibility
    return registeredDonors
        .filter(donor => {
            // Check blood type compatibility
            if (!compatibleTypes.includes(donor.bloodType)) return false;
            
            // Check 30-day eligibility
            if (donor.lastDonationDate) {
                const lastDonation = new Date(donor.lastDonationDate);
                const today = new Date();
                const daysSince = Math.floor((today - lastDonation) / (1000 * 60 * 60 * 24));
                return daysSince >= 30; // Only show eligible donors
            }
            
            return true; // No previous donation, eligible
        })
        .map(donor => {
            const randomOffset = () => (Math.random() - 0.5) * 0.05;
            donor.lat = userLocation.lat + randomOffset();
            donor.lng = userLocation.lng + randomOffset();
            donor.distance = calculateDistance(userLocation.lat, userLocation.lng, donor.lat, donor.lng);
            return donor;
        })
        .sort((a, b) => a.distance - b.distance);
}

// Display donors on map and list
function displayDonors(donors) {
    const donorsList = document.getElementById('donors-list');
    donorsList.innerHTML = '';

    if (donors.length === 0) {
        donorsList.innerHTML = '<p class="info-text">No compatible donors found nearby. Checking blood banks...</p>';
        return;
    }

    donors.forEach(donor => {
        // Add marker to map
        const marker = L.marker([donor.lat, donor.lng]).addTo(map);
        marker.bindPopup(`<b>${donor.name}</b><br>Blood Type: ${donor.bloodType}<br>${donor.distance.toFixed(2)} km away`);
        markers.push(marker);

        // Add to list
        const donorCard = document.createElement('div');
        donorCard.className = 'donor-card';
        donorCard.innerHTML = `
            <div class="donor-name">${donor.name}</div>
            <span class="blood-type-badge">${donor.bloodType}</span>
            <span class="distance">${donor.distance.toFixed(2)} km away</span>
            <div class="contact-info">
                <p>📞 <a href="tel:${donor.phone}">${donor.phone}</a></p>
                <p>✉️ <a href="mailto:${donor.email}">${donor.email}</a></p>
            </div>
        `;
        donorsList.appendChild(donorCard);
    });
}

// Display blood banks
function displayBloodBanks(requestedBloodType) {
    const bloodBanksList = document.getElementById('blood-banks-list');
    bloodBanksList.innerHTML = '';

    const banksWithDistance = mockBloodBanks.map(bank => {
        const randomOffset = () => (Math.random() - 0.5) * 0.08;
        bank.lat = userLocation.lat + randomOffset();
        bank.lng = userLocation.lng + randomOffset();
        bank.distance = calculateDistance(userLocation.lat, userLocation.lng, bank.lat, bank.lng);
        return bank;
    }).sort((a, b) => a.distance - b.distance);

    banksWithDistance.forEach(bank => {
        // Add marker to map
        const marker = L.marker([bank.lat, bank.lng], {
            icon: L.divIcon({
                className: 'bank-marker',
                html: '<div style="background: #0077be; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white;"></div>',
                iconSize: [15, 15]
            })
        }).addTo(map);
        marker.bindPopup(`<b>${bank.name}</b><br>${bank.distance.toFixed(2)} km away`);
        markers.push(marker);

        // Add to list
        const bankCard = document.createElement('div');
        bankCard.className = 'bank-card';
        
        const availabilityHTML = Object.entries(bank.availability)
            .map(([type, status]) => {
                const highlight = type === requestedBloodType ? 'style="font-weight: bold; font-size: 1.1em;"' : '';
                return `<span class="availability-badge ${status}" ${highlight}>${type}</span>`;
            })
            .join('');

        bankCard.innerHTML = `
            <div class="bank-name">${bank.name}</div>
            <span class="distance">${bank.distance.toFixed(2)} km away</span>
            <div class="contact-info">
                <p>📍 ${bank.address}</p>
                <p>📞 <a href="tel:${bank.phone}">${bank.phone}</a></p>
            </div>
            <div class="availability">
                <strong>Blood Availability:</strong><br>
                ${availabilityHTML}
            </div>
        `;
        bloodBanksList.appendChild(bankCard);
    });
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Reset search
function resetSearch() {
    document.getElementById('verification-section').classList.remove('hidden');
    document.getElementById('results-section').classList.add('hidden');
    document.getElementById('verification-form').reset();
    
    // Clear map markers
    if (map) {
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
        map.remove();
        map = null;
    }
}
