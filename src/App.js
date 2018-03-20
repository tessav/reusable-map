import React, { Component } from 'react';
import './App.css';
import toiletsSVG from './assets/icons-used/toilet-15.svg';
import educationSVG from './assets/icons-used/school-15.svg';
import healthcareSVG from './assets/icons-used/doctor-15.svg';
import policeSVG from './assets/icons-used/police-15.svg';
import mapboxgl from 'mapbox-gl';
import buildings from './assets/points.json';
import roads from './assets/lines.geojson';
import landuse from './assets/multipolygons.geojson';
import clipbox from './assets/boundary.geojson';
import categories from './assets/category_mapping.json';
mapboxgl.accessToken = 'pk.eyJ1IjoidGVzc2F2MyIsImEiOiJjamRtcGpyOHUwMG13MzJwcW1wazN2a2dnIn0.aSD27NA7KzGc0p8PmhT4Sg';

class App extends Component {
  map;
  popup;
  state = {
    buildings: true,
    landuse: true,
    roads: true,
    keyInfo: true,
    healthcare: true,
    toilets: true,
    police: true,
    education: true,
    others: true
  }

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [103.9198, 1.3331],
      zoom: 12
    });
    this.addIconImage('healthcare', healthcareSVG);
    this.addIconImage('toilets', toiletsSVG);
    this.addIconImage('education', educationSVG);
    this.addIconImage('police', policeSVG);
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
      sources.forEach((s) => {
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
      buildings.features.forEach((f) => {
        if (f.properties.amenity) {
          let cat = categories[f.properties.amenity];
          if (!this.map.getLayer(cat)) {
            this.map.addLayer({
              id: cat,
              type: 'symbol',
              source: 'buildings',
              layout: {
                "icon-image": cat,
                "icon-allow-overlap": false
              },
              "filter": ["==", "amenity", f.properties.amenity]
            }, 'country-label-lg');
            this.map.on('click', cat, this.updatePopup);
          }
        }
      });
    });
    this.map.addControl(new mapboxgl.NavigationControl());
  }

  addFeatureLayer = () => {
    // for each icon
  };

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
      const presentProps = Object.keys(properties).filter(
        (key) => (this.checkValidFeature(properties, key)));
      let html = presentProps.map((key) => {
          return key + " : " + properties[key] + "<br /> ";
        });
      this.popup.setLngLat(coordinates)
          .setHTML(html.join(""))
          .addTo(this.map);
  };

  checkValidFeature = (p, key) => {
    const invalidKeys = ['fid', 'z_index', 'geom'];
    return p[key] !== 'null' &&
      invalidKeys.map((k) => k !== key)
        .reduce((k1,k2) => k1 && k2);
  };

  handleCheckboxChange = (e) => {
    this.setState({[e.target.value]: !this.state[e.target.value]});
    this.map.setLayoutProperty(e.target.value, 'visibility',
      e.target.checked ? 'visible' : 'none');
  };

  handleFeatureChange = (e) => {

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
                <span className="area-stats">20%</span> Areas Covered<br />
                <span className="features-stats">4</span> Features Collected
              </div>
            </div>
          </div>
        </div>) : (<span></span>)}
        <div className='col3 pad2 colored pin-left stretch-height'>
          <h3 className="title">Field Data Map Tool</h3>
          <hr className="break" /><br />
          <h3>Filter by source:</h3><br />
          <input type="checkbox" value="buildings"
            checked={this.state.buildings}
            disabled /> Buildings<br/>
          <input type="checkbox" value="landuse"
            checked={this.state.landuse}
            onChange={this.handleCheckboxChange} /> Landuse<br/>
          <input type="checkbox" value="roads"
            checked={this.state.roads}
            onChange={this.handleCheckboxChange} /> Roads<br/>
          <br /><br />
          <h3>Filter by features:</h3><br />
          <input type="checkbox" value="healthcare"
            onChange={this.handleCheckboxChange}
            checked={this.state.healthcare} /> Healthcare<br/>
          <input type="checkbox" value="education"
            onChange={this.handleCheckboxChange}
            checked={this.state.education} /> Education<br/>
          <input type="checkbox" value="toilets"
            onChange={this.handleCheckboxChange}
            checked={this.state.toilets} /> Toilets<br/>
          <input type="checkbox" value="police"
            onChange={this.handleCheckboxChange}
            checked={this.state.police} /> Police<br/>
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
