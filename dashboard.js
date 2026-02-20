// Donor Dashboard Application
let currentDonor = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadDonorProfile();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Registration form
    document.getElementById('donor-registration-form').addEventListener('submit', handleRegistration);

    // Show/hide last donation location field
    const lastDonationDate = document.getElementById('last-donation-date');
    const lastDonationLocationGroup = document.getElementById('last-donation-location-group');
    
    lastDonationDate.addEventListener('change', () => {
        if (lastDonationDate.value) {
            lastDonationLocationGroup.style.display = 'block';
        } else {
            lastDonationLocationGroup.style.display = 'none';
        }
    });

    // Edit profile button
    const editProfileBtn = document.getElementById('edit-profile-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', editProfile);
    }

    // Add donation form (inline)
    document.getElementById('add-donation-form').addEventListener('submit', handleAddDonation);
    
    // Set max date to today for donation date
    document.getElementById('donation-date').max = new Date().toISOString().split('T')[0];
}

// Switch between tabs
function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
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
    currentDonor = donorData;

    // Save to available donors list for emergency search
    saveToAvailableDonors();

    // Register with backend API
    registerDonorWithBackend(donorData);

    alert('Registration successful! Welcome to Blood Bond. Your profile is now available for emergency searches.');
    
    // Request notification permission
    requestNotificationPermission(donorData.email);
    
    // Reset form
    document.getElementById('donor-registration-form').reset();
    document.getElementById('last-donation-location-group').style.display = 'none';
    
    // Switch to profile tab and display
    switchTab('profile');
    displayProfile();
}

// Load donor profile
function loadDonorProfile() {
    const savedProfile = localStorage.getItem('donorProfile');
    
    if (savedProfile) {
        currentDonor = JSON.parse(savedProfile);
        displayProfile();
        // If profile exists, switch to profile tab automatically
        switchTab('profile');
    } else {
        document.getElementById('no-profile').classList.remove('hidden');
        document.getElementById('profile-view').classList.add('hidden');
        // Stay on register tab if no profile
    }
}

// Display donor profile
function displayProfile() {
    document.getElementById('no-profile').classList.add('hidden');
    document.getElementById('profile-view').classList.remove('hidden');

    // Profile header
    const initial = currentDonor.name.charAt(0).toUpperCase();
    document.getElementById('profile-initial').textContent = initial;
    document.getElementById('profile-name').textContent = currentDonor.name;
    document.getElementById('profile-blood-type').textContent = currentDonor.bloodType;

    // Check eligibility
    const eligibility = checkEligibility();
    const eligibilityBadge = document.getElementById('eligibility-status');
    eligibilityBadge.className = 'eligibility-badge ' + (eligibility.eligible ? 'eligible' : 'not-eligible');
    eligibilityBadge.textContent = eligibility.message;

    // Contact information
    document.getElementById('profile-phone').textContent = currentDonor.phone;
    document.getElementById('profile-email').textContent = currentDonor.email;
    document.getElementById('profile-address').textContent = currentDonor.address;

    // Medical information
    document.getElementById('profile-age').textContent = currentDonor.age;
    document.getElementById('profile-weight').textContent = currentDonor.weight + ' kg';
    document.getElementById('profile-blood-type-detail').textContent = currentDonor.bloodType;

    // Donation history
    displayDonationHistory();

    // Statistics
    updateStatistics(eligibility);
    
    // Update emergency access status
    updateEmergencyAccessStatus(eligibility);
}

// Check donation eligibility (30-day rule)
function checkEligibility() {
    if (!currentDonor.donations || currentDonor.donations.length === 0) {
        return {
            eligible: true,
            message: '✅ Eligible to Donate',
            daysRemaining: 0
        };
    }

    // Get most recent donation
    const sortedDonations = [...currentDonor.donations].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    const lastDonation = new Date(sortedDonations[0].date);
    const today = new Date();
    const daysSinceLastDonation = Math.floor((today - lastDonation) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, 30 - daysSinceLastDonation);

    if (daysSinceLastDonation >= 30) {
        return {
            eligible: true,
            message: '✅ Eligible to Donate',
            daysRemaining: 0
        };
    } else {
        return {
            eligible: false,
            message: `⏳ Eligible in ${daysRemaining} days`,
            daysRemaining: daysRemaining
        };
    }
}

// Display donation history
function displayDonationHistory() {
    const historyContainer = document.getElementById('donation-history');
    
    if (!currentDonor.donations || currentDonor.donations.length === 0) {
        historyContainer.innerHTML = '<p class="info-text">No donation records yet.</p>';
        return;
    }

    // Sort donations by date (most recent first)
    const sortedDonations = [...currentDonor.donations].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );

    historyContainer.innerHTML = sortedDonations.map(donation => {
        const date = new Date(donation.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        return `
            <div class="donation-record">
                <div class="donation-date">📅 ${formattedDate}</div>
                <div class="donation-location">📍 ${donation.location}</div>
                <div class="donation-location">💉 ${donation.units} unit(s)</div>
            </div>
        `;
    }).join('');
}

