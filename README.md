# SatTrackView 🛰️

SatTrackView is an interactive web-based visualization tool for tracking GNSS (Global Navigation Satellite Systems) satellites in real-time. The application displays the positions of GPS, GLONASS, Galileo, and BeiDou satellites on a world map and provides detailed information about their visibility and orbital parameters.

![image](https://github.com/user-attachments/assets/5e80c98e-98bf-44aa-b935-843e224ca29c)


![image](https://github.com/user-attachments/assets/03b2d622-808f-4727-b48f-91bf1b6eb955)




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
- **Satellite Visibility Calculation**: Based on observer position and satellite elevation angle
- **Elevation and Azimuth Angle Display**: Real-time calculation and display of satellite elevation and azimuth angles relative to observer
- **Time-based Position Simulation**: Ability to simulate satellite positions at any date/time
- **Responsive Design**: Optimized layout for desktop, tablet and mobile devices
- **Dark Mode Interface**: Eye-friendly dark theme for comfortable nighttime viewing

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
