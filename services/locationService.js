// Location Service - Free APIs: Nominatim and OpenRouteService
require('dotenv').config();

const OPENROUTESERVICE_API_KEY = process.env.OPENROUTESERVICE_API_KEY;

class LocationService {
    /**
     * Calculate driving distance and time between two points using OpenRouteService
     */
    async calculateDrivingRoute(origin, destination) {
        if (!OPENROUTESERVICE_API_KEY || OPENROUTESERVICE_API_KEY === 'your_openrouteservice_api_key') {
            console.warn('⚠️  OpenRouteService API key not configured, using straight-line distance');
            return this.calculateStraightLineDistance(origin, destination);
        }

        try {
            const url = 'https://api.openrouteservice.org/v2/directions/driving-car';
            const body = {
                coordinates: [
                    [origin.lng, origin.lat],
                    [destination.lng, destination.lat]
                ]
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': OPENROUTESERVICE_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error(`OpenRouteService API error: ${response.status}`);
            }

            const data = await response.json();
            const route = data.routes[0];
            
            return {
                distance: (route.summary.distance / 1000).toFixed(2), // Convert to km
                duration: Math.round(route.summary.duration / 60), // Convert to minutes
                type: 'driving'
            };
        } catch (error) {
            console.error('Error calculating driving route:', error);
            return this.calculateStraightLineDistance(origin, destination);
        }
    }

    /**
     * Calculate straight-line distance (fallback)
     */
    calculateStraightLineDistance(origin, destination) {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(destination.lat - origin.lat);
        const dLon = this.toRad(destination.lng - origin.lng);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRad(origin.lat)) * Math.cos(this.toRad(destination.lat)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        
        // Estimate time (assuming 40 km/h average speed in city)
        const duration = Math.round((distance / 40) * 60);
        
        return {
            distance: distance.toFixed(2),
            duration: duration,
            type: 'straight-line'
        };
    }

    toRad(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Search for nearby hospitals and blood banks using Nominatim (OpenStreetMap)
     * Completely FREE - No API key required
     */
    async searchNearbyPlaces(location, type = 'hospital', radius = 5000) {
        try {
            // Convert radius from meters to degrees (approximate)
            const radiusDegrees = radius / 111000; // 1 degree ≈ 111km
            
            // Nominatim search query
            const amenityType = type === 'hospital' ? 'hospital' : 'clinic';
            const url = `https://nominatim.openstreetmap.org/search?` +
                `format=json` +
                `&amenity=${amenityType}` +
                `&limit=20` +
                `&bounded=1` +
                `&viewbox=${location.lng - radiusDegrees},${location.lat - radiusDegrees},${location.lng + radiusDegrees},${location.lat + radiusDegrees}`;

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'BloodBondApp/1.0' // Required by Nominatim
                }
            });

            if (!response.ok) {
                throw new Error(`Nominatim API error: ${response.status}`);
            }

            const data = await response.json();

            return data.map(place => ({
                name: place.display_name.split(',')[0],
                address: place.display_name,
                location: {
                    lat: parseFloat(place.lat),
                    lng: parseFloat(place.lon)
                },
                placeId: place.place_id,
                type: place.type
            }));
        } catch (error) {
            console.error('Error searching nearby places:', error);
            return [];
        }
    }

    /**
     * Get place details using Nominatim
     */
    async getPlaceDetails(placeId) {
        try {
            const url = `https://nominatim.openstreetmap.org/details?` +
                `place_id=${placeId}` +
                `&format=json`;

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'BloodBondApp/1.0'
                }
            });

            if (!response.ok) {
                throw new Error(`Nominatim API error: ${response.status}`);
            }

            const data = await response.json();

            return {
                name: data.localname,
                address: data.addresstags?.['addr:full'] || data.calculated_wikipedia,
                location: {
                    lat: parseFloat(data.centroid.coordinates[1]),
                    lng: parseFloat(data.centroid.coordinates[0])
                }
            };
        } catch (error) {
            console.error('Error getting place details:', error);
            return null;
        }
    }

    /**
     * Geocode an address to coordinates using Nominatim (FREE)
     */
    async geocodeAddress(address) {
        try {
            const url = `https://nominatim.openstreetmap.org/search?` +
                `q=${encodeURIComponent(address)}` +
                `&format=json` +
                `&limit=1`;

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'BloodBondApp/1.0'
                }
            });

            if (!response.ok) {
                throw new Error(`Nominatim API error: ${response.status}`);
            }

            const data = await response.json();

            if (data.length === 0) {
                return null;
            }

            const result = data[0];
            return {
                lat: parseFloat(result.lat),
                lng: parseFloat(result.lon),
                formattedAddress: result.display_name
            };
        } catch (error) {
            console.error('Error geocoding address:', error);
            return null;
        }
    }

    /**
     * Reverse geocode coordinates to address using Nominatim (FREE)
     */
    async reverseGeocode(lat, lng) {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?` +
                `lat=${lat}` +
                `&lon=${lng}` +
                `&format=json`;

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'BloodBondApp/1.0'
                }
            });

            if (!response.ok) {
                throw new Error(`Nominatim API error: ${response.status}`);
            }

            const data = await response.json();

            return {
                address: data.display_name,
                city: data.address.city || data.address.town || data.address.village,
                state: data.address.state,
                country: data.address.country
            };
        } catch (error) {
            console.error('Error reverse geocoding:', error);
            return null;
        }
    }

    /**
     * Search addresses with autocomplete using Nominatim (FREE)
     */
    async searchAddresses(query, limit = 5) {
        try {
            const url = `https://nominatim.openstreetmap.org/search?` +
                `q=${encodeURIComponent(query)}` +
                `&format=json` +
                `&limit=${limit}` +
                `&addressdetails=1`;

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'BloodBondApp/1.0'
                }
            });

            if (!response.ok) {
                throw new Error(`Nominatim API error: ${response.status}`);
            }

            const data = await response.json();

            return data.map(place => ({
                label: place.display_name,
                value: place.display_name,
                lat: parseFloat(place.lat),
                lng: parseFloat(place.lon),
                placeId: place.place_id
            }));
        } catch (error) {
            console.error('Error searching addresses:', error);
            return [];
        }
    }

    /**
     * Calculate distances for multiple donors from a location
     */
    async calculateDonorDistances(userLocation, donors) {
        const donorsWithDistance = await Promise.all(
            donors.map(async (donor) => {
                // Geocode donor address if not already done
                let donorLocation = donor.location;
                if (!donorLocation && donor.address) {
                    donorLocation = await this.geocodeAddress(donor.address);
                }

                if (!donorLocation) {
                    return { ...donor, distance: null, duration: null };
                }

                // Calculate driving route
                const route = await this.calculateDrivingRoute(userLocation, donorLocation);
                
                return {
                    ...donor,
                    location: donorLocation,
                    distance: route.distance,
                    duration: route.duration,
                    routeType: route.type
                };
            })
        );

        // Sort by distance
        return donorsWithDistance.sort((a, b) => {
            if (!a.distance) return 1;
            if (!b.distance) return -1;
            return parseFloat(a.distance) - parseFloat(b.distance);
        });
    }
}

module.exports = new LocationService();
