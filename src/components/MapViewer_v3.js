import ReactDOM from "react-dom";
import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import './../Map.css';

import axios from 'axios';
import xml2js from 'xml2js';

//import { Container, Navbar, Button, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'react-bootstrap';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';

import StationDetailsPopup from "./../components/StationDetailsPopup";

mapboxgl.accessToken = 'pk.eyJ1Ijoid2NvbmZvcnRpIiwiYSI6ImNrajkyNnk3MjQ4YmEycnFqYm01cWVqamYifQ.P6dAko2hqzbdSnDOZq9IpA'

const _gridId = "BOX";
const _gridX = 59;
const _gridY = 28;

//const urlNwsPoints = `https://api.weather.gov/points/${_mboxLat},${_mboxLng}`;
//const urlNwsStations = `https://api.weather.gov/gridpoints/${_gridId}/${_gridX},${_gridY}/stations`;

const _mBox_Lat = 41.377894;
const _mBox_Lng = -71.635437;
//const _mBox_Lat = 41.3779;
//const _mBox_Lng = -71.6354;
const _mBox_Zoom = 8;

const ndbRadius = 100;

function MapViewer_v3 () {
    const mapContainerRef = useRef(null);
    console.log("const ==> MapViewer");
  
    // Ok, for this iteration we are only going to 
    // include: lng, lat and zoom in 'state' ascurrently
    // they are the only values being displayed as a side effect.
    const [lng, setLng] = useState(_mBox_Lng);
    const [lat, setLat] = useState(_mBox_Lat);
    const [zoom, setZoom] = useState(_mBox_Zoom);

    const [nwsStations, setNwsStations] = useState([]);
    const [ndbcStations, setNdbcStations] = useState([]);
    const [stationWindData, setStationWindData] = useState([]);
    const [surfaceSeaTempData, setSurfaceSeaTempData] = useState([]);

    const [map_control, setMapControl] = useState();

    var mapSources = ["station-wind-data", "nws-station-data", "ndbc-station-data", "ndbc-ship-data", "sea-temp-data"];
    var mapLayers = ["station-wind-layer", "nws-station-layer", "ndbc-station-layer", "ndbc-ship-layer", "sea-temp-layer", "sea-temp-point"];

    var toolTip = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });

    var popUpRef = new mapboxgl.Popup({ offset: 15 });

  // Initialize map when component mounts
  useEffect(() => {
    const map = new mapboxgl.Map({
      id: "mapbox_ref",
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom
    });

    setMapControl(map);

    const getStationsData = async (_gridId, _gridX, _gridY) => {
      const urlNwsStations = `https://api.weather.gov/gridpoints/${_gridId}/${_gridX},${_gridY}/stations`;
      //console.log("urlNwsStations:= " + urlNwsStations);

      // // ==> axios w/o Set State <==
      // const response = await axios(urlNwsStations);
      // return await response.data;

      // ==> fetch <==
      //const response = await fetch(urlNwsStations);
      //const data = await response.json();

      // // ==> axios w/o Set State <==
      // const response = await axios(urlNwsStations);
      // const data = await response.data;
      // console.log("==> nwsStations Data Loaded <==");
      
      // return data;

      // Return object
      const nwsDataFeaturesList = [];

      let wind_sector = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW","N"];

      var stat_Updated_Text = null;
      var stat_windDir_Text = null;
      var stat_windInfo_Text = null;
      var stat_gustInfo_Text = null;
      var stat_airTemp_Text = null;
      var stat_airPressure_Text = null;
      var stat_waterTemp_Text  = null;

      // ==> axios w/o Set State <==
      const resp_NwsStations = await axios(urlNwsStations);
      const nwsStations = await resp_NwsStations.data;

      // OK, find the 'observationStations' array data
      // This notation is better that the hard-coded index option.
      console.log("Parse NWS Stations ==> ");
      Object.keys(nwsStations).map(async (key) => {
        //console.log(key, nwsStations[key]);
   
        // Text Templates:
        // ==> Updated: Date and Time
        // ==> Wind Direction: WNW (300&#176;)
        // ==> Wind Speed: 19 knots (24 mph)
        // ==> Gusting: to 19 knots (24 mph)
        // ==> Atmospheric Pressure: 29.44 (997.1 mb)
        // ==> Air Temperature: 39&#176;F (3.7&#176;C)
        // ==> Water Temperature: 50&#176;F (10.1&#176;C)

        // Set Default Text values here:
        stat_Updated_Text = "Updated: N/A";
        stat_windDir_Text = "Wind Direction: N/A";
        stat_windInfo_Text = "Wind Speed: N/A";
        stat_gustInfo_Text = "Gusting: N/A";
        stat_airTemp_Text = "Air Temperature: N/A";
        stat_airPressure_Text = "Atmospheric Pressure: N/A";
        stat_waterTemp_Text  = "Water Temperature: N/A";

        var station_id = null;
        var stat_lon_coord = null;
        var stat_lat_coord = null;

        var stat_Identifier = null;
        var stat_Name = null;
        var stat_LastUpdate = null;
        var stat_TextDesc = null;
        var stat_AirTemp_C = null;
        var stat_AirTemp_F = null;       // in Celsius
        var stat_AirPressure_Mb = null;

        // Wind Data - returned in KPH!!!
        var stat_windDirection_Degrees = null;
        var stat_windDirection = null;
        var stat_windSpeed = null;
        var stat_windGust = null;

        // if (key === "observationStations"){
        //   console.log("Observation Stations: ==> ");
        //   nwsStations[key].map(async (stationUrl) => {
        if (key === "features"){
          //console.log("features: ==> ");
          nwsStations[key].map(async (stat_Features) => {
            //console.log("stat_Features ==>");
            //console.log(stat_Features);

            var stationUrl = stat_Features.id.toString();
            
            /******************************************************/
            // Create the URL to grab the individual Station Data  
            var stationDataUrl = `${stationUrl}/observations/latest`;
            //console.log("stationDataUrl: " + stationDataUrl);

            // ==> axios w/o Set State <==
            const stationResponse = await axios(stationDataUrl);
            //return await response.data;
            const stationData = await stationResponse.data;
            //console.log("Station Data: " + stationData);

            Object.keys(stationData).map(async (key1) => {
              //console.log(key1, stationData[key1]);

              // We need the geometry key to access the co-ordinates
              //console.log("stationData: " + key1);
              if (key1 === "geometry") {

                stat_lon_coord = stationData[key1].coordinates[0];
                stat_lat_coord = stationData[key1].coordinates[1];

              };

              // We need the properties key to access 
              // ==> windDirection
              // ==> windSpeed
              // ==> windGust
              if (key1 === "properties") {

                // ==> Wind Speed
                stat_windSpeed = stationData[key1].windSpeed.value;

                // ==> Wind Direction
                stat_windDirection = stationData[key1].windDirection.value;
                if (stat_windDirection !== null) {
                  var convert_deg = parseInt(stat_windDirection) + 180;
                  if (convert_deg >= 360)
                    convert_deg = convert_deg - 360;

                    stat_windDirection_Degrees = convert_deg;
                }

                //console.log("stat_windDirection_Degrees ==> " + stat_windDirection_Degrees);
                
                // ==> Wind Gusts on knots
                stat_windGust = stationData[key1].windGust.value;

                // ==> Timestamp -> 2021-04-01T13:50:00+00:00
                var chk_timestamp = stationData[key1].timestamp;
                if (chk_timestamp !== null){
                  var timestamp = Date.parse(chk_timestamp);
                  
                  if (isNaN(timestamp) == false) {
                    var d = new Date(timestamp);
                    stat_LastUpdate = d.toString("DD MMM hh:mm tt");
                    stat_Updated_Text = "Updated: " + stat_LastUpdate;
                  }   
                }

                // ==> Text Description 
                stat_TextDesc = stationData[key1].textDescription;
                //console.log("textDescription ==> " + stat_TextDesc);

                // ==> Barometric Pressure in Pascal Units
                var stat_AirPressure_Pa = stationData[key1].barometricPressure.value;
                if (stat_AirPressure_Pa !== null) {
                  var stat_AirPressure_Mb = stat_AirPressure_Pa / 100;

                  var stat_AirPressure_psi = stat_AirPressure_Mb * 0.0295301;
                  stat_airPressure_Text = "Atmospheric Pressure: " + stat_AirPressure_psi.toFixed(2) + " (" + stat_AirPressure_Mb.toFixed(1) + " mb)"
                }

                // ==> Air Temperature
                // temperature in C
                stat_AirTemp_C = stationData[key1].temperature.value;
                if (stat_AirTemp_C !== null) {
                  //console.log("stat_AirTemp_C (NWS) ==> " + stat_AirTemp_C);

                  // Convert temperature to F
                  stat_AirTemp_F = (stat_AirTemp_C * 1.8) + 32;
                  stat_airTemp_Text = "Air Temperature: " + stat_AirTemp_F.toFixed(0) + "° F (" + stat_AirTemp_C.toFixed(0) + "° C)";
                }
              }

            }); // stationData

            station_id = stat_Features.properties.stationIdentifier;
            stat_Identifier = stat_Features.properties.stationIdentifier;
            stat_Name = stat_Features.properties.name;

            // Wind Gusts
            if (stat_windGust !== null)
            {
              // Convert km/h to knots !!!
              // divisor speed (km/h) / 1.852
              var stat_gusts_knots = stat_windGust / 1.852;

              // Convert kmh to mph !!!
              // Divide KMH in half, then add 10% to get a quick, easy conversion to MPH
              // [number of] kilometres per hour / 1.60934 = [number of] miles per hour
              var stat_gusts_mph = stat_windGust / 1.60934;

              stat_gustInfo_Text = "Gusting: to " + stat_gusts_knots.toFixed(0) + " knots (" + stat_gusts_mph.toFixed(0) + " mph)";
            }

            // Wind Direction
            // Wind Direction (N, S, SW, etc.) from Degrees
            // stat_windDirection <== (N, S, SW, etc.) 
            //console.log("stat_windDirection_Degrees ==> " + stat_windDirection_Degrees);
            if (stat_windDirection !== null)
            {
              // Now that we have the Wind FROM Direction in degrees,
              // Convert is into a sector String
              // by indexing into the wind_sector array declared above
              var index1 = (stat_windDirection % 360) / 22.5;
              var index2 = parseInt(index1.toFixed(0)) + parseInt(1);
              var compassDir = wind_sector[index2];

              stat_windDir_Text = "Wind Direction: " + compassDir + " (" + stat_windDirection + "°)";
            }

            // Add NWS Station data. if it qualifies.
            //
            // Check for BOTH wind_direction AND sta_windSpeed
            // values, otherwise skip on down...
            var stat_wind_mph = 0;
            var stat_wind_knots = 0;
            //console.log("stat_windSpeed (NDBC) ==> " + stat_windSpeed);
            if (stat_windSpeed !== null)
            {
              // Convert km/h to knots !!!
              // divisor speed (km/h) / 1.852
              stat_wind_knots = stat_windSpeed / 1.852;
              stat_wind_knots = stat_wind_knots.toFixed(0);

              // Convert kmh to mph !!!
              // Divide KMH in half, then add 10% to get a quick, easy conversion to MPH
              // [number of] kilometres per hour / 1.60934 = [number of] miles per hour
              stat_wind_mph = stat_windSpeed / 1.60934;
              stat_wind_mph = stat_wind_mph.toFixed(0);

              stat_windInfo_Text = "Wind Speed: " + stat_wind_knots + " knots (" + stat_wind_mph + " mph)";
            }

            // Three marker images
            //  ==> wind_dir
            //  ==> wind_dir_stale
            //  ==> wind_dir_none
            var marker_Img = "wind_dir";

            // Add NWS Station data. if it qualifies.
            //
            // Check for BOTH wind_direction AND sta_windSpeed
            // values, otherwise skip on down...

            // Create a 'windDataFeaturesList' object and push it into the return object
            //console.log("Push ==> NWS Station: " + station_id);
            nwsDataFeaturesList.push({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [stat_lon_coord, stat_lat_coord],
              },
              properties: {
                id: station_id,
                stat_name: stat_Name,
                station_type: "NWS",
                marker_Img: marker_Img,
                wind_direction: stat_windDirection_Degrees,    // For directional markers
                wind_speed: stat_wind_mph,  // For directional markers

                // For Display 
                stat_Updated: stat_Updated_Text,    
                stat_windInfo: stat_windInfo_Text,
                stat_gustInfo: stat_gustInfo_Text,
                stat_windDir: stat_windDir_Text,
                stat_airTemp: stat_airTemp_Text,
                stat_airPressure: stat_airPressure_Text,
                stat_waterTemp: stat_waterTemp_Text,
              },
            });
            
          }); //Nws Stations
        }
      });

      console.log("==> NWS Stations Data Loaded <==");

      return await Promise.resolve({
        type: 'FeatureCollection',
        features: nwsDataFeaturesList,
      });

    };
  
    const getNdbcStationsData = async (_mboxLat, _mboxLng) => {
      //const urlNdbcStations = `https://www.ndbc.noaa.gov/rss/ndbc_obs_search.php?lat=${_mboxLat}N&lon=${(_mboxLng * -1)}W&radius=100`;
      const urlNdbcStations = `http://localhost:8080/?lat=${_mboxLat}N&lon=${(_mboxLng * -1)}W&radius=100`;
      //console.log("getNdbcStationsData URL ==> " + urlNdbcStations);

      /* Properties for popup Display */
      var stat_Updated_Text = null;
      var stat_windDir_Text = null;
      var stat_windInfo_Text = null;
      var stat_gustInfo_Text = null;
      var stat_airTemp_Text = null;
      var stat_airPressure_Text = null;
      var stat_waterTemp_Text  = null;

      // Return object
      const ndbcFeaturesList = [];

      // ==> axios w/o Set State <==
      const response = await axios(urlNdbcStations);
      //return await response.data;
      const data = await response.data;
      //console.log(data);

      // ==> axios <==
      // const response = await axios(urlNdbcStations);
      // const data = await response.data;
      // setNwsStations(data);

      // Parse baby... parse...

      // The result object below will be in JSON format
      var parseString = require('xml2js').parseString;
      parseString(data, function (err, result) {
        //console.log(util.inspect(result, false, null));

        // Set Default Text values here:
        stat_Updated_Text = "Updated: N/A";
        stat_windDir_Text = "Wind Direction: N/A";
        stat_windInfo_Text = "Wind Speed: N/A";
        stat_gustInfo_Text = "Gusting: N/A";
        stat_airTemp_Text = "Air Temperature: N/A";
        stat_airPressure_Text = "Atmospheric Pressure: N/A";
        stat_waterTemp_Text  = "Water Temperature: N/A";

        var stat_LastUpdate = null;

        // Re-name the 'georss:point' node
        var resultStringInit = JSON.stringify(result); 
        var resultString = resultStringInit.replaceAll('georss:point','geopoint');
        const valuesArray = JSON.parse(resultString);

        // Drill-down to the channel level
        // There should be only ONE channel node
        // Properties Spread Notation
        var stationData = [...valuesArray.rss.channel];

        // Iterate through the Station data
        stationData[0].item.map((station) => {

          // Determine 'SHIP' or STATION title entries
          var station_type = "NDBC_Station";
          var checkShipIndex = station.title.toString().toLowerCase().lastIndexOf('ship');
          if (checkShipIndex > -1)
            station_type = "NDBC_Ship";
        
          // ==> id
          // From station.link
          var checkLinkIndex = station.link.toString().trim().lastIndexOf("station=");
          let stationId = station.link.toString().trim().substring(checkLinkIndex + 8);
          let statId = stationId;
          
          // ==> coords
          var coords = station.geopoint.toString().split(" ");
          // ==> latitude
          let latitude = coords[0];
          // ==> longitude
          let longitude = coords[1];

          let wind_direction = '';
          let wind_speed = '';
          let wind_gust = '';
          let stat_Name = station.title.toString();

          //OK, now that we have it, how the hell do I parse out the Description data!!!!
          var parseDesc = station.description.toString().split('<br />');
          for (let i=0; i < parseDesc.length; i++) {
            //console.log(parseDesc[i]);

            // Get her all warshed out!
            var strippedDescItem = parseDesc[i].replaceAll('<strong>','').replaceAll('</strong>','').trim();
            if (strippedDescItem.length > 0 ) {
              //console.log(strippedDescItem)

              // The first element should be the UTC date info
              if (i === 0){
                var chk_timestamp = strippedDescItem;

                var timestamp = Date.parse(chk_timestamp);
                if (isNaN(timestamp) == false) {
                  var d = new Date(timestamp);
                  stat_LastUpdate = d.toString("DD MMM hh:mm tt");

                  stat_Updated_Text = "Updated: " + stat_LastUpdate;
                }   
              }
              
              // Replace the 'degrees' symbol
              var strippedItem = strippedDescItem.replaceAll('&#176;', '°');

               // in Knots... 
              if (strippedItem.indexOf('Wind Speed') > -1) {
                var chkItem_ws = strippedItem.toString().split(":");
                wind_speed = chkItem_ws[1].replaceAll('knots','').trim();

                if (wind_speed !== null) {
                  // Convert kmh to mph !!!
                  // Divide KMH in half, then add 10% to get a quick, easy conversion to MPH
                  // [number of] kilometres per hour / 1.60934 = [number of] miles per hour
                  var stat_wind_mph = wind_speed / 1.60934;
                  stat_wind_mph = stat_wind_mph.toFixed(0);

                  stat_windInfo_Text = "Wind Speed: " + wind_speed + " knots (" + stat_wind_mph + " mph)";
                }

              } else if (strippedItem.indexOf('Wind Direction') > -1) {
                var chkItem_wd = strippedItem.toString().split(":");
                wind_direction = chkItem_wd[1];

                stat_windDir_Text = strippedItem;

              } else if (strippedItem.indexOf('Wind Gust') > -1) {
                var chkItem_wg = strippedItem.toString().split(":");
                wind_gust = chkItem_wg[1].replaceAll('knots','').trim();

                if (wind_gust !== null) {
                  // Convert kmh to mph !!!
                  // Divide KMH in half, then add 10% to get a quick, easy conversion to MPH
                  // [number of] kilometres per hour / 1.60934 = [number of] miles per hour
                  var stat_gusts_mph = wind_gust / 1.60934;

                  stat_gustInfo_Text = "Gusting: to " + wind_gust + " knots (" + stat_gusts_mph.toFixed(0) + " mph)";
                }

              } else if (strippedItem.indexOf('Air Temperature') > -1) {
                var chkItem_at = strippedItem.toString().split(":");
                //air_temperature = chkItem_at[1];
                stat_airTemp_Text = strippedItem;

              } else if (strippedItem.indexOf('Atmospheric Pressure') > -1) {
                var chkItem_at = strippedItem.toString().split(":");

                stat_airPressure_Text = strippedItem;

              } else if (strippedItem.indexOf('Water Temperature') > -1) {
                var chkItem_wt = strippedItem.toString().split(":");
                //water_temperature = chkItem_wt[1];

                stat_waterTemp_Text = strippedItem;
              } 
            }
          }

          // Create a 'newFeaturesList' object and pusgh it into the  
          ndbcFeaturesList.push({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            properties: {
              id: statId,
              stat_name: stat_Name,
              station_type: station_type,

              // For Display 
              stat_Updated: stat_Updated_Text,    
              stat_windInfo: stat_windInfo_Text,
              stat_gustInfo: stat_gustInfo_Text,
              stat_windDir: stat_windDir_Text,
              stat_airTemp: stat_airTemp_Text,
              stat_airPressure: stat_airPressure_Text,
              stat_waterTemp: stat_waterTemp_Text,
            },
          });

        }); // Iterate through the Station data
      });

      console.log("==> NdbcStations Data Loaded <==");

      return await Promise.resolve({
        type: 'FeatureCollection',
        features: ndbcFeaturesList,
      });

    };

    /****************************************************************************
     * 
     *  This function will compile Feature Collection of wind related data from
     *  NWS and NOAA Stations that will include:
     * 
     *  ==> wind_direction
     *  ==> wind_speed
     *  ==> longitude
     *  ==> latitude
     * 
     *****************************************************************************/
    const getStationWindData = async (_mboxLat, _mboxLng) => {

      // Return object
      const windDataFeaturesList = [];

      /* OK, this call has hosed us before, but let's see what happens here anyway */
      const urlNwsPoints = `https://api.weather.gov/points/${_mboxLat},${_mboxLng}`;
      //console.log(urlNwsPoints);

      const resp_Points = await axios(urlNwsPoints);
      const data_Points = await resp_Points.data;

      // Get the GridID and X,Y coordinates for the NWS Stations API call below:
      var _gridId_resp = data_Points.properties.gridId;
      var _gridX_resp = data_Points.properties.gridX;
      var _gridY_resp = data_Points.properties.gridY;

      let wind_sector = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW","N"];

      // variable to hold the 'text' data
      // included in the Feature List Proprties
      var stat_Updated_Text = null;
      var stat_windDir_Text = null;
      var stat_windInfo_Text = null;
      var stat_gustInfo_Text = null;
      var stat_airTemp_Text = null;
      var stat_airPressure_Text = null;
      var stat_waterTemp_Text  = null;

      /****************/
      /* NWS Stations */
      /****************/
      const urlNwsStations = `https://api.weather.gov/gridpoints/${_gridId_resp}/${_gridX_resp},${_gridY_resp}/stations`;
      //console.log("urlNwsStations:= " + urlNwsStations);

      // ==> axios w/o Set State <==
      const resp_NwsStations = await axios(urlNwsStations);
      const nwsStations = await resp_NwsStations.data; //.json();
      //console.log("nwsStations:= " + nwsStations);

      // ==> fetch <==
      //const response = await fetch(urlNwsStations);
      //const data = await response.json();
  
      // Parse, baby parse....
      // So we should now have a result set of NWS stations
      // Iterate through these and grab the 'id' property which 
      // will containthe following link:  
      //        https://api.weather.gov/stations/KBID
      //
      // To obtain Station Data, append the link with the following:
      //        /observations/latest
      //
      // Send a request to this API url and then parse out the wind data

      //var statsKeys =  Object.keys(nwsStations);
      //console.log("Found (Object.keys): "  + statsKeys);
      //statsKeys.map((key) => {
      //  console.log(key, statsKeys[key]);
      //});

      // OK, find the 'observationStations' array data
      // This notation is better that the hard-coded index option.
      console.log("Parse NWS Stations ==> ");
      Object.keys(nwsStations).map(async (key) => {
        //console.log(key, nwsStations[key]);
   
        // Text Templates:
        // ==> Updated: Date and Time
        // ==> Wind Direction: WNW (300&#176;)
        // ==> Wind Speed: 19 knots (24 mph)
        // ==> Gusting: to 19 knots (24 mph)
        // ==> Atmospheric Pressure: 29.44 (997.1 mb)
        // ==> Air Temperature: 39&#176;F (3.7&#176;C)
        // ==> Water Temperature: 50&#176;F (10.1&#176;C)

        // Set Default Text values here:
        stat_Updated_Text = "Updated: N/A";
        stat_windDir_Text = "Wind Direction: N/A";
        stat_windInfo_Text = "Wind Speed: N/A";
        stat_gustInfo_Text = "Gusting: N/A";
        stat_airTemp_Text = "Air Temperature: N/A";
        stat_airPressure_Text = "Atmospheric Pressure: N/A";
        stat_waterTemp_Text  = "Water Temperature: N/A";

        var station_id = null;
        var stat_lon_coord = null;
        var stat_lat_coord = null;

        var stat_Identifier = null;
        var stat_Name = null;
        var stat_LastUpdate = null;
        var stat_TextDesc = null;
        var stat_AirTemp_C = null;
        var stat_AirTemp_F = null;       // in Celsius
        var stat_AirPressure_Mb = null;

        // Wind Data - returned in KPH!!!
        var stat_windDirection_Degrees = null;
        var stat_windDirection = null;
        var stat_windSpeed = null;
        var stat_windGust = null;

        // if (key === "observationStations"){
        //   console.log("Observation Stations: ==> ");
        //   nwsStations[key].map(async (stationUrl) => {
        if (key === "features"){
          //console.log("features: ==> ");
          nwsStations[key].map(async (stat_Features) => {
            //console.log("stat_Features ==>");
            //console.log(stat_Features);

            var stationUrl = stat_Features.id.toString();
            
            /******************************************************/
            // Create the URL to grab the individual Station Data  
            var stationDataUrl = `${stationUrl}/observations/latest`;
            //console.log("stationDataUrl: " + stationDataUrl);

            // ==> axios w/o Set State <==
            const stationResponse = await axios(stationDataUrl);
            //return await response.data;
            const stationData = await stationResponse.data;
            //console.log("Station Data: " + stationData);

            Object.keys(stationData).map(async (key1) => {
              //console.log(key1, stationData[key1]);

              // We need the geometry key to access the co-ordinates
              //console.log("stationData: " + key1);
              if (key1 === "geometry") {

                stat_lon_coord = stationData[key1].coordinates[0];
                stat_lat_coord = stationData[key1].coordinates[1];

              };

              // We need the properties key to access 
              // ==> windDirection
              // ==> windSpeed
              // ==> windGust
              if (key1 === "properties") {

                // ==> Wind Speed
                stat_windSpeed = stationData[key1].windSpeed.value;

                // ==> Wind Direction
                stat_windDirection = stationData[key1].windDirection.value;
                if (stat_windDirection !== null) {
                  var convert_deg = parseInt(stat_windDirection) + 180;
                  if (convert_deg >= 360)
                    convert_deg = convert_deg - 360;

                    stat_windDirection_Degrees = convert_deg;
                }

                //console.log("stat_windDirection_Degrees ==> " + stat_windDirection_Degrees);
                
                // ==> Wind Gusts on knots
                stat_windGust = stationData[key1].windGust.value;
                // if (stat_windGust !== null) {
                //   // Convert temperature to F
                //   var stat_wind_mph = stat_windGust / 1.60934;
                //   var  stat_windGust_mph = stat_wind_mph.toFixed(0);

                //   stat_gustInfo_Text = "Gusting: to " + stat_windGust + " knots (" + stat_windGust_mph + " mph)";
                // }
                
                // ==> Timestamp -> 2021-04-01T13:50:00+00:00
                var chk_timestamp = stationData[key1].timestamp;
                if (chk_timestamp !== null){
                  var timestamp = Date.parse(chk_timestamp);
                  
                  if (isNaN(timestamp) == false) {
                    var d = new Date(timestamp);
                    stat_LastUpdate = d.toString("DD MMM hh:mm tt");
                    stat_Updated_Text = "Updated: " + stat_LastUpdate;
                  }   
                }

                // ==> Text Description 
                stat_TextDesc = stationData[key1].textDescription;
                //console.log("textDescription ==> " + stat_TextDesc);

                // ==> Barometric Pressure in Pascal Units
                var stat_AirPressure_Pa = stationData[key1].barometricPressure.value;
                if (stat_AirPressure_Pa !== null) {
                  var stat_AirPressure_Mb = stat_AirPressure_Pa / 100;

                  var stat_AirPressure_psi = stat_AirPressure_Mb * 0.0295301;
                  stat_airPressure_Text = "Atmospheric Pressure: " + stat_AirPressure_psi.toFixed(2) + " (" + stat_AirPressure_Mb.toFixed(1) + " mb)"
                }

                // ==> Air Temperature
                // temperature in C
                stat_AirTemp_C = stationData[key1].temperature.value;
                if (stat_AirTemp_C !== null) {
                  //console.log("stat_AirTemp_C (NWS) ==> " + stat_AirTemp_C);

                  // Convert temperature to F
                  stat_AirTemp_F = (stat_AirTemp_C * 1.8) + 32;
                  stat_airTemp_Text = "Air Temperature: " + stat_AirTemp_F.toFixed(0) + "° F (" + stat_AirTemp_C.toFixed(0) + "° C)";
                }
              }

            }); // stationData

            station_id = stat_Features.properties.stationIdentifier;
            stat_Identifier = stat_Features.properties.stationIdentifier;
            stat_Name = stat_Features.properties.name;

            // Wind Gusts
            if (stat_windGust !== null)
            {
              // Convert km/h to knots !!!
              // divisor speed (km/h) / 1.852
              var stat_gusts_knots = stat_windGust / 1.852;

              // Convert kmh to mph !!!
              // Divide KMH in half, then add 10% to get a quick, easy conversion to MPH
              // [number of] kilometres per hour / 1.60934 = [number of] miles per hour
              var stat_gusts_mph = stat_windGust / 1.60934;

              stat_gustInfo_Text = "Gusting: to " + stat_gusts_knots.toFixed(0) + " knots (" + stat_gusts_mph.toFixed(0) + " mph)";
            }

            // Wind Direction
            // Wind Direction (N, S, SW, etc.) from Degrees
            // stat_windDirection <== (N, S, SW, etc.) 
            //console.log("stat_windDirection_Degrees ==> " + stat_windDirection_Degrees);
            if (stat_windDirection !== null)
            {
              // Now that we have the Wind FROM Direction in degrees,
              // Convert is into a sector String
              // by indexing into the wind_sector array declared above
              var index1 = (stat_windDirection % 360) / 22.5;
              var index2 = parseInt(index1.toFixed(0)) + parseInt(1);
              var compassDir = wind_sector[index2];

              stat_windDir_Text = "Wind Direction: " + compassDir + " (" + stat_windDirection + "°)";
            }

            // Add NWS Station data. if it qualifies.
            //
            // Check for BOTH wind_direction AND sta_windSpeed
            // values, otherwise skip on down...
            var stat_wind_mph = 0;
            var stat_wind_knots = 0;
            //console.log("stat_windSpeed (NDBC) ==> " + stat_windSpeed);
            if (stat_windSpeed !== null)
            {
              // Convert km/h to knots !!!
              // divisor speed (km/h) / 1.852
              stat_wind_knots = stat_windSpeed / 1.852;
              stat_wind_knots = stat_wind_knots.toFixed(0);

              // Convert kmh to mph !!!
              // Divide KMH in half, then add 10% to get a quick, easy conversion to MPH
              // [number of] kilometres per hour / 1.60934 = [number of] miles per hour
              stat_wind_mph = stat_windSpeed / 1.60934;
              stat_wind_mph = stat_wind_mph.toFixed(0);

              stat_windInfo_Text = "Wind Speed: " + stat_wind_knots + " knots (" + stat_wind_mph + " mph)";
            }

            // Three marker images
            //  ==> wind_dir
            //  ==> wind_dir_stale
            //  ==> wind_dir_none
            var marker_Img = "wind_dir";

            // Add NWS Station data. if it qualifies.
            //
            // Check for BOTH wind_direction AND sta_windSpeed
            // values, otherwise skip on down...

            // Create a 'windDataFeaturesList' object and push it into the return object
            //console.log("Push ==> NWS Station: " + station_id);
            windDataFeaturesList.push({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [stat_lon_coord, stat_lat_coord],
              },
              properties: {
                id: station_id,
                stat_name: stat_Name,
                station_type: "NWS",
                marker_Img: marker_Img,
                wind_direction: stat_windDirection_Degrees,    // For directional markers
                wind_speed: stat_wind_mph,  // For directional markers

                // For Display 
                stat_Updated: stat_Updated_Text,    
                stat_windInfo: stat_windInfo_Text,
                stat_gustInfo: stat_gustInfo_Text,
                stat_windDir: stat_windDir_Text,
                stat_airTemp: stat_airTemp_Text,
                stat_airPressure: stat_airPressure_Text,
                stat_waterTemp: stat_waterTemp_Text,
              },
            });
            
          }); //Nws Stations
        }
      });


      /************************/
      /* NOAA (NDBC) Stations */
      /************************/
      console.log("NOAA (NDBC) Stations ==> ");
      const urlNdbcStations = `http://localhost:8080/?lat=${_mboxLat}N&lon=${(_mboxLng * -1)}W&radius=100`;
      //console.log("getNdbcStationsData URL ==> " + urlNdbcStations);

      // ==> axios w/o Set State <==
      const response = await axios(urlNdbcStations);
      //return await response.data;
      const data = await response.data;
      //console.log(data);

      // The result object below will be in JSON format
      var parseString = require('xml2js').parseString;
      parseString(data, function (err, result) {
        //console.log(util.inspect(result, false, null));
        //var resultFull = util.inspect(result, false, null);

        // Set Default Text values here:
        stat_Updated_Text = "Updated: N/A";
        stat_windDir_Text = "Wind Direction: N/A";
        stat_windInfo_Text = "Wind Speed: N/A";
        stat_gustInfo_Text = "Gusting: N/A";
        stat_airTemp_Text = "Air Temperature: N/A";
        stat_airPressure_Text = "Atmospheric Pressure: N/A";
        stat_waterTemp_Text  = "Water Temperature: N/A";

        var stat_LastUpdate = null;

        // Create Feature Collection here:
        // OK, result object above will be in JSON format

        // Re-name the 'georss:point' node
        var resultStringInit = JSON.stringify(result); 
        var resultString = resultStringInit.replaceAll('georss:point','geopoint');
        const valuesArray = JSON.parse(resultString);

        // Drill-down to the channel level
        // There should be only ONE channel node
        // Properties Spread Notation
        var stationData = [...valuesArray.rss.channel];

        // Iterate through the Station data
        stationData[0].item.map(async (station) => {

          var station_type = "NDBC_Station";
          var checkShipIndex = station.title.toString().toLowerCase().lastIndexOf('ship');
          if (checkShipIndex > -1)
            station_type = "NDBC_Ship";
        
          // ==> id
          // From station.link
          var checkLinkIndex = station.link.toString().trim().lastIndexOf("station=");
          var stationId = station.link.toString().trim().substring(checkLinkIndex + 8);
          var statId = stationId.toUpperCase();
          var stat_title = station.title.toString();
          var pub_Date = station.pubDate.toString();

          // Attempt to grab the NOAA (NDBC) Id to remove
          // it from the Station title (Name)
          //var regExp_title = /\-([^-]+)\-/
          var regExp_title = /-([0-9\s]+)-/;
          var title_match = regExp_title.exec(stat_title);
        
          if (title_match != null) {
            let t_Match = title_match[0];
            stat_title = stat_title.replace(t_Match, '-');
          }

          // ==> coords
          var coords = station.geopoint.toString().split(" ");
          // ==> latitude
          var sta_latitude = coords[0];
          var latitude = parseFloat(sta_latitude.toString(), 2);
          // ==> longitude
          var sta_longitude = coords[1];
          var longitude = parseFloat(sta_longitude.toString(), 2);
          
          let wind_direction = null; //'';
          let wind_speed =  null; //'';

          //OK, now that we have it, how the hell do I parse out the Description data!!!!
          var parseDesc = station.description.toString().split('<br />');
          for (let i=0; i < parseDesc.length; i++) {

            // Get her all warshed out!
            var strippedDescItem = parseDesc[i].replaceAll('<strong>','').replaceAll('</strong>','').trim();
            if (strippedDescItem.length > 0 ) {

              // The first element shoudl be the UTC date info
              if (i === 0){
                var chk_timestamp = strippedDescItem;

                var timestamp = Date.parse(chk_timestamp);
                if (isNaN(timestamp) == false) {
                  var d = new Date(timestamp);
                  stat_LastUpdate = d.toString("DD MMM hh:mm tt");

                  stat_Updated_Text = "Updated: " + stat_LastUpdate;
                }   
              }

              // Remove the 'degrees' symbol
              var strippedItem = strippedDescItem.replaceAll('&#176;', '°').trim();

              // in Knots... 
              if (strippedItem.indexOf('Wind Speed') > -1) {
                var chkItem_wp = strippedItem.toString().split(":");
                wind_speed = chkItem_wp[1].replaceAll('knots','').trim();
      
                if (wind_speed !== null) {
                  // Convert kmh to mph !!!
                  // Divide KMH in half, then add 10% to get a quick, easy conversion to MPH
                  // [number of] kilometres per hour / 1.60934 = [number of] miles per hour
                  var stat_wind_mph = wind_speed / 1.60934;
                  stat_wind_mph = stat_wind_mph.toFixed(0);

                  stat_windInfo_Text = "Wind Speed: " + wind_speed + " knots (" + stat_wind_mph + " mph)";
                }

              } else if (strippedItem.indexOf('Wind Direction') > -1) {
                var chkItem_wd = strippedItem.toString().split(":");
                wind_direction = chkItem_wd[1];

                stat_windDir_Text = strippedItem;
                
              } else if (strippedItem.indexOf('Wind Gust') > -1) {
                var chkItem_wg = strippedItem.toString().split(":");
                var wind_gust_knots = chkItem_wg[1].replaceAll('knots','').trim();
      
                if (wind_gust_knots !== null) {
                  // Convert kmh to mph !!!
                  // Divide KMH in half, then add 10% to get a quick, easy conversion to MPH
                  // [number of] kilometres per hour / 1.60934 = [number of] miles per hour
                  var stat_gusts_mph = wind_gust_knots / 1.60934;

                  stat_gustInfo_Text = "Gusting: to " + wind_gust_knots + " knots (" + stat_gusts_mph.toFixed(0) + " mph)";
                }

                //console.log("Wind Gust ==> " + wind_gust);
              } else if (strippedItem.indexOf('Air Temperature') > -1) {
                var chkItem_at = strippedItem.toString().split(":");
                //air_temperature = chkItem_at[1];

                stat_airTemp_Text = strippedItem;

                //console.log("Air Temperature ==> " + air_temperature);
              } else if (strippedItem.indexOf('Atmospheric Pressure') > -1) {
                var chkItem_at = strippedItem.toString().split(":");
                //air_temperature = chkItem_at[1];

                stat_airPressure_Text = strippedItem;

              } else if (strippedItem.indexOf('Water Temperature') > -1) {
                var chkItem_wt = strippedItem.toString().split(":");
                //water_temperature = chkItem_wt[1];

                stat_waterTemp_Text = strippedItem;
              } 
            }
          }

          //console.log("Wind Speed ==> " + wind_speed);
          //console.log("Wind Direction ==> " + wind_direction);
          if (!(wind_direction == null && wind_speed == null))
          {
            // Knots
            var speed_knots = wind_speed.replaceAll('knots','').trim();
            
            // Degrees - Wind direction
            // Pull out the drgrees from the 
            //var regExp = new RegExp("/\(([^)]+)\)/");
            var regExp = /\(([^)]+)\)/;
            var wind_matches = regExp.exec(wind_direction);
            var dir_degrees = wind_direction;

            var dir_Text = wind_direction;

            if (wind_matches != null) {
              let w_Match = wind_matches[1];
              //console.log("w_Match ==> " + w_Match);

              // Wind direction must me an int
              // There should alway be a value here at this point
              // dir_degrees = parseInt(w_Match);

              // Rememeber, wind direction is where 
              // three wind in coming from!!
              var convert_deg_NOAA = parseInt(w_Match) + 180;
              if (convert_deg_NOAA >= 360)
                  convert_deg_NOAA = convert_deg_NOAA - 360;

              dir_degrees = convert_deg_NOAA;

              //console.log("dir_degrees ==> " + dir_degrees);
            }

            // Create a 'windDataFeaturesList' object and push it into the return object
            windDataFeaturesList.push({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [longitude, latitude],
              },
              properties: {
                id: statId,
                stat_name: stat_title,
                //station_type: "NDBC",
                station_type: station_type,
                wind_direction: dir_degrees,
                wind_speed: speed_knots,

                // For Display 
                stat_Updated: stat_Updated_Text,    
                stat_windInfo: stat_windInfo_Text,
                stat_gustInfo: stat_gustInfo_Text,
                stat_windDir: stat_windDir_Text,
                stat_airTemp: stat_airTemp_Text,
                stat_airPressure: stat_airPressure_Text,
                stat_waterTemp: stat_waterTemp_Text,
              },
            });

          }

        }); // Iterate through the Station data
      });

      var FeatureCollection = {
        type: "FeatureCollection",
        features: windDataFeaturesList
      }

      console.log(" ==> Wind Data Loaded <==");

      return Promise.resolve(FeatureCollection);
    };

    /****************************************************************************
     * 
     *  This function will compile Feature Collection of Sea Surface
     *  temperature data from NOAA/NDBC Stations that will include:
     * 
     *  ==> water_temp_F
     *  ==> water_temp_C
     *  ==> longitude
     *  ==> latitude
     * 
     *****************************************************************************/
    const getSeaSurfaceTempData = async (_mboxLat, _mboxLng) => {

        // Return object
        const seaTempDataFeaturesList = [];

        /************************/
        /* NOAA (NDBC) Stations */
        /************************/
        console.log("NOAA (NDBC) Stations ==> ");
        const urlNdbcStations = `http://localhost:8080/?lat=${_mboxLat}N&lon=${(_mboxLng * -1)}W&radius=100`;
        //console.log("getNdbcStationsData URL ==> " + urlNdbcStations);
  
        // ==> axios w/o Set State <==
        const response = await axios(urlNdbcStations);
        //return await response.data;
        const data = await response.data;
        //console.log(data);
  
        // The result object below will be in JSON format
        var parseString = require('xml2js').parseString;
        parseString(data, function (err, result) {
          //console.log(util.inspect(result, false, null));
          //var resultFull = util.inspect(result, false, null);
  
          // Create Feature Collection here:
          // OK, result object above will be in JSON format
  
          // Re-name the 'georss:point' node
          var resultStringInit = JSON.stringify(result); 
          var resultString = resultStringInit.replaceAll('georss:point','geopoint');
          const valuesArray = JSON.parse(resultString);
  
          // Drill-down to the channel level
          // There should be only ONE channel node
          // Properties Spread Notation
          var stationData = [...valuesArray.rss.channel];
  
          // Iterate through the Station data
          stationData[0].item.map(async (station) => {
              // Skip all 'SHIP' title entries
              if (station.title.toString().toLowerCase() !== 'ship') {
              //console.log('geopoint: ' + station.title);
            
              // ==> id
              // From station.link
              var checkLinkIndex = station.link.toString().trim().lastIndexOf("station=");
              var stationId = station.link.toString().trim().substring(checkLinkIndex + 8);
              var statId = stationId.toUpperCase();
              var stat_title = station.title.toString();
  
              // Attempt to grab the NOAA (NDBC) Id to remove
              // it from the Station title (Name)
              //var regExp_title = /\-([^-]+)\-/
              var regExp_title = /-([0-9\s]+)-/;
              var title_match = regExp_title.exec(stat_title);
            
              if (title_match != null) {
                let t_Match = title_match[0];
                stat_title = stat_title.replace(t_Match, '-');
              }
    
              // ==> coords
              var coords = station.geopoint.toString().split(" ");
              // ==> latitude
              var sta_latitude = coords[0];
              var latitude = parseFloat(sta_latitude.toString(), 2);
              // ==> longitude
              var sta_longitude = coords[1];
              var longitude = parseFloat(sta_longitude.toString(), 2);
              
              let water_temperature_F = null;
              let water_temperature_C = null;
  
              //OK, now that we have it, how the hell do I parse out the Description data!!!!
              var parseDesc = station.description.toString().split('<br />');
              for (let i=0; i < parseDesc.length; i++) {
                //console.log(parseDesc[i]);
  
                // Get her all warshed out!
                var strippedDescItem = parseDesc[i].replaceAll('<strong>','').replaceAll('</strong>','').trim();
                if (strippedDescItem.length > 0 ) {
                  //console.log(strippedDescItem)

                  //<strong>Water Temperature:</strong> 46&#176;F (7.6&#176;C)<br />
  
                  // Remove the 'degrees' symbol
                  var strippedItem = strippedDescItem.replaceAll('&#176;', '');
  
                  //Water Temperature: 46F (7.6C)
                  if (strippedItem.indexOf('Water Temperature') > -1) {
                    var chkItem_wt = strippedItem.toString().split(":");

                    var chk_water_temp = chkItem_wt[1];

                    // Get the Celsius data first
                    var regExp_C = /\(([^)]+)\)/;
                    var celsius_matches = regExp_C.exec(chk_water_temp);
                    if (celsius_matches != null) {
                        water_temperature_C = celsius_matches[1].replaceAll('C','').trim();
                    }

                    // Get the Fahrenheit data first
                    var regExp_F = /^([0-9\s]+)F/;
                    var fahr_matches = regExp_F.exec(chk_water_temp);
                    if (fahr_matches != null) {
                        water_temperature_F = fahr_matches[1];
                    }
                  } 
                }
              }
  
              if (!(water_temperature_F == null && water_temperature_C == null))
              {
                // Create a 'seaTempDataFeaturesList' object and Promise as a return object
                seaTempDataFeaturesList.push({
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [longitude, latitude],
                  },
                  properties: {
                    id: statId,
                    name: stat_title,
                    type: "NOAA",
                    is_Buoy: true,
                    water_temp_F: water_temperature_F,
                    water_temp_C: water_temperature_C,
                  },
                });
              }
  
            }
  
          }); // Iterate through the Station data
        });
  
        var FeatureCollection = {
          type: "FeatureCollection",
          features: seaTempDataFeaturesList
        }
  
        console.log(" ==> Sea Tempurature  Loaded <==");
  
        return Promise.resolve(FeatureCollection);
      };


      const getSstFtpTifData = async () => {

        let _year = 2021;
        let _month = 4;
        let _day = 4;

        const ftpSstTifData = `https://ftp.cpc.ncep.noaa.gov/GIS/sst_oiv2/sst_io.${_year}${_month}${_day}.tif.zip`;
  
        // ==> axios w/o Set State <==
        const response = await axios(ftpSstTifData);
        const data = await response.data;
        console.log("==> Ftp Sea Surface Temperature zip file <==");
        
        return data;
      };

    // Add navigation control (the +/- zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.resize();

    // https://gis.stackexchange.com/questions/240134/mapbox-gl-js-source-loaded-event

    /*
    map.once('styledata', loadTiles);   //The listener will be called first time the event fires after the listener is registered.

    map.on("styledata", loadTiles);    // will fire multiple 3 times, whenever style changed.  
                                       // event.stopPropagation(); does not work.

    map.on("load", loadTiles);         // only fire 1 time. but when you change base map, use below

    map.setStyle('mapbox://styles/mapbox/' + layerId, {diff: false});
                                       //  on load event will not fire, which I need it fire to re-load geojson layer. 

    map.on("styledata"    // works fine, but it fire 3 same event at same time, cause load 3 times geojson layer, cause other error when you load 3 times geojson layer at same time.
    */

    //map.on("load", function () {
    //map.on('style.load', function() {
    map.on("load", () => {
      // add the data source for new a feature collection with no features
      console.log("map.on('style.load')");

      // The Data must lie in state!!!
      getStationsData(_gridId, _gridX, _gridY) //;
      .then(async nwsData => {
        if (nwsData.type === "FeatureCollection")
        {
          setNwsStations(nwsData);
        }
      })
      .catch(error => {
        console.log("ERROR ==> getStationsData: " + JSON.stringify(error));
      });
  
      // Call asyc getNdbcStationsData
      // Set State below or check for error
      getNdbcStationsData(_mBox_Lat, _mBox_Lng)
      .then(ndbcData => {
        setNdbcStations(ndbcData);
      })
      .catch(error => {
        console.log("ERROR ==> getNdbcStationsData: " + JSON.stringify(error));
      });
  
      // Call asyc getStationWindData
      // Set State below or check for error
      getStationWindData(_mBox_Lat, _mBox_Lng)
      .then(windData => {
        setStationWindData(windData);
      })
      .catch(error => {
        console.log("ERROR ==> getStationWindData: " + JSON.stringify(error));
      });

      // Call asyc getSeaSurfaceTempData
      // Set State below or check for error
      getSeaSurfaceTempData(_mBox_Lat, _mBox_Lng)
      .then(seaTempData => {
        setSurfaceSeaTempData(seaTempData);
      })
      .catch(error => {
        console.log("ERROR ==> getSeaSurfaceTempData: " + JSON.stringify(error));
      });

      // Call asyc getSeaSurfaceTempData
      // Set State below or check for error
      getSstFtpTifData()
      .then(ftpSeaTempData => {
        setSurfaceSeaTempData(ftpSeaTempData);
      })
      .catch(error => {
        console.log("ERROR ==> getSeaSurfaceTempData: " + JSON.stringify(error));
      });

    });

    // Set the state values for the 'sidebar'
    map.on('move', () => {
      setLng(map.getCenter().lng.toFixed(4));
      setLat(map.getCenter().lat.toFixed(4));
      setZoom(map.getZoom().toFixed(2));

    //   setMapControl(map);
    });

    // Clean up on unmount
    return () => map.remove();
  }, []); //eslint-disable-line; react-hooks/exhaustive-deps
  // <== useEffect

