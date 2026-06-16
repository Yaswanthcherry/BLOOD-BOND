// Donor Dashboard Application
let currentDonor = null;
let addressAutocomplete = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    console.log('🩸 Blood Bond Dashboard Initialized');
    loadDonorProfile();
    setupEventListeners();
    
    // Initialize address autocomplete (Nominatim - FREE)
    initializeAddressAutocomplete();
});

// Setup event listeners
function setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Registration form
    const registrationForm = document.getElementById('donor-registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistration);
    }

    // Show/hide last donation location field
    const lastDonationDate = document.getElementById('last-donation-date');
    const lastDonationLocationGroup = document.getElementById('last-donation-location-group');
    
    if (lastDonationDate && lastDonationLocationGroup) {
        lastDonationDate.addEventListener('change', () => {
            if (lastDonationDate.value) {
                lastDonationLocationGroup.style.display = 'block';
            } else {
                lastDonationLocationGroup.style.display = 'none';
            }
        });
    }

    // Edit profile button
    const editProfileBtn = document.getElementById('edit-profile-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', editProfile);
    }

    // Add donation button and form
    const addDonationBtn = document.getElementById('add-donation-btn');
    const addDonationForm = document.getElementById('add-donation-form');
    const donationForm = document.getElementById('donation-form');
    const cancelDonationBtn = document.getElementById('cancel-donation-btn');

    if (addDonationBtn && addDonationForm) {
        addDonationBtn.addEventListener('click', () => {
            addDonationForm.classList.remove('hidden');
            addDonationBtn.style.display = 'none';
        });
    }

    if (cancelDonationBtn && addDonationForm && donationForm) {
        cancelDonationBtn.addEventListener('click', () => {
            addDonationForm.classList.add('hidden');
            const btn = document.getElementById('add-donation-btn');
            if (btn) btn.style.display = 'inline-flex';
            donationForm.reset();
        });
    }

    if (donationForm) {
        donationForm.addEventListener('submit', handleAddDonation);
    }
    
    // Set max date to today for donation date
    const donationDateInput = document.getElementById('donation-date');
    if (donationDateInput) {
        donationDateInput.max = new Date().toISOString().split('T')[0];
    }
}

// Switch between tabs
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const targetBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (targetBtn) {
        targetBtn.classList.add('active');
    }

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    const targetTab = document.getElementById(`${tabName}-tab`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
}

// Make switchTab globally accessible
window.switchTab = switchTab;

// Initialize address autocomplete (Nominatim - FREE)
function initializeAddressAutocomplete() {
    const addressInput = document.getElementById('donor-address');
    if (!addressInput) {
        return;
    }

    addressAutocomplete = new AddressAutocomplete('donor-address', (place) => {
        if (place.formatted_address) {
            addressInput.value = place.formatted_address;
        }
    });

    console.log('✅ Address autocomplete initialized (Nominatim)');
}

// Handle donor registration
function handleRegistration(e) {
    e.preventDefault();

    const lastDonationDate = document.getElementById('last-donation-date').value;
    const lastDonationLocation = document.getElementById('last-donation-location').value;

    const donorData = {
        name: document.getElementById('donor-name').value,
        bloodType: document.getElementById('donor-blood-type').value,
        phone: document.getElementById('donor-phone').value,
        email: document.getElementById('donor-email').value,
        address: document.getElementById('donor-address').value,
        age: document.getElementById('donor-age').value,
        weight: document.getElementById('donor-weight').value,
        lastDonationDate: lastDonationDate,
        registrationDate: new Date().toISOString(),
        donations: []
    };

    // Add initial donation if provided
    if (lastDonationDate) {
        donorData.donations.push({
            date: lastDonationDate,
            location: lastDonationLocation || 'Previous Donation',
            units: 1
        });
    }

    // Save to localStorage
    localStorage.setItem('donorProfile', JSON.stringify(donorData));
    localStorage.setItem('donorEmail', donorData.email);
    currentDonor = donorData;

    // Save to available donors list for emergency search
    saveToAvailableDonors();

    // Register with backend API
    registerDonorWithBackend(donorData);

    // Show success message
    showSuccessMessage('Registration successful! Welcome to Blood Bond. Your profile is now available for emergency searches.');
    
    // Request notification permission
    requestNotificationPermission(donorData.email);
    
    // Reset form
    document.getElementById('donor-registration-form').reset();
    const locationGroup = document.getElementById('last-donation-location-group');
    if (locationGroup) locationGroup.style.display = 'none';
    
    // Switch to profile tab and display
    switchTab('profile');
    displayDonorProfile();
}

