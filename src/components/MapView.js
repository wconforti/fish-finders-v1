import ReactDOM from "react-dom";
import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

import { useRequestNwsStations_Swr } from '../useRequestNwsStations_Swr'
import { useRequestNwsStations } from '../useRequestNwsStations'
import NwsStations from '../api/NwsStations'
import { NwsStationsAsync } from '../api/NwsStationsAsync'

import StationsPopup from "./../components/StationsPopup";

//mapboxgl.accessToken = env.REACT_APP_MAPBOX_ACCESS_TOKEN;
mapboxgl.accessToken = 'pk.eyJ1Ijoid2NvbmZvcnRpIiwiYSI6ImNrajkyNnk3MjQ4YmEycnFqYm01cWVqamYifQ.P6dAko2hqzbdSnDOZq9IpA'
console.log("MAPBOX_ACCESS_TOKEN: " + process.env.REACT_APP_MAPBOX_ACCESS_TOKEN);

const _gridId = "BOX"
const _gridX = 59
const _gridY = 28

const _nws_Lat = 41.377894
const _nws_Lon = 71.635437
const _nws_Rad = 100

const _mBox_Lat = 41.377894
const _mBox_Lon = -71.635437

const MapView = () => {
  const mapContainerRef = useRef(null);
  const popUpRef = useRef(new mapboxgl.Popup({ offset: 15 }))

  console.log("const ==> MapView");

  // Get all of the Required API Data here.
  // NWS Stations
  //const { data: resultsNWS, error: errorNWS } = useRequestNwsStations_Swr(_mBox_Lat, _mBox_Lon);
  //console.log("useRequestNwsStations_Swr (MapView) ==> Results");
  //console.log(resultsNWS);

  const { data: resultsNWS_Alt, error: errorNWS_Alt } = useRequestNwsStations(_gridId, _gridX, _gridY )
  //console.log("useRequestNwsStations (MapView) ==> Results");
  //console.log("Errors ==>" + errorNWS_Alt);
  //console.log(resultsNWS_Alt);


  // NOAA Weather Buoys (rss)

  // Try Axios here!!!
  //const resultsNWS_Axios = NwsStations(_gridId, _gridX, _gridY);
  //console.log("NwsStations ==> Axios (MapView) ==> Results");
  //console.log(resultsNWS_Axios);

  //const resultsNWS_Axios_Async = await NwsStationsAsync(_gridId, _gridX, _gridY);
  //console.log("NwsStationsAsync ==> Axios (MapView) ==> Results");
  //console.log(resultsNWS_Axios_Async);

  // initialize map when component mounts
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      // See style options here: https://docs.mapbox.com/api/maps/#styles
      style: 'mapbox://styles/mapbox/outdoors-v11',
      center: [-71.635437, 41.377894],
      zoom: 8,
    });

    // add navigation control (the +/- zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    map.on("load", () => {
      // add the data source for new a feature collection with no features0

      //const resultsNWSAsync = await getNwsStationsDataAsync(_gridId, _gridX, _gridY);
      //const { data: resultsNWS, error: errorNWS } = useRequestNwsStations_Swr(_gridId, _gridX, _gridY )
      //const resultsNWSStations = NwsStations(_gridId, _gridX, _gridY);
      //console.log(resultsNWSAsync);

      console.log("map.on('load')");

      map.addSource("nws-station-data", {
        type: "geojson",
        data: resultsNWS_Alt
        //data: resultsNWS_Axios
        //data: 'https://api.weather.gov/gridpoints/BOX/59,28/stations'
        //data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_ports.geojson'
        //data: {
        //  type: "FeatureCollection",
        //  features: []
        //}
      });

      // now add the layer, and reference the data source above by name
      map.addLayer({
        id: "nws-station-layer",
        source: "nws-station-data",
        type: "symbol",
        layout: {
          // full list of icons here: https://labs.mapbox.com/maki-icons
          "icon-image": "castle-15", // this icons on our map
          "icon-padding": 0,
          "icon-allow-overlap": true
        }
      });

    });

    map.on("move", () => {
      // get new center coordinates
      const { lng, lat } = map.getCenter();

      //var { data: resultsNWS, error: errorNWS } = useRequestNwsStations(_gridId, _gridX, _gridY )

      // fetch new data
      //const results = await fetchFakeData({ longitude: lng, latitude: lat });
      //const results = await FetchNWSData({ longitude: lng, latitude: lat });
      // update "random-points-data" source with new data
      // all layers that consume the "random-points-data" data source will be updated automatically
      //console.log(results);

      //map.getSource("nws-station-data").setData(resultsNWS);

      //const url = "https://api.weather.gov/gridpoints/BOX/59,28/stations";
      //const { data, error } = useSwr(url, { fetcher });
      //const stations = data && !error ? data.slice(0, 2000) : [];
  
      //console.log(data);


    });


    // change cursor to pointer when user hovers over a clickable feature
    map.on("mouseenter", "nws-station-layer", e => {
      if (e.features.length) {
        map.getCanvas().style.cursor = "pointer";
      }
    });

    // reset cursor to default when user is no longer hovering over a clickable feature
    map.on("mouseleave", "nws-station-layer", () => {
      map.getCanvas().style.cursor = "";
    });

    // add popup when user clicks a point
    map.on("click", "nws-station-layer", e => {
      if (e.features.length) {
        console.log('features => ' + e.features.length);
        const feature = e.features[0];
        // create popup node
        const popupNode = document.createElement("div");
        ReactDOM.render(<StationsPopup feature={feature} />, popupNode);
        // set popup on map
        popUpRef.current
          .setLngLat(feature.geometry.coordinates)
          .setDOMContent(popupNode)
          .addTo(map);
      }
    });

    // clean up on unmount
    return () => map.remove();

  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <div className="map-container" ref={mapContainerRef} />;
};

export default MapView;