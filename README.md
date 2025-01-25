# SatTrackView 🛰️

SatTrackView is an interactive web-based visualization tool for tracking GNSS (Global Navigation Satellite Systems) satellites in real-time. The application displays the positions of GPS, GLONASS, Galileo, and BeiDou satellites on a world map and provides detailed information about their visibility and orbital parameters.

## Features 🌟

- **Real-time Satellite Tracking**: Visualize GNSS satellite positions updated every second
- **Multiple GNSS Constellations**:
  - GPS
  - GLONASS
  - Galileo
  - BeiDou
- **Interactive Map Interface**: Built with Leaflet.js for smooth map interactions
- **Time Control**: Select custom dates and times using an intuitive slider
- **Satellite Information**:
  - Visibility status
  - Elevation angle
  - Azimuth (with cardinal directions)
- **Filtering Options**: Filter satellites by constellation
- **Color-coded Visualization**: Each constellation has a unique color for easy identification
- **Detailed Satellite Data**: Comprehensive information table for all visible satellites

## Technologies Used 💻

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Map Library**: Leaflet.js
- **Satellite Calculations**: Satellite.js
- **Data Source**: CelesTrak API
- **CORS Proxy**: AllOrigins