// Show success message
function showSuccessMessage(message) {
    const alert = document.createElement('div');
    alert.className = 'success-alert';
    alert.innerHTML = `
        <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border: 2px solid #10b981; border-radius: 12px; padding: 20px; margin: 20px 0; display: flex; align-items: center; gap: 16px;">
            <div style="font-size: 24px; color: #065f46;">
                <i class="fas fa-check-circle"></i>
            </div>
            <div>
                <h4 style="color: #065f46; font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">Success!</h4>
                <p style="color: #065f46; font-size: 14px; margin: 0;">${message}</p>
            </div>
        </div>
    `;
    
    const container = document.querySelector('.dashboard-container');
    if (container) {
        container.insertBefore(alert, container.firstChild);
        setTimeout(() => alert.remove(), 5000);
    }
}

// Load donor profile
function loadDonorProfile() {
    const savedProfile = localStorage.getItem('donorProfile');
    if (savedProfile) {
        currentDonor = JSON.parse(savedProfile);
        displayDonorProfile();
    } else {
        showNoProfile();
    }
}

// Display donor profile
function displayDonorProfile() {
    const noProfile = document.getElementById('no-profile');
    const profileView = document.getElementById('profile-view');
    
    if (!currentDonor || !noProfile || !profileView) return;
    
    noProfile.classList.add('hidden');
    profileView.classList.remove('hidden');
    
    // Update profile information
    const elements = {
        'profile-name': currentDonor.name,
        'profile-blood-type': currentDonor.bloodType,
        'profile-phone': currentDonor.phone,
        'profile-email': currentDonor.email,
        'profile-address': currentDonor.address,
        'profile-age': currentDonor.age,
        'profile-weight': currentDonor.weight + ' kg',
        'profile-blood-type-detail': currentDonor.bloodType
    };
    
    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = elements[id];
    });
    
    // Set profile initial
    const initial = currentDonor.name.charAt(0).toUpperCase();
    const initialElement = document.getElementById('profile-initial');
    if (initialElement) initialElement.textContent = initial;
    
    // Update eligibility status
    updateEligibilityStatus();
    
    // Display donation history
    displayDonationHistory();
    
    // Update statistics
    updateDonationStatistics();
}

// Show no profile state
function showNoProfile() {
    const noProfile = document.getElementById('no-profile');
    const profileView = document.getElementById('profile-view');
    
    if (noProfile) noProfile.classList.remove('hidden');
    if (profileView) profileView.classList.add('hidden');
}

// Update eligibility status
function updateEligibilityStatus() {
    const eligibilityBadge = document.getElementById('eligibility-status');
    const nextEligibleElement = document.getElementById('next-eligible');
    
    if (!eligibilityBadge || !nextEligibleElement) return;
    
    if (!currentDonor.lastDonationDate) {
        eligibilityBadge.textContent = 'Eligible to Donate';
        eligibilityBadge.className = 'eligibility-badge';
        nextEligibleElement.textContent = '0';
        return;
    }
    
    const lastDonation = new Date(currentDonor.lastDonationDate);
    const today = new Date();
    const daysSinceLastDonation = Math.floor((today - lastDonation) / (1000 * 60 * 60 * 24));
    const daysUntilEligible = Math.max(0, 30 - daysSinceLastDonation);
    
    if (daysUntilEligible === 0) {
        eligibilityBadge.textContent = 'Eligible to Donate';
        eligibilityBadge.className = 'eligibility-badge';
        nextEligibleElement.textContent = '0';
    } else {
        eligibilityBadge.textContent = `Eligible in ${daysUntilEligible} days`;
        eligibilityBadge.className = 'eligibility-badge not-eligible';
        nextEligibleElement.textContent = daysUntilEligible.toString();
    }
}

