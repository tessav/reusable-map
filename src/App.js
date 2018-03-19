import React, { Component } from 'react';
import './App.css';
import buildingSVG from './assets/icons/marker-15.svg';
import mapboxgl from 'mapbox-gl';
import buildings from './assets/2017-south-asian-floods-boalkhali-chittagong-bangladesh_planet_osm_point_points.json';
import landuse from './assets/2017-south-asian-floods-boalkhali-chittagong-bangladesh_planet_osm_polygon_polygons.json';
import roads from './assets/2017-south-asian-floods-boalkhali-chittagong-bangladesh_planet_osm_line_lines.json';
import clipbox from './assets/clipping_boundary.json';
mapboxgl.accessToken = 'pk.eyJ1IjoidGVzc2F2MyIsImEiOiJjamRtcGpyOHUwMG13MzJwcW1wazN2a2dnIn0.aSD27NA7KzGc0p8PmhT4Sg';

class App extends Component {
  map;
  popup;
  state = {
    buildings: true,
    landuse: true,
    roads: true,
    keyInfo: true
  }

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [91.9509773, 22.4285309],
      zoom: 12
    });
    this.addIconImage('building', buildingSVG);
    this.popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    this.map.on('load', () => {
      const sources = [
        {key: 'clipbox', data: clipbox},
        {key: 'landuse', data: landuse},
        {key: 'roads', data: roads},
        {key: 'buildings', data: buildings}
      ];
      sources.map((s) => {
        this.map.addSource(s.key, {
          type: 'geojson',
          data: s.data
        });
      });

      this.map.addLayer({
        id: 'clipbox',
        type: 'fill',
        source: 'clipbox',
        'paint': {
          'fill-color': '#088',
          'fill-opacity': 0.1
        }
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
    this.map.on('click', 'buildings', this.updatePopup);
  }

  addIconImage(name, iconSVG) {
    let img = new Image(20,20);
    img.onload = () => this.map.addImage(name, img);
    img.src = iconSVG;
  }

  updatePopup = (e) => {
    this.map.getCanvas().style.cursor = 'pointer';
      var coordinates = e.features[0].geometry.coordinates.slice();
      var properties = e.features[0].properties;
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
      const presentProps = Object.keys(properties).filter((key) => (properties[key] && key !== 'z_index'));
      let html = presentProps.map((key) => {
          return key + " : " + properties[key] + "<br /> ";
        });
      this.popup.setLngLat(coordinates)
          .setHTML(html.join(""))
          .addTo(this.map);
  }

  handleCheckboxChange = (e) => {
    this.setState({[e.target.value]: !this.state[e.target.value]});
    this.map.setLayoutProperty(e.target.value, 'visibility',
      e.target.checked ? 'visible' : 'none');
  };

  handleOverlayChange = (e) => {
    this.setState({keyInfo: !this.state.keyInfo});
  };

  render() {
    return (
      <div className='col12 contain'>
        <div className='quiet'><div id="map"></div></div>
        {this.state.keyInfo ? (<div className='map-overlay top'>
          <div className='map-overlay-inner'>
            <div id='legend' className='legend'>
              <div className='bar'></div>
              <div>
                <span className="area-stats">30%</span> Areas Covered<br />
                <span className="features-stats">4</span> Features Collected
              </div>
            </div>
          </div>
        </div>) : (<span></span>)}
        <div className='col3 pad2 colored pin-left stretch-height'>
          <h3 className="title">Field Data Map Tool</h3>
          <hr className="break" /><br />
          <h3>Filter by layers:</h3><br />
          <input type="checkbox" value="buildings"
            checked={this.state.buildings}
            onChange={this.handleCheckboxChange}/> Buildings<br/>
          <input type="checkbox" value="landuse"
            checked={this.state.landuse}
            onChange={this.handleCheckboxChange} /> Landuse<br/>
          <input type="checkbox" value="roads"
            checked={this.state.roads}
            onChange={this.handleCheckboxChange} /> Roads<br/>
          <br /><br />
          <h3>Display:</h3><br />
          <input type="checkbox" value="keyInfo"
          checked={this.state.keyInfo}
          onChange={this.handleOverlayChange} /> Key Info<br/>
        </div>
      </div>
    );
  }
}

export default App;
