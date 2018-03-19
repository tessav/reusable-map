import React, { Component } from 'react';
import './App.css';
import buildingSVG from './assets/icons/marker-15.svg';
import ReactMapGL from 'react-map-gl';
import buildings from './assets/2017-south-asian-floods-boalkhali-chittagong-bangladesh_planet_osm_point_points.json';
import landuse from './assets/2017-south-asian-floods-boalkhali-chittagong-bangladesh_planet_osm_polygon_polygons.json';
import roads from './assets/2017-south-asian-floods-boalkhali-chittagong-bangladesh_planet_osm_line_lines.json';

mapboxgl.accessToken = 'pk.eyJ1IjoidGVzc2F2MyIsImEiOiJjamRtcGpyOHUwMG13MzJwcW1wazN2a2dnIn0.aSD27NA7KzGc0p8PmhT4Sg';

class App extends Component {
  map;
  popup;

  componentDidMount() {

    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [91.9709773, 22.4085309],
      zoom: 14
    });
    this.addIconImage('building', buildingSVG);
    this.popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    this.map.on('load', () => {

      this.map.addSource('buildings', {
        type: 'geojson',
        data: buildings
      });
      this.map.addSource('landuse', {
        type: 'geojson',
        data: landuse
      });
      this.map.addSource('roads', {
        type: 'geojson',
        data: roads
      });

      this.map.addLayer({
        id: 'landuse',
        type: 'fill',
        source: 'landuse',
        'paint': {
          'fill-color': '#088',
          'fill-opacity': 0.8
        }
      });

      this.map.addLayer({
        id: 'roads',
        type: 'line',
        source: 'roads',
        "layout": {
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
            "line-color": "#888",
            "line-width": 5
        }
      });

      this.map.addLayer({
        id: 'buildings',
        type: 'symbol',
        source: 'buildings',
        layout: {
          "icon-image": "building",
          "icon-allow-overlap": true,
          "text-field": "{properties}",
          "text-font": ["Open Sans Semibold"],
          "text-offset": [0, 0.7],
          "text-anchor": "top"
        }
      }, 'country-label-lg');
    });
    this.map.addControl(new mapboxgl.NavigationControl());
    this.map.on('click', 'buildings', (e) => {
      this.map.getCanvas().style.cursor = 'pointer';
        console.log(e);
        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = e.features[0].properties.description;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        // Populate the popup and set its coordinates
        // based on the feature found.
        this.popup.setLngLat(coordinates)
            .setHTML(description)
            .addTo(this.map);
    });
  }

  addIconImage(name, iconSVG) {
    let img = new Image(20,20);
    img.onload = () => this.map.addImage(name, img);
    img.src = iconSVG;
  }

  render() {
    return (
      <div className='col12 contain'>
        <div className='quiet'><div id="map"></div></div>
        <div className='map-overlay top'>
      <div className='map-overlay-inner'>
          <div id='legend' className='legend'>
              <div className='bar'></div>
              <div>Magnitude (m)</div>
          </div>
      </div>
  </div>
        <div className='col3 pad2 colored pin-left' style={{ height: '100vh'}}>
          <h3 style={{ fontSize: '17px'}}>Field Data Map Tool</h3><br />
          <hr style={{ backgroundColor: '#e7e7e7'}}/><br />
          <h3>Filter by layers:</h3><br />
          <input type="checkbox" value="Bike" /> Buildings<br/>
          <input type="checkbox" value="Bike" /> Landuse<br/>
          <input type="checkbox" value="Bike" /> Roads<br/>
          <br /><br />
          <h3>Filter by features:</h3><br />
          <input type="checkbox" value="Bike" /> Bike<br/>
          <input type="checkbox" value="Bike" /> Bike<br/>
          <input type="checkbox" value="Bike" /> Bike<br/>
          <br /><br />
          <h3>Display key information:</h3><br />
          <input type="checkbox" value="Bike" /> % Mapped<br/>
          <input type="checkbox" value="Bike" /> Feature attributes<br/>
        </div>
      </div>
    );
  }
}

export default App;
