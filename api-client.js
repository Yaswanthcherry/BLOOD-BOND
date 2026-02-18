// API Client for Blood Agent Database
const API_BASE_URL = 'http://localhost:3000/api';

class BloodAgentAPI {
    // Donor APIs
    static async registerDonor(donorData) {
        const response = await fetch(`${API_BASE_URL}/donors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(donorData)
        });
        return response.json();
    }

    static async getDonorByEmail(email) {
        const response = await fetch(`${API_BASE_URL}/donors/email/${email}`);
        return response.json();
    }

    static async updateDonor(id, donorData) {
        const response = await fetch(`${API_BASE_URL}/donors/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(donorData)
        });
        return response.json();
    }

    static async searchDonors(bloodType) {
        const response = await fetch(`${API_BASE_URL}/donors/search/${bloodType}`);
        return response.json();
    }

    // Donation APIs
    static async addDonation(donationData) {
        const response = await fetch(`${API_BASE_URL}/donations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(donationData)
        });
        return response.json();
    }

    static async getDonationHistory(donorId) {
        const response = await fetch(`${API_BASE_URL}/donations/donor/${donorId}`);
        return response.json();
    }

    // Blood Bank APIs
    static async getBloodBanks() {
        const response = await fetch(`${API_BASE_URL}/blood-banks`);
        return response.json();
    }
}
