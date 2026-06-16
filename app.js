// Blood Bond Application
let map;
let mapService;
let userLocation = null;
let markers = [];
let addressAutocomplete = null;

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    console.log('🩸 Blood Bond App Initialized');
    setupEventListeners();
    
    // Initialize address autocomplete (Nominatim - FREE)
    addressAutocomplete = initializeAddressAutocomplete('hospital-address', handlePlaceSelected);
});

// Setup event listeners
function setupEventListeners() {
    // Emergency form submission
    const emergencyForm = document.getElementById('emergency-form');
    if (emergencyForm) {
        emergencyForm.addEventListener('submit', handleEmergencyRequest);
    }

    // File upload area
    const fileUploadArea = document.getElementById('file-upload-area');
    const fileInput = document.getElementById('hospital-report');
    
    if (fileUploadArea && fileInput) {
        // Click to upload
        fileUploadArea.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('File upload area clicked');
            fileInput.click();
        });
        
        // Drag over
        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            fileUploadArea.style.borderColor = '#dc2626';
            fileUploadArea.style.background = '#fef2f2';
        });
        
        // Drag leave
        fileUploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            fileUploadArea.style.borderColor = '#d1d5db';
            fileUploadArea.style.background = '#f9fafb';
        });
        
        // Drop
        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            fileUploadArea.style.borderColor = '#d1d5db';
            fileUploadArea.style.background = '#f9fafb';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(files[0]);
                fileInput.files = dataTransfer.files;
                
                const event = new Event('change', { bubbles: true });
                fileInput.dispatchEvent(event);
            }
        });
        
        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                const file = e.target.files[0];
                
                // Validate file size (5MB max)
                const maxSize = 5 * 1024 * 1024;
                if (file.size > maxSize) {
                    alert('File size exceeds 5MB. Please choose a smaller file.');
                    fileInput.value = '';
                    return;
                }
                
                // Validate file type
                const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
                if (!allowedTypes.includes(file.type)) {
                    alert('Invalid file type. Please upload PDF, JPG, or PNG files only.');
                    fileInput.value = '';
                    return;
                }
                
                console.log('File uploaded:', file.name);
                updateFileUploadDisplay(file);
            }
        });
    }

    // New search button
    const newSearchBtn = document.getElementById('new-search-btn');
    if (newSearchBtn) {
        newSearchBtn.addEventListener('click', startNewSearch);
    }
}

// Update file upload display
function updateFileUploadDisplay(file) {
    const fileUploadArea = document.getElementById('file-upload-area');
    if (!fileUploadArea) return;
    
    const uploadIcon = fileUploadArea.querySelector('.upload-icon');
    const uploadText = fileUploadArea.querySelector('.upload-text');
    
    if (uploadIcon && uploadText) {
        let fileIcon = 'fa-file';
        if (file.type.includes('pdf')) {
            fileIcon = 'fa-file-pdf';
        } else if (file.type.includes('image')) {
            fileIcon = 'fa-file-image';
        }
        
        uploadIcon.innerHTML = `<i class="fas ${fileIcon}"></i>`;
        uploadText.innerHTML = `
            <p style="color: #10b981; font-weight: 600; margin-bottom: 4px;">${file.name}</p>
            <small style="color: #059669; display: block; margin-bottom: 8px;">
                <i class="fas fa-check-circle"></i> File uploaded successfully - ${(file.size / 1024).toFixed(2)} KB
            </small>
            <button type="button" onclick="removeUploadedFile()" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 600;">
                <i class="fas fa-times"></i> Remove File
            </button>
        `;
        
        fileUploadArea.style.borderColor = '#10b981';
        fileUploadArea.style.background = '#f0fdf4';
    }
}

// Remove uploaded file
function removeUploadedFile() {
    const fileInput = document.getElementById('hospital-report');
    const fileUploadArea = document.getElementById('file-upload-area');
    
    if (fileInput) {
        fileInput.value = '';
    }
    
    if (fileUploadArea) {
        const uploadIcon = fileUploadArea.querySelector('.upload-icon');
        const uploadText = fileUploadArea.querySelector('.upload-text');
        
        if (uploadIcon && uploadText) {
            uploadIcon.innerHTML = '<i class="fas fa-cloud-upload-alt"></i>';
            uploadText.innerHTML = `
                <p>Click to upload or drag and drop</p>
                <small>PDF, JPG, PNG (Max 5MB)</small>
            `;
            
            fileUploadArea.style.borderColor = '#d1d5db';
            fileUploadArea.style.background = '#f9fafb';
        }
    }
}

