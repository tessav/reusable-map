import React, { Component } from 'react';
import './App.css';
import buildingSVG from './assets/icons/marker-15.svg';
import mapboxgl from 'mapbox-gl';
import buildings from './assets/buildings.json';
import landuse from './assets/landuse.json';
import roads from './assets/roads.json';

mapboxgl.accessToken = 'pk.eyJ1IjoidGVzc2F2MyIsImEiOiJjamRtcGpyOHUwMG13MzJwcW1wazN2a2dnIn0.aSD27NA7KzGc0p8PmhT4Sg';

class App extends Component {
  map;

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [-149.85, 61.21],
      zoom: 13
    });
    this.addIconImage('building', buildingSVG);

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
          "icon-image": "{icon}",
          "text-field": "{title}",
          "text-font": ["Open Sans Semibold"],
          "text-offset": [0, 0.7],
          "text-anchor": "top"
        }
      }, 'country-label-lg');
    });
    this.map.addControl(new mapboxgl.NavigationControl());
  }

  addIconImage(name, iconSVG) {
    let img = new Image(20,20);
    img.onload = () => this.map.addImage(name, img);
    img.src = iconSVG;
  }

  render() {
    return (
      <div id="map"></div>
    );
  }
}

export default App;
