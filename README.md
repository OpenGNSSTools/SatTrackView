# SatTrackView 🛰️

SatTrackView is an interactive web-based visualization tool for tracking GNSS (Global Navigation Satellite Systems) satellites in real-time. The application displays the positions of GPS, GLONASS, Galileo, and BeiDou satellites on a world map and provides detailed information about their visibility and orbital parameters.

![image](https://github.com/user-attachments/assets/e01807b2-9beb-4dee-9362-5fc84a4ad602)

![image](https://github.com/user-attachments/assets/92fb4426-c9cb-488a-83f9-dcaa9e254ec7)



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
- **Multiple Location Selection Methods**:
  - Manual coordinate input
  - Current location detection
  - Map click selection
- **Satellite Visibility Calculation**: Based on observer position
- **Elevation and Azimuth Angle Display**:
- **Time-based Position Simulation**:
- **Responsive Design**:
- **Dark Mode Interface**:

## Usage

1. Select your observation location using one of these methods:
   - Enter coordinates manually
   - Use your current location
   - Click on the map to select a location
2. Choose the date and time for satellite positions
3. View satellite information in the table below the map
4. Filter satellites by constellation using the checkboxes

## Installation

No installation required. Simply visit [https://opengnsstools.github.io/SatTrackView](https://opengnsstools.github.io/SatTrackView)

## Development

To run locally:

1. Clone the repository
2. Open index.html in your browser
3. No build process required - uses vanilla JavaScript

## Dependencies

- Leaflet.js for map visualization
- Satellite.js for orbital calculations
- Font Awesome for icons

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Technologies Used 💻

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Map Library**: Leaflet.js
- **Satellite Calculations**: Satellite.js
- **Data Source**: CelesTrak API
- **CORS Proxy**: AllOrigins