// Make function globally accessible
window.removeUploadedFile = removeUploadedFile;

// Handle place selection from autocomplete
function handlePlaceSelected(place) {
    console.log('Place selected:', place);
    if (place.geometry && place.geometry.location) {
        userLocation = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address || place.name
        };
        console.log('User location set:', userLocation);
    }
}

// Handle emergency blood request
async function handleEmergencyRequest(e) {
    e.preventDefault();

    const patientName = document.getElementById('patient-name').value;
    const bloodType = document.getElementById('blood-type').value;
    const emergencyContact = document.getElementById('emergency-contact').value;
    const requesterEmail = document.getElementById('requester-email').value;
    const hospitalReport = document.getElementById('hospital-report').files[0];
    const hospitalAddress = document.getElementById('hospital-address').value;

    console.log('Form submitted:', { patientName, bloodType, emergencyContact, requesterEmail, hospitalAddress, hasFile: !!hospitalReport });

    if (!patientName || !bloodType || !emergencyContact || !requesterEmail || !hospitalAddress) {
        alert('Please fill in all required fields.');
        return;
    }

    if (!hospitalReport) {
        alert('Please upload a hospital report or medical prescription.');
        return;
    }

    const confirmationCheckbox = document.getElementById('emergency-confirmation');
    if (!confirmationCheckbox || !confirmationCheckbox.checked) {
        alert('Please confirm that this is a genuine medical emergency.');
        return;
    }

    // Show loading state
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching for Donors...';
    submitBtn.disabled = true;

    try {
        // Get user location (from autocomplete or geolocation)
        if (!userLocation) {
            await getUserLocation();
        }

        // Search for donors
        const searchResults = await searchForDonors({
            patientName,
            bloodType,
            emergencyContact,
            requesterEmail,
            userLocation
        });

        // Display results
        displaySearchResults(searchResults);

        // Hide main content and show results
        const mainContent = document.querySelector('.main-content');
        const heroSection = document.querySelector('.hero-section');
        const resultsSection = document.getElementById('results-section');
        
        if (mainContent) mainContent.style.display = 'none';
        if (heroSection) heroSection.style.display = 'none';
        if (resultsSection) resultsSection.classList.remove('hidden');

        console.log('✅ Results displayed successfully');

    } catch (error) {
        console.error('Error during emergency request:', error);
        alert('An error occurred while searching for donors. Please try again.');
    } finally {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Get user's current location
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser.'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log('User location:', userLocation);
                resolve(userLocation);
            },
            (error) => {
                console.error('Geolocation error:', error);
                // Use default location if geolocation fails
                userLocation = { lat: 40.7128, lng: -74.0060 };
                resolve(userLocation);
            }
        );
    });
}

// Search for donors using the backend API
async function searchForDonors(requestData) {
    try {
        const response = await fetch('/api/emergency-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Emergency request processed:', result);
            return {
                donors: result.donors || [],
                bloodBanks: await getBloodBanks(),
                notifications: result.notifications
            };
        } else {
            throw new Error(result.error || 'Failed to process emergency request');
        }
    } catch (error) {
        console.error('❌ Error searching for donors:', error);
        // Return mock data as fallback
        return {
            donors: getMockDonors(requestData.bloodType),
            bloodBanks: getMockBloodBanks(),
            notifications: null
        };
    }
}

// Get blood banks from API
async function getBloodBanks() {
    try {
        const response = await fetch('/api/blood-banks');
        const bloodBanks = await response.json();
        return bloodBanks || [];
    } catch (error) {
        console.error('Error fetching blood banks:', error);
        return getMockBloodBanks();
    }
}

// Mock data for demonstration
function getMockDonors(bloodType) {
    const allDonors = [
        { id: 1, name: "John Smith", blood_type: "O+", phone: "+1234567890", email: "john@example.com" },
        { id: 2, name: "Sarah Johnson", blood_type: "A+", phone: "+1234567891", email: "sarah@example.com" },
        { id: 3, name: "Michael Brown", blood_type: "B+", phone: "+1234567892", email: "michael@example.com" },
        { id: 4, name: "Emily Davis", blood_type: "AB+", phone: "+1234567893", email: "emily@example.com" },
        { id: 5, name: "David Wilson", blood_type: "O-", phone: "+1234567894", email: "david@example.com" }
    ];

    // Filter compatible donors
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

    const compatibleTypes = compatibilityMap[bloodType] || [];
    return allDonors.filter(donor => compatibleTypes.includes(donor.blood_type));
}

