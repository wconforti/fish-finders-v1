import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import './../Map.css';

import axios from 'axios';

import { useRequestNwsStations_Swr } from '../useRequestNwsStations_Swr'
import { useRequestNwsPoints_Swr } from '../useRequestNwsPoints_Swr'
import { useRequestNwsStations } from '../useRequestNwsStations';
import NwsStations from '../api/NwsStations';
import NwsStationsAsync from '../api/NwsStationsAsync';

mapboxgl.accessToken = 'pk.eyJ1Ijoid2NvbmZvcnRpIiwiYSI6ImNrajkyNnk3MjQ4YmEycnFqYm01cWVqamYifQ.P6dAko2hqzbdSnDOZq9IpA'

const _gridId = "BOX";
const _gridX = 59;
const _gridY = 28;

//const urlNwsPoints = `https://api.weather.gov/points/${_mboxLat},${_mboxLng}`;
//const urlNwsStations = `https://api.weather.gov/gridpoints/${_gridId}/${_gridX},${_gridY}/stations`;

const _mBox_Lat = 41.377894;
const _mBox_Lng = -71.635437;
const _mBox_Zoom = 8;

//const MapViewer = () => {
// State set functions only correclty working when Mapviewer is invoked as a Function.  
function MapViewer () {
  const mapContainerRef = useRef(null);

  console.log("const ==> MapViewer");

  // Try Axios here!!!
  //const resultsNWS_Axios = await NwsStationsAsync(_gridId, _gridX, _gridY);
  //const resultsNWS_Axios = NwsStations(_gridId, _gridX, _gridY);
  //console.log("NwsStations ==> Axios (MapView) ==> Results");
  //console.log(resultsNWS_Axios);

  const [lng, setLng] = useState(_mBox_Lng);
  const [lat, setLat] = useState(_mBox_Lat);
  const [zoom, setZoom] = useState(_mBox_Zoom);

  const [gridId, setGridId] = useState("None");
  const [gridX, setGridX] = useState("-1");
  const [gridY, setGridY] = useState("-1");

  const [nwsStations, setNwsStations] = useState([]);

  //// NWS Points ==> Get the NWS Points from the Initial Mapbox Settings
  //const { _gridId, _gridX, _gridY } = useRequestNwsPoints_Swr(_mBox_Lat, _mBox_Lng);
  //console.log("useRequestNwsPoints_Swr (Results)");
  //console.log("_gridId: ==> " + _gridId,);
  //console.log("_gridX: ==> " + _gridX,);
  //console.log("_gridY: ==> " + _gridY,);


  //// NWS Stations ==> Return a geoJSON object with NWS Stations data
  //// using the 'grid' parameters retrieved from the useRequestNwsPoints_Swr Hook
  //const { data: resultsNWS_Alt, error: errorNWS_Alt } = useRequestNwsStations(_gridId, _gridX, _gridY)
  //console.log("useRequestNwsStations (MapViewer) ==> Results");

  // https://www.mapbox.com/blog/mapping-u-s-wildfire-data-from-public-feeds
  // https://dev.to/laney/react-mapbox-beginner-tutorial-2e35
  // https://docs.mapbox.com/mapbox-gl-js/example/live-geojson/

  // Initialize map when component mounts
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom
    });

    const getNwsPointsData = async (_mboxLat, _mboxLng) => {
      const urlNwsPoints = `https://api.weather.gov/points/${_mboxLat},${_mboxLng}`;
      //console.log(urlNwsPoints);

      const response = await fetch(urlNwsPoints);
      //const response = await fetch(urlNwsPoints, {
      //  mode: 'no-cors', // no-cors, *cors, same-origin,
      //});
      //console.log("urlNwsPoints resp: ==> " + response.ok);
      const data = await response.json();

      //const response = await axios(urlNwsPoints);
      //const data = response.data;

      //console.log("getNwsPointsData (Results)");
      var _gridId_resp = data.properties.gridId;
      var _gridX_resp = data.properties.gridX;
      var _gridY_resp = data.properties.gridY;

      //console.log("_gridId_resp: ==> " + _gridId_resp);
      //console.log("_gridX_resp: ==> " + _gridX_resp);
      //console.log("_gridY_resp: ==> " + _gridY_resp);

      setGridId(_gridId_resp);
      setGridX(_gridX_resp);
      setGridY(_gridY_resp);
    };

    const getStationsData = async (_gridId, _gridX, _gridY) => {
      const urlNwsStations = `https://api.weather.gov/gridpoints/${_gridId}/${_gridX},${_gridY}/stations`;
      //console.log(urlNwsStations);

      const response = await fetch(urlNwsStations);
      const data = await response.json();
      //const response = await axios(urlNwsStations);
      //const data = response;

      //console.log("getStationsData (Results)");
      //console.log(data);
      setNwsStations(data);
    };

    getNwsPointsData(_mBox_Lat, _mBox_Lng);

    //console.log("getStationsData (Set State Results)");
    //console.log("gridId: ==> " + gridId);
    //console.log("gridX: ==> " + gridX);
    //console.log("gridY: ==> " + gridY);

    getStationsData(gridId, gridX, gridY);
    //console.log("getStationsData (After Return)");
    //console.log(nwsStations);
  

    // Add navigation control (the +/- zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on("load", () => {
      // add the data source for new a feature collection with no features0
      //console.log("map.on('load')");
      //console.log(nwsStations);

      map.addSource("nws-station-data", {
        type: "geojson",
        data: nwsStations
        //data: resultsNWS_Alt
        //data: resultsNWS_Axios
        //data: 'https://api.weather.gov/gridpoints/BOX/59,28/stations'
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


    map.on('move', () => {
      setLng(map.getCenter().lng.toFixed(4));
      setLat(map.getCenter().lat.toFixed(4));
      setZoom(map.getZoom().toFixed(2));

      getNwsPointsData(map.getCenter().lat, map.getCenter().lng);
    });

    // Clean up on unmount
    return () => map.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className='sidebarStyle'>
        <div>
          Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        </div>
      </div>
      <div className='map-container' ref={mapContainerRef} />
    </div>
  );
};

export default MapViewer;