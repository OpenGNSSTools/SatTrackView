class SatTrackView {
    constructor() {
        this.map = null;
        this.currentMarker = null;
        this.defaultZoom = 2;
        this.locationZoom = 8;
        this.satellites = new Map();
        this.satelliteGroups = {
            'gps': 'gps-ops',       // GPS operational satellites
            'glonass': 'glo-ops',   // GLONASS operational satellites
            'galileo': 'galileo',   // Galileo satellites
            'beidou': 'beidou'      // BeiDou satellites
        };
        this.selectedGroup = 'all'; // Default to showing all GNSS satellites
        this.satelliteMarkers = new Map();
        this.selectedSatellite = null;
        this.updateInterval = null;
        this.observerPosition = { 
            latitude: 39.9334, 
            longitude: 32.8597 
        };
        this.isPickingLocation = false;
        
        this.initializeMap();
        this.setupEventListeners();
        this.setupLocationControls();
        this.loadAllGNSSSatellites(); // Load all GNSS satellites at start
    }

    initializeMap() {
        // Initialize the map centered on (0, 0)
        this.map = L.map('map').setView([0, 0], this.defaultZoom);
        
        // Add OpenStreetMap tiles with attribution
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
            minZoom: 2
        }).addTo(this.map);

        // Add scale control
        L.control.scale({
            imperial: false,
            position: 'bottomright'
        }).addTo(this.map);

        // Lejant kontrolünü ekle
        const legend = L.control({position: 'bottomright'});
        legend.onAdd = () => {
            const div = L.DomUtil.create('div', 'leaflet-control-legend');
            div.innerHTML = `
                <h4>GNSS Systems</h4>
                <div class="legend-item">
                    <div class="legend-color" style="background:#4CAF50"></div>
                    <span>GPS</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#2196F3"></div>
                    <span>GLONASS</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#FFC107"></div>
                    <span>Galileo</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background:#F44336"></div>
                    <span>BeiDou</span>
                </div>
            `;
            return div;
        };
        legend.addTo(this.map);
    }

    updateLocation(latitude, longitude, description = 'Selected Location') {
        // Remove existing marker if any
        if (this.currentMarker) {
            this.map.removeLayer(this.currentMarker);
        }

        // Create and add new marker
        this.currentMarker = L.marker([latitude, longitude], {
            title: description,
            draggable: true
        }).addTo(this.map);

        // Handle marker drag events to update input fields
        this.currentMarker.on('dragend', (event) => {
            const marker = event.target;
            const position = marker.getLatLng();
            this.observerPosition = { 
                latitude: position.lat, 
                longitude: position.lng 
            };
            this.updateInputFields(position.lat, position.lng);
            this.loadAllGNSSSatellites();
        });

        // Pan map to new location
        this.map.setView([latitude, longitude], this.locationZoom);
    }

    updateInputFields(latitude, longitude) {
        document.getElementById('latitude').value = latitude.toFixed(6);
        document.getElementById('longitude').value = longitude.toFixed(6);
    }

    setupLocationControls() {
        // Set Coordinates button
        document.getElementById('set-coordinates').addEventListener('click', () => {
            const latInput = document.getElementById('latitude');
            const lonInput = document.getElementById('longitude');
            const lat = parseFloat(latInput.value);
            const lon = parseFloat(lonInput.value);
            
            try {
                if (this.validateCoordinates(lat, lon)) {
                    this.observerPosition = { latitude: lat, longitude: lon };
                    this.updateLocation(lat, lon);
                    this.loadAllGNSSSatellites();
                    this.showLocationFeedback('Location set successfully!', 'success');
                    
                    // Clear any previous error states
                    latInput.classList.remove('invalid');
                    lonInput.classList.remove('invalid');
                }
            } catch (error) {
                this.showLocationFeedback(error.message, 'error');
                
                // Show which input is invalid
                if (isNaN(lat) || lat < -90 || lat > 90) {
                    latInput.classList.add('invalid');
                }
                if (isNaN(lon) || lon < -180 || lon > 180) {
                    lonInput.classList.add('invalid');
                }
            }
        });

        // Use Current Location button
        document.getElementById('use-current-location').addEventListener('click', () => {
            if ("geolocation" in navigator) {
                this.showLocationFeedback('Getting your location...', 'info');
                
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;
                        this.observerPosition = { latitude: lat, longitude: lon };
                        this.updateLocation(lat, lon);
                        this.loadAllGNSSSatellites();
                        
                        // Update input fields
                        document.getElementById('latitude').value = lat.toFixed(6);
                        document.getElementById('longitude').value = lon.toFixed(6);
                        
                        this.showLocationFeedback('Location set to your current position!', 'success');
                    },
                    (error) => {
                        this.showLocationFeedback(`Error getting location: ${error.message}`, 'error');
                    }
                );
            } else {
                this.showLocationFeedback('Geolocation is not supported by your browser', 'error');
            }
        });

        // Pick on Map button
        const pickButton = document.getElementById('pick-on-map');
        pickButton.addEventListener('click', () => {
            this.isPickingLocation = !this.isPickingLocation;
            
            if (this.isPickingLocation) {
                document.getElementById('map').classList.add('picking-location-cursor');
                pickButton.textContent = 'Cancel Selection';
                pickButton.classList.add('picking-location');
                this.showLocationFeedback('Click anywhere on the map to set location', 'info');
                
                // Mouse takibi için event listener ekle
                this.map.getContainer().addEventListener('mousemove', this.updatePickerPosition);
            } else {
                this.cancelLocationPicking();
            }
        });

        // Map click handler
        this.map.on('click', (e) => {
            if (this.isPickingLocation) {
                const lat = e.latlng.lat;
                const lon = e.latlng.lng;
                
                this.observerPosition = { latitude: lat, longitude: lon };
                this.updateLocation(lat, lon);
                this.loadAllGNSSSatellites();
                
                // Update input fields
                document.getElementById('latitude').value = lat.toFixed(6);
                document.getElementById('longitude').value = lon.toFixed(6);
                
                this.showLocationFeedback('Location selected from map!', 'success');
                this.cancelLocationPicking();
            }
        });
    }

    // Picker pozisyonunu güncelle
    updatePickerPosition = (e) => {
        const cursor = document.querySelector('.picking-location-cursor::before');
        if (cursor) {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
        }
    }

    // Helper method to cancel location picking mode
    cancelLocationPicking() {
        this.isPickingLocation = false;
        document.getElementById('map').classList.remove('picking-location-cursor');
        const pickButton = document.getElementById('pick-on-map');
        pickButton.innerHTML = '<i class="fas fa-map-marker-alt"></i> Pick on Map';
        pickButton.classList.remove('picking-location');
        
        // Mouse takip event listener'ını kaldır
        this.map.getContainer().removeEventListener('mousemove', this.updatePickerPosition);
    }

    // Helper method to show location feedback
    showLocationFeedback(message, type) {
        const feedbackDiv = document.querySelector('.location-feedback') || 
                           document.createElement('div');
        feedbackDiv.className = `location-feedback ${type}`;
        feedbackDiv.textContent = message;
        
        if (!document.querySelector('.location-feedback')) {
            document.querySelector('.location-controls').appendChild(feedbackDiv);
        }
        
        // Auto-hide success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                feedbackDiv.style.display = 'none';
            }, 3000);
        }
    }

    async loadAllGNSSSatellites() {
        try {
            // Clear existing data
            this.satellites.clear();
            this.clearSatelliteMarkers();
            
            // Show loading state
            const container = document.getElementById('satellite-details');
            if (!document.getElementById('satellite-table')) {
                // Tablo daha önce oluşturulmamışsa oluştur
                container.innerHTML = `
                    <div class="satellite-table-container">
                        <table id="satellite-table">
                            <thead>
                                <tr>
                                    <th>Status</th>
                                    <th>Satellite Name</th>
                                    <th>Constellation</th>
                                    <th>Elevation</th>
                                    <th>Azimuth</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="loading-row">
                                    <td colspan="5">Loading satellite data...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `;
            } else {
                // Tablo zaten varsa sadece loading mesajını göster
                const tbody = document.querySelector('#satellite-table tbody');
                tbody.innerHTML = `
                    <tr class="loading-row">
                        <td colspan="5">Loading satellite data...</td>
                    </tr>
                `;
            }

            // Fetch data for all GNSS constellations
            const allSatellites = await Promise.all(
                Object.entries(this.satelliteGroups).map(async ([group, celestrakGroup]) => {
                    const satellites = await this.fetchTLEData(group);
                    return satellites.map(sat => ({...sat, constellation: group}));
                })
            );

            // Flatten and process all satellite data
            const satellites = allSatellites.flat();
            
            if (satellites.length === 0) {
                throw new Error('No GNSS satellite data received');
            }

            // Store all satellite data
            satellites.forEach(sat => {
                this.satellites.set(sat.name, {
                    name: sat.name,
                    tle1: sat.tle1,
                    tle2: sat.tle2,
                    satrec: satellite.twoline2satrec(sat.tle1, sat.tle2),
                    constellation: sat.constellation
                });
            });

            // Loading mesajını temizle
            const loadingRow = document.querySelector('.loading-row');
            if (loadingRow) {
                loadingRow.remove();
            }

            this.startSatelliteTracking();
            
        } catch (error) {
            console.error('Error loading GNSS satellite data:', error);
            const tbody = document.querySelector('#satellite-table tbody');
            tbody.innerHTML = `
                <tr class="error-message">
                    <td colspan="5">
                        Failed to load GNSS satellite data. 
                        <button onclick="window.satTrackView.loadAllGNSSSatellites()" class="retry-button">
                            Try Again
                        </button>
                    </td>
                </tr>
            `;
        }
    }

    async fetchTLEData(group) {
        const corsProxy = 'https://api.allorigins.win/raw?url=';
        const baseUrl = 'https://celestrak.org/NORAD/elements/gp.php';
        const url = `${corsProxy}${encodeURIComponent(baseUrl)}?GROUP=${this.satelliteGroups[group]}`;

        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const tleData = await response.text();
            return this.parseTLEData(tleData);
            
        } catch (error) {
            console.error(`Error fetching ${group} data:`, error);
            throw error;
        }
    }

    parseTLEData(tleData) {
        const lines = tleData.trim().split('\n');
        const satellites = [];

        // Process three lines at a time (name, tle1, tle2)
        for (let i = 0; i < lines.length; i += 3) {
            if (i + 2 < lines.length) {
                const name = lines[i].trim();
                const tle1 = lines[i + 1].trim();
                const tle2 = lines[i + 2].trim();

                if (this.validateTLE(tle1, tle2)) {
                    satellites.push({ name, tle1, tle2 });
                }
            }
        }
        return satellites;
    }

    validateTLE(tle1, tle2) {
        const tle1Regex = /^1 [\d ]{5}[A-Z] .*$/;
        const tle2Regex = /^2 [\d ]{5} .*$/;
        return tle1Regex.test(tle1) && tle2Regex.test(tle2);
    }

    calculateSatellitePosition(satrec, datetime) {
        // Get position in km
        const positionAndVelocity = satellite.propagate(satrec, datetime);
        const positionEci = positionAndVelocity.position;
        
        if (!positionEci) {
            return null;
        }

        // Get GMST for coordinate transforms
        const gmst = satellite.gstime(datetime);
        
        // Convert to geographic coordinates
        const positionGd = satellite.eciToGeodetic(positionEci, gmst);
        
        // Return position in degrees
        return {
            latitude: satellite.degreesLat(positionGd.latitude),
            longitude: satellite.degreesLong(positionGd.longitude),
            height: positionGd.height * 1000 // Convert to meters
        };
    }

    calculateSatelliteVisibility(position, satellitePosition) {
        // Calculate if satellite is above horizon from observer position
        const observerLat = position.latitude * (Math.PI / 180);  // Convert to radians
        const observerLon = position.longitude * (Math.PI / 180);
        const satelliteLat = satellitePosition.latitude * (Math.PI / 180);
        const satelliteLon = satellitePosition.longitude * (Math.PI / 180);
        
        // Calculate great circle distance
        const R = 6371; // Earth's radius in km
        const dLat = satelliteLat - observerLat;
        const dLon = satelliteLon - observerLon;
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                 Math.cos(observerLat) * Math.cos(satelliteLat) *
                 Math.sin(dLon/2) * Math.sin(dLon/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        // Calculate elevation angle
        const satelliteHeight = satellitePosition.height / 1000; // Convert to km
        const elevation = Math.asin((satelliteHeight) / 
                         Math.sqrt(Math.pow(distance, 2) + Math.pow(satelliteHeight, 2)));
        
        return {
            visible: elevation > 0,
            elevation: elevation * (180 / Math.PI), // Convert to degrees
            distance: distance
        };
    }

    calculateSatelliteAngles(observerPosition, satellitePosition) {
        // Convert all angles to radians
        const lat1 = observerPosition.latitude * (Math.PI / 180);
        const lon1 = observerPosition.longitude * (Math.PI / 180);
        const lat2 = satellitePosition.latitude * (Math.PI / 180);
        const lon2 = satellitePosition.longitude * (Math.PI / 180);

        // Calculate azimuth
        const dLon = lon2 - lon1;
        const y = Math.sin(dLon) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) -
                 Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
        let azimuth = Math.atan2(y, x);
        azimuth = azimuth * (180 / Math.PI); // Convert to degrees
        azimuth = (azimuth + 360) % 360; // Normalize to 0-360

        // Get elevation from visibility calculation
        const visibility = this.calculateSatelliteVisibility(observerPosition, satellitePosition);

        return {
            azimuth: azimuth,
            elevation: visibility.elevation,
            distance: visibility.distance,
            visible: visibility.visible
        };
    }

    formatAzimuth(azimuth) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                          'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(azimuth / 22.5) % 16;
        return `${azimuth.toFixed(1)}° (${directions[index]})`;
    }

    updateSatelliteInfo(satellite, position, angles) {
        const tbody = document.querySelector('#satellite-table tbody');
        const rowId = `satellite-${satellite.name.replace(/\s+/g, '-')}`;
        let row = document.getElementById(rowId);

        // Loading mesajını temizle
        const loadingRow = tbody.querySelector('.loading-row');
        if (loadingRow) {
            loadingRow.remove();
        }

        if (!row) {
            row = tbody.insertRow();
            row.id = rowId;
        }

        row.className = angles.visible ? 'visible' : 'not-visible';
        row.innerHTML = `
            <td style="width: 100px;">
                <span class="status-indicator status-${angles.visible ? 'visible' : 'not-visible'}"></span>
                ${angles.visible ? 'Visible' : 'Not Visible'}
            </td>
            <td>${satellite.name}</td>
            <td>
                <span class="constellation-badge ${satellite.constellation}">
                    ${satellite.constellation.toUpperCase()}
                </span>
            </td>
            <td>${angles.elevation.toFixed(1)}°</td>
            <td>${this.formatAzimuth(angles.azimuth)}</td>
        `;
    }

    createSatelliteIcon(visible, elevation, constellation) {
        const colors = {
            'gps': '#4CAF50',      // Green for GPS
            'glonass': '#2196F3',  // Blue for GLONASS
            'galileo': '#FFC107',  // Yellow for Galileo
            'beidou': '#F44336'    // Red for BeiDou
        };

        const color = visible ? colors[constellation] || '#757575' : '#757575';
        const size = 24;
        
        return L.divIcon({
            html: `
                <div class="satellite-icon" style="color: ${color};">
                    <span class="icon">🛰️</span>
                    <div class="elevation-indicator" style="transform: rotate(${elevation}deg)"></div>
                </div>
            `,
            className: `satellite-marker ${visible ? 'visible' : 'not-visible'} ${constellation}`,
            iconSize: [size, size],
            iconAnchor: [size/2, size/2],
            popupAnchor: [0, -size/2]
        });
    }

    createPopupContent(name, position, angles) {
        return `
            <div class="satellite-popup">
                <h3>${name}</h3>
                <div class="popup-grid">
                    <div class="popup-section">
                        <h4>Position</h4>
                        <p>Latitude: ${position.latitude.toFixed(4)}°</p>
                        <p>Longitude: ${position.longitude.toFixed(4)}°</p>
                        <p>Altitude: ${(position.height / 1000).toFixed(1)} km</p>
                    </div>
                    <div class="popup-section">
                        <h4>Visibility</h4>
                        <p class="status ${angles.visible ? 'visible' : 'not-visible'}">
                            ${angles.visible ? 'Currently Visible' : 'Below Horizon'}
                        </p>
                        <p>Elevation: ${angles.elevation.toFixed(1)}°</p>
                        <p>Azimuth: ${this.formatAzimuth(angles.azimuth)}</p>
                        <p>Distance: ${angles.distance.toFixed(1)} km</p>
                    </div>
                </div>
            </div>
        `;
    }

    updateSatelliteMarkers() {
        const currentTime = this.getCurrentDateTime();

        // Clear existing satellite info if no observer position
        if (!this.observerPosition) {
            document.getElementById('satellite-details').innerHTML = 
                '<p class="no-data">Select a location to view satellite information</p>';
        }

        this.satellites.forEach((sat, name) => {
            const position = this.calculateSatellitePosition(sat.satrec, currentTime);
            
            if (position) {
                let marker = this.satelliteMarkers.get(name);
                let visibility = this.observerPosition 
                    ? this.calculateSatelliteVisibility(this.observerPosition, position)
                    : null;
                let angles = this.observerPosition
                    ? this.calculateSatelliteAngles(this.observerPosition, position)
                    : null;
                
                if (!marker) {
                    // Create new marker with enhanced icon
                    const satelliteIcon = this.createSatelliteIcon(
                        visibility?.visible || false,
                        angles?.elevation || 0,
                        sat.constellation
                    );

                    marker = L.marker([position.latitude, position.longitude], {
                        icon: satelliteIcon,
                        title: name,
                        riseOnHover: true
                    }).addTo(this.map);
                    
                    this.satelliteMarkers.set(name, marker);
                } else {
                    // Update existing marker
                    marker.setLatLng([position.latitude, position.longitude]);
                    marker.setIcon(this.createSatelliteIcon(
                        visibility?.visible || false,
                        angles?.elevation || 0,
                        sat.constellation
                    ));
                }

                // Create enhanced popup content
                if (angles) {
                    const popupContent = this.createPopupContent(name, position, angles);
                    marker.bindPopup(popupContent, {
                        maxWidth: 300,
                        className: 'satellite-popup'
                    });
                }

                // Update satellite information panel
                if (this.observerPosition) {
                    this.updateSatelliteInfo(sat, position, angles);
                }
            }
        });
    }

    startSatelliteTracking() {
        // Update satellite positions every 1 second
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        this.updateSatelliteMarkers(); // Initial update
        this.updateInterval = setInterval(() => {
            this.updateSatelliteMarkers();
        }, 1000);
    }

    validateCoordinates(latitude, longitude) {
        if (isNaN(latitude) || isNaN(longitude)) {
            throw new Error("Coordinates must be numbers");
        }
        if (latitude < -90 || latitude > 90) {
            throw new Error("Latitude must be between -90 and 90 degrees");
        }
        if (longitude < -180 || longitude > 180) {
            throw new Error("Longitude must be between -180 and 180 degrees");
        }
        return true;
    }

    setupEventListeners() {
        const datePicker = document.getElementById('date-picker');
        const timeSlider = document.getElementById('time-slider');
        const timeDisplay = document.getElementById('time-display');

        // Set current date as default
        const now = new Date();
        datePicker.value = now.toISOString().split('T')[0];
        datePicker.min = new Date(now.getTime() - 24*60*60*1000).toISOString().split('T')[0];
        datePicker.max = new Date(now.getTime() + 7*24*60*60*1000).toISOString().split('T')[0];

        // Set current time in slider
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        timeSlider.value = currentMinutes;
        timeDisplay.textContent = this.formatTime(currentMinutes);

        // Time slider event
        timeSlider.addEventListener('input', (e) => {
            const minutes = parseInt(e.target.value);
            timeDisplay.textContent = this.formatTime(minutes);
            this.updateSatelliteMarkers();
        });

        // Date picker event
        datePicker.addEventListener('change', () => {
            const selectedDate = new Date(datePicker.value);
            const now = new Date();
            
            if (selectedDate < new Date(now.getTime() - 24*60*60*1000) || 
                selectedDate > new Date(now.getTime() + 7*24*60*60*1000)) {
                alert("Please select a date between yesterday and 7 days from now");
                datePicker.value = now.toISOString().split('T')[0];
            }
            
            this.updateSatelliteMarkers();
        });

        // Add constellation filter
        const filterContainer = document.createElement('div');
        filterContainer.className = 'constellation-filter';
        filterContainer.innerHTML = `
            <label>Filter Constellations:</label>
            <div class="filter-options">
                <label><input type="checkbox" value="all" checked> All</label>
                <label><input type="checkbox" value="gps" checked> GPS</label>
                <label><input type="checkbox" value="glonass" checked> GLONASS</label>
                <label><input type="checkbox" value="galileo" checked> Galileo</label>
                <label><input type="checkbox" value="beidou" checked> BeiDou</label>
            </div>
        `;

        document.querySelector('.controls-panel').appendChild(filterContainer);

        // Handle constellation filtering
        const filterCheckboxes = filterContainer.querySelectorAll('input[type="checkbox"]');
        filterCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const allCheckbox = filterContainer.querySelector('input[value="all"]');
                
                if (e.target.value === 'all') {
                    filterCheckboxes.forEach(cb => {
                        if (cb !== allCheckbox) {
                            cb.checked = e.target.checked;
                        }
                    });
                } else {
                    const activeFilters = Array.from(filterCheckboxes)
                        .filter(cb => cb !== allCheckbox && cb.checked)
                        .map(cb => cb.value);
                    
                    allCheckbox.checked = activeFilters.length === 4;
                }

                this.updateVisibleSatellites();
            });
        });
    }

    updateVisibleSatellites() {
        const activeFilters = Array.from(
            document.querySelectorAll('.constellation-filter input[type="checkbox"]:checked')
        ).map(cb => cb.value).filter(v => v !== 'all');

        // Harita üzerindeki işaretçileri güncelle
        this.satelliteMarkers.forEach((marker, name) => {
            const satellite = this.satellites.get(name);
            if (satellite) {
                const visible = activeFilters.includes(satellite.constellation);
                marker.getElement().style.display = visible ? 'block' : 'none';
                
                // Tablo satırını bul ve görünürlüğünü güncelle
                const row = document.getElementById(`satellite-${name.replace(/\s+/g, '-')}`);
                if (row) {
                    row.style.display = visible ? '' : 'none'; // 'none' yerine boş string kullan
                }
            }
        });

        // Tablo başlıklarının genişliklerini koru
        const table = document.getElementById('satellite-table');
        const headers = table.getElementsByTagName('th');
        const firstRow = table.querySelector('tbody tr:not([style*="display: none"])');
        
        if (firstRow) {
            const cells = firstRow.getElementsByTagName('td');
            for (let i = 0; i < headers.length; i++) {
                if (cells[i]) {
                    headers[i].style.width = `${cells[i].offsetWidth}px`;
                }
            }
        }
    }

    clearSatelliteMarkers() {
        this.satelliteMarkers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.satelliteMarkers.clear();
    }

    formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    getCurrentDateTime() {
        const datePicker = document.getElementById('date-picker');
        const timeSlider = document.getElementById('time-slider');
        
        const date = new Date(datePicker.value);
        const minutes = parseInt(timeSlider.value);
        
        date.setHours(Math.floor(minutes / 60));
        date.setMinutes(minutes % 60);
        date.setSeconds(0);
        
        return date;
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.satTrackView = new SatTrackView();
}); 