function getMockBloodBanks() {
    return [
        { 
            id: 1, 
            name: "City General Hospital Blood Bank", 
            phone: "+1234567800", 
            address: "123 Medical Center Dr",
            inventory: "A+:available:5,O+:available:8,B+:limited:2"
        },
        { 
            id: 2, 
            name: "Regional Medical Center", 
            phone: "+1234567801", 
            address: "456 Healthcare Ave",
            inventory: "A+:available:3,O-:available:4,AB+:limited:1"
        }
    ];
}

// Display search results
function displaySearchResults(results) {
    const { donors, bloodBanks, notifications } = results;

    // Update counts
    const donorCount = document.getElementById('donor-count');
    const bankCount = document.getElementById('bank-count');
    
    if (donorCount) donorCount.textContent = `${donors.length} found`;
    if (bankCount) bankCount.textContent = `${bloodBanks.length} found`;

    // Initialize map
    initializeMap();

    // Display donors
    displayDonors(donors);

    // Display blood banks
    displayBloodBanks(bloodBanks);

    // Show notification status
    if (notifications) {
        showNotificationStatus(notifications);
    }
}

// Initialize map
function initializeMap() {
    if (!userLocation) return;

    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // Initialize Mapbox map (FREE)
    if (!mapService) {
        mapService = new MapService();
    }
    
    mapService.initializeMap('map', userLocation, 13);
    
    // Add user location marker
    setTimeout(() => {
        if (mapService.map) {
            const userMarker = mapService.addCustomMarker(
                userLocation,
                'Your Location',
                'user',
                '<div style="padding: 10px;"><strong>Your Location</strong><br/>' + 
                (userLocation.address || 'Current Position') + '</div>'
            );
        }
    }, 500);
}