/* 'Sliding' Sidebar Menu */
const toggleSidebar = () => {
    if (document.getElementById("mySidebar").style.marginLeft === "0px"
        || document.getElementById("mySidebar").style.marginLeft === "") {
       document.getElementById("mySidebar").style.marginLeft = "250px";
       document.getElementById("mySidebarBtn").style.marginLeft = "250px";
    } else {
      document.getElementById("mySidebar").style.marginLeft = "0px";
      document.getElementById("mySidebarBtn").style.marginLeft = "0px";
    }
  }

/* Card onClick event to load requested sources/layers */
const loadMapLayer = (layerId) => {

    const canvas = document.getElementById('canvas');
    console.log("Mapbox Canvas ==> ");
    console.log(canvas);

    // Tidy Up!!!
    // Layers First..
    for(var i = 0; i < mapLayers.length; i++) { 
      if (map_control.getLayer(mapLayers[i]) != null)
          map_control.removeLayer(mapLayers[i]);

          console.log("Map Layer ==> " + mapLayers[i]);
    }

    // Sources next...
    for(var j = 0; j < mapSources.length; j++) { 
      if (map_control.getSource(mapSources[j]) != null)
          map_control.removeSource(mapSources[j]);

      console.log("Map Source ==> " + mapSources[j]);
    }

    switch(layerId) {
      /* Wind Map  */
      case 1:

        console.log("StationWindData ==> from State");
        if (stationWindData.type === "FeatureCollection"){

          // var toolTip = new mapboxgl.Popup({
          //   closeButton: false,
          //   closeOnClick: false
          // });

          // var popUpRef = new mapboxgl.Popup({ offset: 15 });

          map_control.addSource("station-wind-data", {
              type: "geojson",
              data: stationWindData
          }); 

            map_control.addLayer({
              id: "station-wind-layer",
              source: "station-wind-data",
              type: "symbol",
              layout: {
                // full list of icons here: https://labs.mapbox.com/maki-icons
                "icon-image": "airport-15", // this icons on our map
                "icon-padding": 0,
                "icon-allow-overlap": true,
                "icon-rotation-alignment": "map",
                "icon-rotate":{
                  "property":"wind_direction",
                  "stops": [
                    [30, 30],
                    [60, 60],
                    [90, 90],
                    [120, 120],
                    [150, 150],
                    [180, 180],
                    [210, 210],
                    [240, 240],
                    [270, 270],
                    [300, 300],
                    [330, 330],
                    [360, 360]
                  ],
                  // "layout": {
                  //   "text-field": FeatureCollection.features[i].properties.WIND_SPEED > 0 ? 'E' : '5',
                  //   "text-font": ['ESRI Dimensioning Regular'],
                  //   "text-rotate": FeatureCollection.features[i].properties.WIND_DIRECT,
                  //   "text-rotation-alignment": 'map',
                  //   "text-size": windSize(FeatureCollection.features[i])
                  // },
                  // 'paint': {
                  //   'fill-color': '#088',
                  //   'fill-opacity': 0.8,
                  //   'fill-outline-color': '#000'
                  // },
                }
              }
          });

          // change cursor to pointer when user hovers over a clickable feature
          map_control.on("mouseenter", "station-wind-layer", e => {
            if (e.features.length) {
              map_control.getCanvas().style.cursor = "pointer";

              var coordinates = e.features[0].geometry.coordinates.slice();
              var stat_Name = e.features[0].properties.stat_name;

              // Ensure that if the map is zoomed out such that multiple
              // copies of the feature are visible, the popup appears
              // over the copy being pointed to.
              while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
              }
               
              // Populate the popup and set its coordinates
              // based on the feature found.
              toolTip.setLngLat(coordinates).setHTML(stat_Name).addTo(map_control);
            }
          });

          // reset cursor to default when user is no longer hovering over a clickable feature
          map_control.on("mouseleave", "station-wind-layer", () => {
            map_control.getCanvas().style.cursor = "";
            toolTip.remove();
          });

          // add popup when user clicks a point
          map_control.on("click", "station-wind-layer", e => {
            if (e.features.length) {
              //console.log('features => ' + e.features.length);
              const feature = e.features[0];
              var coordinates = feature.geometry.coordinates.slice();

              // create popup node
              const popupNode = document.createElement("div");
              ReactDOM.render(<StationDetailsPopup feature={feature} />, popupNode);

              //popUpRef.setLngLat(coordinates).setHTML(popupNode).addTo(map_control);
              popUpRef.setLngLat(coordinates).setDOMContent(popupNode).addTo(map_control);
            }
          });

        }
       
        break;

      /* Stations and Buoys */
      case 2:

        console.log("NWS StationData ==> from State");
        console.log("NDBC Station Data ==> from State");

        if (nwsStations.type === "FeatureCollection")
        {
          map_control.addSource("nws-station-data", {
            type: "geojson",
            data: nwsStations,
          });
    
            // now add the layer, and reference the data source above by name
            map_control.addLayer({
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

            // change cursor to pointer when user hovers over a clickable feature
            map_control.on("mouseenter", "nws-station-layer", e => {
              if (e.features.length) {
                map_control.getCanvas().style.cursor = "pointer";

                var coordinates = e.features[0].geometry.coordinates.slice();
                var stat_Name = e.features[0].properties.stat_name;

                //console.log('coordinates => ' + coordinates);
                //console.log('stat_Name => ' + stat_Name);
                
                // Ensure that if the map is zoomed out such that multiple
                // copies of the feature are visible, the popup appears
                // over the copy being pointed to.
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }
                
                // Populate the popup and set its coordinates
                // based on the feature found.
                toolTip.setLngLat(coordinates).setHTML(stat_Name).addTo(map_control);
              }
            });

            // reset cursor to default when user is no longer hovering over a clickable feature
            map_control.on("mouseleave", "nws-station-layer", () => {
              map_control.getCanvas().style.cursor = "";
              toolTip.remove();
            });

            // add popup when user clicks a point
            map_control.on("click", "nws-station-layer", e => {
              if (e.features.length) {
                //console.log('features => ' + e.features.length);
                const feature = e.features[0];
                var coordinates = feature.geometry.coordinates.slice();

                // create popup node
                const popupNode = document.createElement("div");
                ReactDOM.render(<StationDetailsPopup feature={feature} />, popupNode);
                popUpRef.setLngLat(coordinates).setDOMContent(popupNode).addTo(map_control);
              }
            });

        }

        if (ndbcStations.type === "FeatureCollection")
        {

          const stationsFeaturesList = [];
          const shipsFeaturesList = [];

          // Bucket the retrieved stations 
          Object.keys(ndbcStations).map(async (key) => {
            if (key === "features") {
              ndbcStations[key].map(async (statFeatures) => {
                if (statFeatures.properties.station_type === "NDBC_Station"){
                  stationsFeaturesList.push(statFeatures);
                }
                else if (statFeatures.properties.station_type === "NDBC_Ship") {
                  shipsFeaturesList.push(statFeatures);
                }
              });
            }
          });

          //console.log("stationsFeaturesList ==> " + stationsFeaturesList.length);
          // console.log("stationsFeaturesList ==>");
          // console.log(stationsFeaturesList);

          //console.log("shipsFeaturesList ==> " + shipsFeaturesList.length);
          // console.log("shipsFeaturesList ==>");
          // console.log(shipsFeaturesList);

          // Stations Feature Collection
          var stationsFeatureCollection = {
            type: "FeatureCollection",
            features: stationsFeaturesList
          }

          // Ships Feature Collection
          var shipsFeatureCollection = {
            type: "FeatureCollection",
            features: shipsFeaturesList
          }

          /* NDBC/NOAA Station Data */
          map_control.addSource("ndbc-station-data", {
            type: "geojson",
            data:  stationsFeatureCollection,
          });

            // now add the layer, and reference the data source above by name
            map_control.addLayer({
              id: "ndbc-station-layer",
              source: "ndbc-station-data",
              type: "symbol",
              layout: {
                // full list of icons here: https://labs.mapbox.com/maki-icons
                "icon-image": "cemetery-15", // this icons on our map
                "icon-padding": 0,
                "icon-allow-overlap": true
              }
            });

            // change cursor to pointer when user hovers over a clickable feature
            map_control.on("mouseenter", "ndbc-station-layer", e => {
              if (e.features.length) {
                map_control.getCanvas().style.cursor = "pointer";

                var coordinates = e.features[0].geometry.coordinates.slice();
                var stat_Name = e.features[0].properties.stat_name;

                //console.log('coordinates => ' + coordinates);
                //console.log('stat_Name => ' + stat_Name);
                
                // Ensure that if the map is zoomed out such that multiple
                // copies of the feature are visible, the popup appears
                // over the copy being pointed to.
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }
                
                // Populate the popup and set its coordinates
                // based on the feature found.
                toolTip.setLngLat(coordinates).setHTML(stat_Name).addTo(map_control);
              }
            });

            // reset cursor to default when user is no longer hovering over a clickable feature
            map_control.on("mouseleave", "ndbc-station-layer", () => {
              map_control.getCanvas().style.cursor = "";
              toolTip.remove();
            });

            // add popup when user clicks a point
            map_control.on("click", "ndbc-station-layer", e => {
              if (e.features.length) {
                //console.log('features => ' + e.features.length);
                const feature = e.features[0];
                var coordinates = feature.geometry.coordinates.slice();

                // create popup node
                const popupNode = document.createElement("div");
                ReactDOM.render(<StationDetailsPopup feature={feature} />, popupNode);
                popUpRef.setLngLat(coordinates).setDOMContent(popupNode).addTo(map_control);
              }
            });

          /* NDBC/NOAA Ship Data */
          map_control.addSource("ndbc-ship-data", {
            type: "geojson",
            data:  shipsFeatureCollection,
          });

            // now add the layer, and reference the data source above by name
            map_control.addLayer({
              id: "ndbc-ship-layer",
              source: "ndbc-ship-data",
              type: "symbol",
              layout: {
                // full list of icons here: https://labs.mapbox.com/maki-icons
                "icon-image": "harbor-15", // this icons on our map
                "icon-padding": 0,
                "icon-allow-overlap": true
              }
            });

            // change cursor to pointer when user hovers over a clickable feature
            map_control.on("mouseenter", "ndbc-ship-layer", e => {
              if (e.features.length) {
                map_control.getCanvas().style.cursor = "pointer";

                var coordinates = e.features[0].geometry.coordinates.slice();
                var stat_Name = e.features[0].properties.stat_name;

                //console.log('coordinates => ' + coordinates);
                //console.log('stat_Name => ' + stat_Name);
                
                // Ensure that if the map is zoomed out such that multiple
                // copies of the feature are visible, the popup appears
                // over the copy being pointed to.
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }
                
                // Populate the popup and set its coordinates
                // based on the feature found.
                toolTip.setLngLat(coordinates).setHTML(stat_Name).addTo(map_control);
              }
            });

            // reset cursor to default when user is no longer hovering over a clickable feature
            map_control.on("mouseleave", "ndbc-ship-layer", () => {
              map_control.getCanvas().style.cursor = "";
              toolTip.remove();
            });

            // add popup when user clicks a point
            map_control.on("click", "ndbc-ship-layer", e => {
              if (e.features.length) {
                //console.log('features => ' + e.features.length);
                const feature = e.features[0];
                var coordinates = feature.geometry.coordinates.slice();

                // create popup node
                const popupNode = document.createElement("div");
                ReactDOM.render(<StationDetailsPopup feature={feature} />, popupNode);
                popUpRef.setLngLat(coordinates).setDOMContent(popupNode).addTo(map_control);
              }
            });
        }


        // // change cursor to pointer when user hovers over a clickable feature
        // map_control.on("mouseenter", "station-wind-layer", e => {
        //   if (e.features.length) {
        //     map_control.getCanvas().style.cursor = "pointer";
        //   }
        // });

        // // reset cursor to default when user is no longer hovering over a clickable feature
        // map_control.on("mouseleave", "station-wind-layer", () => {
        //   map_control.getCanvas().style.cursor = "";
        // });
        
        break;

      /* Sea Surface Tempeture ==> Heat Map */
      /*
        heatmap-weight: Measures how much each individual point contributes to the appearance of your heatmap. Heatmap layers have a weight of one by default, which means that all points are weighted equally. Increasing the heatmap-weight property to five has the same effect as placing five points in the same location. You can use a stop function to set the weight of your points based on a specified property.
        
        heatmap-intensity: A multiplier on top of heatmap-weight that is primarily used as a convenient way to adjust the appearance of the heatmap based on zoom level.
        
        heatmap-color: Defines the heatmap's color gradient, from miniumum value to maximum value. The color displayed is dependent on the heatmap-density value of each pixel (ranging from 0.0 to 1.0). The value of this property is an expression that uses heatmap-density as the input. For inspiration on color choices for your heatmap, take a look at Color Brewer.
        
        heatmap-radius: Sets the radius for each point in pixels. The bigger the radius, the smoother the heatmap and the less amount of detail.
        
        heatmap-opacity: Controls the global opacity of the heatmap layer
      */
      case 3: 

        if (surfaceSeaTempData.type === "FeatureCollection")
        {
            /* NOAA Station Data */
            map_control.addSource("sea-temp-data", {
                type: "geojson",
                data:  surfaceSeaTempData,
            });

            // add heatmap layer here
            map_control.addLayer({
                // id: 'surface-temp-heat',
                id: 'sea-temp-layer',
                type: 'heatmap',
                source: 'sea-temp-data',
                maxzoom: 15,
                paint: {
                  // increase weight as surface Sea Temperature increases
                  'heatmap-weight': {
                    property: 'water_temp_F',
                    type: 'exponential',
                    stops: [
                      [1, 0],
                      [62, 1]
                    ]
                  },
                  // increase intensity as zoom level increases
                  'heatmap-intensity': {
                    stops: [
                      [11, 1],
                      [15, 3]
                    ]
                  },
                  // assign color values be applied to points depending on their density
                  'heatmap-color': [
                    'interpolate',
                    ['linear'],
                    ['heatmap-density'],
                    0, 'rgba(236,222,239,0)',
                    0.2, 'rgb(208,209,230)',
                    0.4, 'rgb(166,189,219)',
                    0.6, 'rgb(103,169,207)',
                    0.8, 'rgb(28,144,153)'
                  ],
                  // increase radius as zoom increases
                  'heatmap-radius': {
                    stops: [
                      [11, 15],
                      [15, 20]
                    ]
                  },
                  // decrease opacity to transition into the circle layer
                  'heatmap-opacity': {
                    default: 1,
                    stops: [
                      [14, 1],
                      [15, 0]
                    ]
                  },
                }
              }, 'waterway-label');

            // add circle layer here
            map_control.addLayer({
                id: 'sea-temp-point',
                type: 'circle',
                source: 'sea-temp-data',
                minzoom: 14,
                paint: {
                  // increase the radius of the circle as the zoom level and dbh value increases
                  'circle-radius': {
                    property: 'water_temp_F',
                    type: 'exponential',
                    stops: [
                      [{ zoom: 15, value: 1 }, 5],
                      [{ zoom: 15, value: 62 }, 10],
                      [{ zoom: 22, value: 1 }, 20],
                      [{ zoom: 22, value: 62 }, 50],
                    ]
                  },
                  'circle-color': {
                    property: 'water_temp_F',
                    type: 'exponential',
                    stops: [
                      [0, 'rgba(236,222,239,0)'],
                      [10, 'rgb(236,222,239)'],
                      [20, 'rgb(208,209,230)'],
                      [30, 'rgb(166,189,219)'],
                      [40, 'rgb(103,169,207)'],
                      [50, 'rgb(28,144,153)'],
                      [60, 'rgb(1,108,89)']
                    ]
                  },
                  'circle-stroke-color': 'white',
                  'circle-stroke-width': 1,
                  'circle-opacity': {
                    stops: [
                      [14, 0],
                      [15, 1]
                    ]
                  }
                }
              }, 'waterway-label');


            // // now add the layer, and reference the data source above by name
            // map_control.addLayer({
            //     id: "sea-temp-layer",
            //     source: "sea-temp-data",
            //     type: "symbol",
            //     layout: {
            //     // full list of icons here: https://labs.mapbox.com/maki-icons
            //     "icon-image": "cemetery-15", // this icons on our map
            //     "icon-padding": 0,
            //     "icon-allow-overlap": true
            //     }
            // });
        }

      /* Wind Map  */
      default:
        
    }
  }

  return (
      <div >
          <div className='nav-container'>
              <Navbar expand="lg" variant="dark" bg="dark" >
                {/* <Button onClick={toggleSidebar} className='openbtn' variant="outline-info">☰</Button> */}
                <Navbar.Brand className='navbarLink' href="#home">Fish Finders</Navbar.Brand>
              </Navbar>      
          </div>
          <div id='mapbox_main' className='map-wrapper'>
            <div className='mapInfoStyle'>
              <div>
                  Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
              </div>
            </div>
            <div className='map-container' ref={mapContainerRef} />
          </div>
          <div id="mySidebarContainer" className="sidebarContainer">
            <div id="mySidebar" className="sidebar">
                <Accordion className='accordion-custom' defaultActiveKey="0">
                <Card className='card-custom'>
                    <Accordion.Toggle className='card-header-custom' as={Card.Header} eventKey="0">
                    Maps
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey="0">
                        <Card.Body className='card-body-custom'>
                            <a href="#" onClick={() => loadMapLayer(1)}>Wind Map</a>
                            <a href="#" onClick={() => loadMapLayer(2)}>Stations and Buoys</a>
                            <a href="#" onClick={() => loadMapLayer(3)}>Sea Surface Temps</a>
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>
                </Accordion>
            </div>
            <Container id="mySidebarBtn" className="sidebar-button">
                <Button id="floatingBtn" onClick={toggleSidebar} className='openbtn' variant="outline-info">☰</Button>
            </Container>
          </div>

      </div>
        // <div className='nopadding'>
        //   <Row>
        //     <Col xs={12}>
        //      {/* <div className='nav-container'> */}
        //        <Navbar expand="lg" variant="dark" bg="dark">
        //          <Navbar.Brand left-padding='10' href="#home">Fish Finders</Navbar.Brand>
        //        </Navbar>      
        //      {/* </div> */}
        //     </Col>
        //   </Row>
        //   <Row>
        //     <Col xs={1}>
        //       buttons
        //     </Col>
        //     <Col xs={11}>
        //       <div className='sidebarStyle'>
        //         <div>
        //             Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        //         </div>
        //       </div>
        //       <div className='map-container' ref={mapContainerRef}>
        //       </div>
        //     </Col>
        //   </Row>
        // </div>
      );
};
    
export default MapViewer_v3;