// Display donation history
function displayDonationHistory() {
    const historyContainer = document.getElementById('donation-history');
    if (!historyContainer) return;
    
    if (!currentDonor.donations || currentDonor.donations.length === 0) {
        historyContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-calendar-times"></i>
                </div>
                <p>No donation records yet.</p>
            </div>
        `;
        return;
    }
    
    const sortedDonations = currentDonor.donations.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    historyContainer.innerHTML = sortedDonations.map(donation => {
        const donationDate = new Date(donation.date);
        const formattedDate = donationDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        return `
            <div class="donation-item">
                <div class="donation-info">
                    <div class="donation-date">${formattedDate}</div>
                    <div class="donation-details">
                        <h4>${donation.location}</h4>
                        <p><i class="fas fa-map-marker-alt"></i> Donation Location</p>
                    </div>
                </div>
                <div class="donation-units">${donation.units} unit(s)</div>
            </div>
        `;
    }).join('');
}

// Update donation statistics
function updateDonationStatistics() {
    const totalDonations = currentDonor.donations ? currentDonor.donations.length : 0;
    const totalUnits = currentDonor.donations ? 
        currentDonor.donations.reduce((sum, donation) => sum + (donation.units || 1), 0) : 0;
    const livesSaved = totalUnits * 3;
    
    const totalElement = document.getElementById('total-donations');
    const livesElement = document.getElementById('lives-saved');
    
    if (totalElement) totalElement.textContent = totalDonations;
    if (livesElement) livesElement.textContent = livesSaved;
}

// Handle add donation
function handleAddDonation(e) {
    e.preventDefault();
    
    const donationDate = document.getElementById('donation-date').value;
    const donationLocation = document.getElementById('donation-location').value;
    const donationUnits = parseInt(document.getElementById('donation-units').value) || 1;
    
    if (!currentDonor.donations) {
        currentDonor.donations = [];
    }
    
    // Add new donation
    currentDonor.donations.push({
        date: donationDate,
        location: donationLocation,
        units: donationUnits
    });
    
    // Update last donation date
    currentDonor.lastDonationDate = donationDate;
    
    // Save to localStorage
    localStorage.setItem('donorProfile', JSON.stringify(currentDonor));
    
    // Update display
    updateEligibilityStatus();
    displayDonationHistory();
    updateDonationStatistics();
    
    // Hide form and show button
    const form = document.getElementById('add-donation-form');
    const btn = document.getElementById('add-donation-btn');
    if (form) form.classList.add('hidden');
    if (btn) btn.style.display = 'inline-flex';
    
    // Reset form
    const donationForm = document.getElementById('donation-form');
    if (donationForm) {
        donationForm.reset();
        const unitsInput = document.getElementById('donation-units');
        if (unitsInput) unitsInput.value = '1';
    }
    
    // Show success message
    showSuccessMessage('Donation record added successfully!');
}

// Edit profile function
function editProfile() {
    if (currentDonor) {
        // Pre-fill the registration form with current data
        const fields = {
            'donor-name': currentDonor.name,
            'donor-blood-type': currentDonor.bloodType,
            'donor-phone': currentDonor.phone,
            'donor-email': currentDonor.email,
            'donor-address': currentDonor.address,
            'donor-age': currentDonor.age,
            'donor-weight': currentDonor.weight,
            'last-donation-date': currentDonor.lastDonationDate || ''
        };
        
        Object.keys(fields).forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = fields[id];
        });
        
        // Switch to registration tab
        switchTab('register');
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Save to available donors for emergency search
function saveToAvailableDonors() {
    let availableDonors = JSON.parse(localStorage.getItem('availableDonors') || '[]');
    
    // Remove existing entry for this email
    availableDonors = availableDonors.filter(donor => donor.email !== currentDonor.email);
    
    // Add updated donor info
    availableDonors.push({
        name: currentDonor.name,
        bloodType: currentDonor.bloodType,
        phone: currentDonor.phone,
        email: currentDonor.email,
        address: currentDonor.address,
        lastDonationDate: currentDonor.lastDonationDate,
        registrationDate: currentDonor.registrationDate
    });
    
    localStorage.setItem('availableDonors', JSON.stringify(availableDonors));
}

// Register donor with backend API
async function registerDonorWithBackend(donorData) {
    try {
        const response = await fetch('http://localhost:3000/api/donors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(donorData)
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Donor registered with backend:', result);
            if (result.id) {
                const profile = JSON.parse(localStorage.getItem('donorProfile'));
                profile.id = result.id;
                localStorage.setItem('donorProfile', JSON.stringify(profile));
            }
        } else {
            console.error('❌ Backend registration failed:', result);
        }
    } catch (error) {
        console.error('❌ Error registering with backend:', error);
    }
}

// Request notification permission and get FCM token
async function requestNotificationPermission(email) {
    if (!window.BloodBondFCM) {
        console.log('⚠️  Firebase not initialized');
        return;
    }

    const enableNotifications = confirm(
        '🔔 Enable push notifications?\n\n' +
        'Get instant alerts when there\'s an emergency blood request matching your blood type.\n\n' +
        'Click OK to enable notifications.'
    );

    if (enableNotifications) {
        try {
            const token = await window.BloodBondFCM.requestPermission();
            
            if (token) {
                console.log('✅ Push notifications enabled!');
                showSuccessMessage('Push notifications enabled! You\'ll receive alerts for emergency requests.');
            } else {
                console.log('⚠️  Notification permission denied');
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
        }
    }
}