// Display donors list
function displayDonors(donors) {
    const donorsList = document.getElementById('donors-list');
    if (!donorsList) return;

    if (donors.length === 0) {
        donorsList.innerHTML = '<p class="no-results">No compatible donors found in your area.</p>';
        return;
    }

    donorsList.innerHTML = donors.map(donor => {
        // Add markers to map
        if (mapService && mapService.map && donor.location) {
            const infoContent = `
                <div style="padding: 10px; min-width: 200px;">
                    <h4 style="margin: 0 0 8px 0; color: #dc2626;">${donor.name}</h4>
                    <p style="margin: 4px 0;"><strong>Blood Type:</strong> ${donor.blood_type}</p>
                    ${donor.distance ? `<p style="margin: 4px 0;"><strong>Distance:</strong> ${donor.distance} km</p>` : ''}
                    ${donor.duration ? `<p style="margin: 4px 0;"><strong>Drive Time:</strong> ~${donor.duration} min</p>` : ''}
                    <p style="margin: 4px 0;"><strong>Phone:</strong> ${donor.phone}</p>
                </div>
            `;
            
            mapService.addCustomMarker(
                donor.location,
                donor.name,
                'donor',
                infoContent
            );
        }

        const distanceInfo = donor.distance ? 
            `<p><i class="fas fa-map-marker-alt"></i> ${donor.distance} km away • ~${donor.duration} min drive</p>` : '';

        return `
            <div class="donor-item">
                <div class="donor-info">
                    <div class="donor-header">
                        <h4>${donor.name}</h4>
                        <span class="blood-type-badge">${donor.blood_type}</span>
                    </div>
                    ${distanceInfo}
                    <div class="donor-contact">
                        <p><i class="fas fa-phone"></i> ${donor.phone}</p>
                        <p><i class="fas fa-envelope"></i> ${donor.email}</p>
                    </div>
                </div>
                <div class="donor-actions">
                    <button onclick="callDonor('${donor.phone}')" class="btn-call">
                        <i class="fas fa-phone"></i> Call
                    </button>
                    <button onclick="emailDonor('${donor.email}')" class="btn-email">
                        <i class="fas fa-envelope"></i> Email
                    </button>
                    ${donor.location && userLocation ? `
                        <button onclick="showDirections(${donor.location.lat}, ${donor.location.lng}, '${donor.name}')" class="btn-directions">
                            <i class="fas fa-directions"></i> Directions
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');

    // Fit map to show all markers
    if (mapService && mapService.map && donors.some(d => d.location)) {
        setTimeout(() => {
            const locations = [userLocation, ...donors.filter(d => d.location).map(d => d.location)];
            mapService.fitBounds(locations);
        }, 1000);
    }
}

// Display blood banks list
function displayBloodBanks(bloodBanks) {
    const banksList = document.getElementById('blood-banks-list');
    if (!banksList) return;

    if (bloodBanks.length === 0) {
        banksList.innerHTML = '<p class="no-results">No blood banks found in your area.</p>';
        return;
    }

    banksList.innerHTML = bloodBanks.map(bank => {
        // Add markers to map
        if (mapService && mapService.map && bank.latitude && bank.longitude) {
            const location = { lat: bank.latitude, lng: bank.longitude };
            const infoContent = `
                <div style="padding: 10px; min-width: 200px;">
                    <h4 style="margin: 0 0 8px 0; color: #10b981;">${bank.name}</h4>
                    <p style="margin: 4px 0;"><i class="fas fa-map-marker-alt"></i> ${bank.address}</p>
                    <p style="margin: 4px 0;"><i class="fas fa-phone"></i> ${bank.phone}</p>
                </div>
            `;
            
            mapService.addCustomMarker(
                location,
                bank.name,
                'hospital',
                infoContent
            );
        }

        const inventory = parseInventory(bank.inventory);
        return `
            <div class="bank-item">
                <div class="bank-info">
                    <h4>${bank.name}</h4>
                    <p><i class="fas fa-map-marker-alt"></i> ${bank.address}</p>
                    <p><i class="fas fa-phone"></i> ${bank.phone}</p>
                </div>
                <div class="bank-inventory">
                    ${inventory.map(item => `
                        <span class="inventory-item ${item.status}">
                            ${item.bloodType}: ${item.units} units
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// Parse inventory string
function parseInventory(inventoryString) {
    if (!inventoryString) return [];
    
    return inventoryString.split(',').map(item => {
        const [bloodType, status, units] = item.split(':');
        return { bloodType, status, units: units || '0' };
    });
}

// Show notification status
function showNotificationStatus(notifications) {
    const statusDiv = document.createElement('div');
    statusDiv.className = 'notification-status';
    statusDiv.innerHTML = `
        <div class="status-header">
            <h3>📢 Notifications Sent</h3>
        </div>
        <div class="status-details">
            <p>✅ ${notifications.email?.length || 0} email alerts sent</p>
            <p>✅ ${notifications.sms?.length || 0} SMS alerts sent</p>
            <p>✅ ${notifications.push?.length || 0} push notifications sent</p>
        </div>
    `;
    
    const resultsContainer = document.querySelector('.results-container');
    if (resultsContainer) {
        resultsContainer.insertBefore(statusDiv, resultsContainer.firstChild);
    }
}

// Helper functions
function callDonor(phone) {
    window.open(`tel:${phone}`, '_self');
}

function emailDonor(email) {
    window.open(`mailto:${email}?subject=Emergency Blood Donation Request`, '_self');
}

// Make functions globally accessible
window.callDonor = callDonor;
window.emailDonor = emailDonor;

// Show directions to donor
async function showDirections(lat, lng, name) {
    if (!userLocation) {
        alert('Unable to show directions at this time.');
        return;
    }

    try {
        // Open in OpenStreetMap with directions
        const url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLocation.lat},${userLocation.lng};${lat},${lng}`;
        window.open(url, '_blank');
    } catch (error) {
        console.error('Error showing directions:', error);
        // Fallback to Google Maps
        const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${lat},${lng}`;
        window.open(url, '_blank');
    }
}

window.showDirections = showDirections;

function startNewSearch() {
    // Reset form
    const form = document.getElementById('emergency-form');
    if (form) form.reset();
    
    // Reset file upload display
    removeUploadedFile();
    
    // Show main content, hide results
    const mainContent = document.querySelector('.main-content');
    const heroSection = document.querySelector('.hero-section');
    const resultsSection = document.getElementById('results-section');
    
    if (mainContent) mainContent.style.display = 'block';
    if (heroSection) heroSection.style.display = 'block';
    if (resultsSection) resultsSection.classList.add('hidden');
    
    // Clear map
    if (mapService) {
        mapService.clearMarkers();
    }
    
    // Reset location
    userLocation = null;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