// Update statistics
function updateStatistics(eligibility) {
    const totalDonations = currentDonor.donations ? currentDonor.donations.length : 0;
    const livesSaved = totalDonations * 3; // Each donation can save up to 3 lives

    document.getElementById('total-donations').textContent = totalDonations;
    document.getElementById('lives-saved').textContent = livesSaved;
    document.getElementById('next-eligible').textContent = 
        eligibility.daysRemaining === 0 ? 'Now!' : eligibility.daysRemaining;
}

// Handle add donation
function handleAddDonation(e) {
    e.preventDefault();

    const newDonation = {
        date: document.getElementById('donation-date').value,
        location: document.getElementById('donation-location').value,
        units: parseInt(document.getElementById('donation-units').value)
    };

    // Validate date is not in future
    const donationDate = new Date(newDonation.date);
    const today = new Date();
    if (donationDate > today) {
        alert('Donation date cannot be in the future.');
        return;
    }

    // Check if donation is within 30 days of last donation
    if (currentDonor.donations && currentDonor.donations.length > 0) {
        const sortedDonations = [...currentDonor.donations].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        const lastDonation = new Date(sortedDonations[0].date);
        const daysBetween = Math.floor((donationDate - lastDonation) / (1000 * 60 * 60 * 24));
        
        if (daysBetween < 30 && daysBetween > 0) {
            const confirm = window.confirm(
                `Warning: This donation is only ${daysBetween} days after your last donation. ` +
                'The recommended waiting period is 30 days. Continue anyway?'
            );
            if (!confirm) return;
        }
    }

    // Add donation to profile
    if (!currentDonor.donations) {
        currentDonor.donations = [];
    }
    currentDonor.donations.push(newDonation);

    // Update last donation date
    currentDonor.lastDonationDate = newDonation.date;

    // Save to localStorage
    localStorage.setItem('donorProfile', JSON.stringify(currentDonor));

    // Also save to available donors list for emergency search
    saveToAvailableDonors();

    alert('Donation record added successfully! Your profile is now available for emergency searches.');
    
    // Reset form
    document.getElementById('add-donation-form').reset();
    document.getElementById('donation-units').value = 1;
    
    // Refresh display
    displayProfile();
}

// Save donor to available donors list for emergency search
function saveToAvailableDonors() {
    let availableDonors = JSON.parse(localStorage.getItem('availableDonors') || '[]');
    
    // Check if donor already exists
    const existingIndex = availableDonors.findIndex(d => d.email === currentDonor.email);
    
    const donorForEmergency = {
        id: existingIndex >= 0 ? availableDonors[existingIndex].id : Date.now(),
        name: currentDonor.name,
        bloodType: currentDonor.bloodType,
        phone: currentDonor.phone,
        email: currentDonor.email,
        address: currentDonor.address,
        lastDonationDate: currentDonor.lastDonationDate,
        registrationDate: currentDonor.registrationDate
    };
    
    if (existingIndex >= 0) {
        availableDonors[existingIndex] = donorForEmergency;
    } else {
        availableDonors.push(donorForEmergency);
    }
    
    localStorage.setItem('availableDonors', JSON.stringify(availableDonors));
}

// Update emergency access status display
function updateEmergencyAccessStatus(eligibility) {
    const statusDiv = document.getElementById('emergency-access-status');
    
    if (eligibility.eligible) {
        statusDiv.style.background = '#d4edda';
        statusDiv.style.color = '#28a745';
        statusDiv.innerHTML = '✅ Your profile is ACTIVE in emergency search system<br><small>You can be contacted for emergency blood donations</small>';
    } else {
        statusDiv.style.background = '#fff3cd';
        statusDiv.style.color = '#ff9800';
        statusDiv.innerHTML = `⏳ Your profile will be active in ${eligibility.daysRemaining} days<br><small>You'll be available for emergency searches after the 30-day waiting period</small>`;
    }
}

// Edit profile
function editProfile() {
    // Pre-fill registration form with current data
    document.getElementById('donor-name').value = currentDonor.name;
    document.getElementById('donor-blood-type').value = currentDonor.bloodType;
    document.getElementById('donor-phone').value = currentDonor.phone;
    document.getElementById('donor-email').value = currentDonor.email;
    document.getElementById('donor-address').value = currentDonor.address;
    document.getElementById('donor-age').value = currentDonor.age;
    document.getElementById('donor-weight').value = currentDonor.weight;

    // Switch to registration tab
    switchTab('register');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            // Store donor ID for future updates
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
    // Check if FCM is initialized
    if (!window.BloodBondFCM) {
        console.log('⚠️  Firebase not initialized');
        return;
    }

    // Ask user for permission
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
                alert('✅ Push notifications enabled! You\'ll receive alerts for emergency requests.');
            } else {
                console.log('⚠️  Notification permission denied');
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
        }
    }
}
