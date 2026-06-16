// Map Service using Leaflet + OpenStreetMap (100% FREE, no token needed)
class MapService {
    constructor() {
        this.map = null;
        this.markers = [];
    }

    /**
     * Initialize Leaflet map with OpenStreetMap tiles — no API key required
     */
    async initializeMap(containerId, center, zoom = 13) {
        if (!window.L) {
            console.error('Leaflet not loaded');
            return false;
        }

        const mapContainer = document.getElementById(containerId);
        if (!mapContainer) {
            console.error('Map container not found');
            return false;
        }

        // Destroy existing map instance to avoid double-init errors
        if (this.map) {
            this.map.remove();
            this.map = null;
        }

        // Create Leaflet map
        this.map = L.map(containerId).setView([center.lat, center.lng], zoom);

        // OpenStreetMap tiles — completely free, no token required
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(this.map);

        return true;
    }

    /**
     * Add a circle marker (fallback / generic)
     */
    addMarker(position, title, color = '#dc2626', infoContent = null) {
        if (!this.map) return null;

        const marker = L.circleMarker([position.lat, position.lng], {
            radius: 10,
            fillColor: color,
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
        }).addTo(this.map);

        if (infoContent) {
            marker.bindPopup(infoContent);
        } else if (title) {
            marker.bindTooltip(title);
        }

        this.markers.push(marker);
        return marker;
    }

    /**
     * Add an emoji marker (user 📍 / donor 🩸 / hospital 🏥)
     */
    addCustomMarker(position, title, iconType = 'donor', infoContent = null) {
        if (!this.map) return null;

        const icons = { user: '📍', donor: '🩸', hospital: '🏥' };
        const emoji = icons[iconType] || icons.donor;

        const icon = L.divIcon({
            html: `<span style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4))">${emoji}</span>`,
            className: '',
            iconSize: [30, 30],
            iconAnchor: [15, 28],
            popupAnchor: [0, -28]
        });

        const marker = L.marker([position.lat, position.lng], { icon, title }).addTo(this.map);

        if (infoContent) {
            marker.bindPopup(infoContent);
        }

        this.markers.push(marker);
        return marker;
    }

    /**
     * Remove all markers from the map
     */
    clearMarkers() {
        this.markers.forEach(marker => {
            if (this.map) this.map.removeLayer(marker);
        });
        this.markers = [];
    }

    /**
     * Fit the map view to show all provided lat/lng locations
     */
    fitBounds(locations) {
        if (!this.map || locations.length === 0) return;

        const latLngs = locations
            .filter(l => l && l.lat && l.lng)
            .map(l => [l.lat, l.lng]);

        if (latLngs.length > 0) {
            this.map.fitBounds(L.latLngBounds(latLngs), { padding: [50, 50], maxZoom: 15 });
        }
    }

    /**
     * Return an OpenStreetMap directions URL (opens in new tab)
     */
    calculateRoute(origin, destination) {
        const url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car` +
                    `&route=${origin.lat},${origin.lng};${destination.lat},${destination.lng}`;
        return { url };
    }

    getMarkerColor(type) {
        const colors = { user: '#3b82f6', donor: '#dc2626', hospital: '#10b981' };
        return colors[type] || colors.donor;
    }
}

// ---------------------------------------------------------------------------
// Address Autocomplete powered by Nominatim (OpenStreetMap) — FREE, no key
// ---------------------------------------------------------------------------
class AddressAutocomplete {
    constructor(inputId, onSelect) {
        this.input = document.getElementById(inputId);
        this.onSelect = onSelect;
        this.suggestions = [];
        this.selectedIndex = -1;

        if (this.input) this.init();
    }

    init() {
        // Dropdown container
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'address-suggestions';
        this.dropdown.style.cssText = `
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

        this.input.parentElement.style.position = 'relative';
        this.input.parentElement.appendChild(this.dropdown);

        let timer;
        this.input.addEventListener('input', (e) => {
            clearTimeout(timer);
            timer = setTimeout(() => this.search(e.target.value), 300);
        });

        this.input.addEventListener('keydown', (e) => this.handleKeyboard(e));

        document.addEventListener('click', (e) => {
            if (!this.input.contains(e.target) && !this.dropdown.contains(e.target)) {
                this.hide();
            }
        });
    }

    async search(query) {
        if (query.length < 3) { this.hide(); return; }

        try {
            const res = await fetch(`/api/location/search-addresses?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            this.suggestions = data.suggestions || [];
            this.render();
        } catch (err) {
            console.error('Autocomplete error:', err);
        }
    }

    render() {
        if (this.suggestions.length === 0) { this.hide(); return; }

        this.dropdown.innerHTML = this.suggestions.map((s, i) => `
            <div class="suggestion-item" data-index="${i}" style="
                padding: 12px 16px;
                cursor: pointer;
                border-bottom: 1px solid #f3f4f6;
            " onmouseover="this.style.background='#f9fafb'"
               onmouseout="this.style.background='white'">
                <div style="font-weight:500;color:#1f2937">${s.label.split(',')[0]}</div>
                <div style="font-size:12px;color:#6b7280;margin-top:2px">${s.label}</div>
            </div>
        `).join('');

        this.dropdown.style.display = 'block';

        this.dropdown.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => this.select(parseInt(item.dataset.index)));
        });
    }

    hide() {
        this.dropdown.style.display = 'none';
        this.selectedIndex = -1;
    }

    select(index) {
        const s = this.suggestions[index];
        if (!s) return;
        this.input.value = s.label;
        this.hide();
        if (this.onSelect) {
            this.onSelect({
                formatted_address: s.label,
                geometry: { location: { lat: () => s.lat, lng: () => s.lng } }
            });
        }
    }

    handleKeyboard(e) {
        const items = this.dropdown.querySelectorAll('.suggestion-item');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        } else if (e.key === 'Enter' && this.selectedIndex >= 0) {
            e.preventDefault();
            this.select(this.selectedIndex);
            return;
        } else if (e.key === 'Escape') {
            this.hide();
            return;
        }
        items.forEach((item, i) => {
            item.style.background = i === this.selectedIndex ? '#f3f4f6' : 'white';
        });
    }
}

function initializeAddressAutocomplete(inputId, onPlaceSelected) {
    return new AddressAutocomplete(inputId, onPlaceSelected);
}

window.MapService = MapService;
window.AddressAutocomplete = AddressAutocomplete;
window.initializeAddressAutocomplete = initializeAddressAutocomplete;
