// Enhanced Map Service with Mapbox GL JS (FREE Alternative to Google Maps)
class MapService {
    constructor() {
        this.map = null;
        this.markers = [];
        this.userMarker = null;
    }

    /**
     * Initialize Mapbox GL map (FREE: 50,000 loads/month)
     */
    async initializeMap(containerId, center, zoom = 13) {
        if (!window.mapboxgl) {
            console.error('Mapbox GL JS not loaded');
            return false;
        }

        const mapContainer = document.getElementById(containerId);
        if (!mapContainer) {
            console.error('Map container not found');
            return false;
        }

        // Get Mapbox token from meta tag or use public token
        const mapboxToken = document.querySelector('meta[name="mapbox-token"]')?.content || 
                           'pk.eyJ1IjoiYmxvb2Rib25kIiwiYSI6ImNtNXh5ejB4YjBhZGsyanM4Ym5xdGJ5ZGwifQ.example';

        mapboxgl.accessToken = mapboxToken;

        // Initialize map
        this.map = new mapboxgl.Map({
            container: containerId,
            style: 'mapbox://styles/mapbox/streets-v12', // Free style
            center: [center.lng, center.lat],
            zoom: zoom
        });

        // Add navigation controls
        this.map.addControl(new mapboxgl.NavigationControl());

        // Add fullscreen control
        this.map.addControl(new mapboxgl.FullscreenControl());

        return true;
    }

    /**
     * Add marker to map
     */
    addMarker(position, title, color = '#dc2626', infoContent = null) {
        if (!this.map) return null;

        // Create custom marker element
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.cssText = `
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background-color: ${color};
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            cursor: pointer;
        `;

        // Create marker
        const marker = new mapboxgl.Marker(el)
            .setLngLat([position.lng, position.lat])
            .addTo(this.map);

        // Add popup if content provided
        if (infoContent) {
            const popup = new mapboxgl.Popup({ offset: 25 })
                .setHTML(infoContent);
            marker.setPopup(popup);
        }

        this.markers.push(marker);
        return marker;
    }

    /**
     * Add custom marker with icon
     */
    addCustomMarker(position, title, iconType = 'donor', infoContent = null) {
        if (!this.map) return null;

        const colors = {
            user: '#3b82f6',
            donor: '#dc2626',
            hospital: '#10b981'
        };

        const icons = {
            user: '📍',
            donor: '🩸',
            hospital: '🏥'
        };

        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.innerHTML = icons[iconType] || icons.donor;
        el.style.cssText = `
            font-size: 24px;
            cursor: pointer;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        `;

        const marker = new mapboxgl.Marker(el)
            .setLngLat([position.lng, position.lat])
            .addTo(this.map);

        if (infoContent) {
            const popup = new mapboxgl.Popup({ offset: 25 })
                .setHTML(infoContent);
            marker.setPopup(popup);
        }

        this.markers.push(marker);
        return marker;
    }

    /**
     * Clear all markers
     */
    clearMarkers() {
        this.markers.forEach(marker => marker.remove());
        this.markers = [];
    }

    /**
     * Fit map to show all markers
     */
    fitBounds(locations) {
        if (!this.map || locations.length === 0) return;

        const bounds = new mapboxgl.LngLatBounds();
        locations.forEach(location => {
            bounds.extend([location.lng, location.lat]);
        });

        this.map.fitBounds(bounds, {
            padding: 50,
            maxZoom: 15
        });
    }

    /**
     * Calculate route and display (using OpenRouteService)
     */
    async calculateRoute(origin, destination) {
        // This will be handled by backend API
        // Just open directions in external map
        const url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${origin.lat},${origin.lng};${destination.lat},${destination.lng}`;
        return {
            url: url,
            distance: 'Calculating...',
            duration: 'Calculating...'
        };
    }

    /**
     * Get marker icon colors
     */
    getMarkerColor(type) {
        const colors = {
            user: '#3b82f6',
            donor: '#dc2626',
            hospital: '#10b981'
        };
        return colors[type] || colors.donor;
    }
}

// Address autocomplete using Nominatim (FREE)
class AddressAutocomplete {
    constructor(inputId, onSelect) {
        this.input = document.getElementById(inputId);
        this.onSelect = onSelect;
        this.suggestions = [];
        this.selectedIndex = -1;
        
        if (this.input) {
            this.init();
        }
    }

    init() {
        // Create suggestions container
        this.suggestionsContainer = document.createElement('div');
        this.suggestionsContainer.className = 'address-suggestions';
        this.suggestionsContainer.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #d1d5db;
            border-top: none;
            border-radius: 0 0 8px 8px;
            max-height: 300px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;

        // Make input container relative
        this.input.parentElement.style.position = 'relative';
        this.input.parentElement.appendChild(this.suggestionsContainer);

        // Add event listeners
        let debounceTimer;
        this.input.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => this.search(e.target.value), 300);
        });

        this.input.addEventListener('keydown', (e) => this.handleKeyboard(e));
        document.addEventListener('click', (e) => {
            if (!this.input.contains(e.target) && !this.suggestionsContainer.contains(e.target)) {
                this.hideSuggestions();
            }
        });
    }

    async search(query) {
        if (query.length < 3) {
            this.hideSuggestions();
            return;
        }

        try {
            const response = await fetch(`/api/location/search-addresses?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            this.suggestions = data.suggestions || [];
            this.displaySuggestions();
        } catch (error) {
            console.error('Error searching addresses:', error);
        }
    }

    displaySuggestions() {
        if (this.suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }

        this.suggestionsContainer.innerHTML = this.suggestions.map((suggestion, index) => `
            <div class="suggestion-item" data-index="${index}" style="
                padding: 12px 16px;
                cursor: pointer;
                border-bottom: 1px solid #f3f4f6;
                transition: background 0.2s;
            " onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='white'">
                <div style="font-weight: 500; color: #1f2937;">${suggestion.label.split(',')[0]}</div>
                <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">${suggestion.label}</div>
            </div>
        `).join('');

        this.suggestionsContainer.style.display = 'block';

        // Add click handlers
        this.suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                this.selectSuggestion(index);
            });
        });
    }

    hideSuggestions() {
        this.suggestionsContainer.style.display = 'none';
        this.selectedIndex = -1;
    }

    selectSuggestion(index) {
        const suggestion = this.suggestions[index];
        if (suggestion) {
            this.input.value = suggestion.label;
            this.hideSuggestions();
            
            if (this.onSelect) {
                this.onSelect({
                    formatted_address: suggestion.label,
                    geometry: {
                        location: {
                            lat: () => suggestion.lat,
                            lng: () => suggestion.lng
                        }
                    }
                });
            }
        }
    }

    handleKeyboard(e) {
        const items = this.suggestionsContainer.querySelectorAll('.suggestion-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
            this.highlightItem(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
            this.highlightItem(items);
        } else if (e.key === 'Enter' && this.selectedIndex >= 0) {
            e.preventDefault();
            this.selectSuggestion(this.selectedIndex);
        } else if (e.key === 'Escape') {
            this.hideSuggestions();
        }
    }

    highlightItem(items) {
        items.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.style.background = '#f3f4f6';
            } else {
                item.style.background = 'white';
            }
        });
    }
}

// Initialize function for address autocomplete
function initializeAddressAutocomplete(inputId, onPlaceSelected) {
    return new AddressAutocomplete(inputId, onPlaceSelected);
}

// Export for use in other scripts
window.MapService = MapService;
window.AddressAutocomplete = AddressAutocomplete;
window.initializeAddressAutocomplete = initializeAddressAutocomplete;
