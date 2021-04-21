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

function MapViewer_v2 () {
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

    const [map_control, setMapControl] = useState();

    var mapSources = ["station-wind-data", "nws-station-data", "ndbc-station-data"];
    var mapLayers = ["station-wind-layer", "nws-station-layer", "ndbc-station-layer"];

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

      // ==> axios w/o Set State <==
      const response = await axios(urlNwsStations);
      const data = await response.data;
      console.log("==> NdbcStations Data Loaded <==");
      
      return data;
    };
  

    const getNdbcStationsData = async (_mboxLat, _mboxLng) => {
      //const urlNdbcStations = `https://www.ndbc.noaa.gov/rss/ndbc_obs_search.php?lat=${_mboxLat}N&lon=${(_mboxLng * -1)}W&radius=100`;
      const urlNdbcStations = `http://localhost:8080/?lat=${_mboxLat}N&lon=${(_mboxLng * -1)}W&radius=100`;
      //console.log("getNdbcStationsData URL ==> " + urlNdbcStations);

      /* Properties:
        ==> id
        ==> updated

        ==> wind_direction
        ==> wind_speed
        ==> wind_gust
        ==> air_temperature
        ==> water_temperature
        ==> longitude
        ==> latitude
      */

      // Return object
      const newFeaturesList = [];

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
          //console.log('title: ' + station.title);
          //console.log('geopoint: ' + station.geopoint);
          //onsole.log('link: ' + station.link.toString().trim());

            // Skip all 'SHIP' title entries
            if (station.title.toString().toLowerCase() !== 'ship') {
            //console.log('geopoint: ' + station.title);
          
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

            // console.log('stationId: ' + statId);
            // console.log('latitude: ' + latitude);
            // console.log('longitude: ' + longitude);

            let updated = '';
            let wind_direction = '';
            let wind_speed = '';
            let wind_gust = '';
            let air_temperature = '';
            let water_temperature = '';
            let wind_degrees = '';
            let water_degrees = '';

            //OK, now that we have it, how the hell do I parse out the Description data!!!!
            var parseDesc = station.description.toString().split('<br />');
            for (let i=0; i < parseDesc.length; i++) {
              //console.log(parseDesc[i]);

              // Get her all warshed out!
              var strippedDescItem = parseDesc[i].replaceAll('<strong>','').replaceAll('</strong>','').trim();
              if (strippedDescItem.length > 0 ) {
                //console.log(strippedDescItem)

                // Remove the 'degrees' symbol
                var strippedItem = strippedDescItem.replaceAll('&#176;', '');

                if (strippedItem.indexOf('Wind Speed') > -1) {
                  var chkItem_ws = strippedItem.toString().split(":");
                  wind_speed = chkItem_ws[1];

                  //console.log("Wind Speed ==> " + wind_speed);
                } else if (strippedItem.indexOf('Wind Direction') > -1) {
                  var chkItem_wd = strippedItem.toString().split(":");
                  wind_direction = chkItem_wd[1];

                  //console.log("Wind Direction ==> " + wind_direction);
                } else if (strippedItem.indexOf('Wind Gust') > -1) {
                  var chkItem_wg = strippedItem.toString().split(":");
                  wind_gust = chkItem_wg[1];

                  //console.log("Wind Gust ==> " + wind_gust);
                } else if (strippedItem.indexOf('Air Temperature') > -1) {
                  var chkItem_at = strippedItem.toString().split(":");
                  air_temperature = chkItem_at[1];

                  //console.log("Air Temperature ==> " + air_temperature);
                } else if (strippedItem.indexOf('Water Temperature') > -1) {
                  var chkItem_wt = strippedItem.toString().split(":");
                  water_temperature = chkItem_wt[1];

                  //console.log("Water Temperature ==> " + water_temperature);
                } 
                //   else if (strippedItem.indexOf('Wind Direction') > -1) {
                //   var chkItem = strippedItem.toString().split(":");
                //   wind_direction = chkItem[1];

                //   console.log("Wind Direction ==> " + wind_speed);
                // }

              }
            }

            // Create a 'newFeaturesList' object and pusgh it into the  
            newFeaturesList.push({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [longitude, latitude],
              },
              properties: {
                id: statId,
                updated: updated,
                wind_direction: wind_direction,
                wind_speed: wind_speed,
                wind_gust: wind_gust,
                air_temperature: air_temperature,
                water_temperature: water_temperature,
              },
            });
          }

        }); // Iterate through the Station data
      });

      console.log("==> NdbcStations Data Loaded <==");

      return await Promise.resolve({
        type: 'FeatureCollection',
        features: newFeaturesList,
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

      //console.log("getStationWindData == > _gridId_resp: ==> " + _gridId_resp);
      //console.log("getStationWindData == >_gridX_resp: ==> " + _gridX_resp);
      //console.log("getStationWindData == >_gridY_resp: ==> " + _gridY_resp);

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

        var station_id = null;
        var stat_lon_coord = null;
        var stat_lat_coord = null;
        var stat_windDirection = null;
        var stat_windSpeed = null;
        var stat_Identifier = null;
        var stat_Name = null;

        // if (key === "observationStations"){
        //   console.log("Observation Stations: ==> ");
        //   nwsStations[key].map(async (stationUrl) => {
        if (key === "features"){
          //console.log("features: ==> ");
          nwsStations[key].map(async (stat_Features) => {
            //console.log("stat_Features ==>");
            //console.log(stat_Features);

            var stationUrl = stat_Features.id.toString();
            //console.log("stationUrl: " + stationUrl);

            // Create the URL to grab the individual Station Data  
            var stationDataUrl = `${stationUrl}/observations/latest`;
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

                stat_windSpeed = stationData[key1].windSpeed.value;

                var conv_windDirection = stationData[key1].windDirection.value;
                //console.log("conv_windDirection ==> " + conv_windDirection);

                var convert_deg = parseInt(conv_windDirection) + 180;
                if (convert_deg >= 360)
                  convert_deg = convert_deg - 360;

                stat_windDirection = convert_deg;
                //console.log("stat_windDirection ==> " + stat_windDirection);
              }

            }); // stationData

            station_id = stat_Features.properties.stationIdentifier;
            stat_Identifier = stat_Features.properties.stationIdentifier;
            stat_Name = stat_Features.properties.name;

            // Add NWS Station data. if it qualifies.
            //
            // Check for BOTH wind_direction AND sta_windSpeed
            // values, otherwise skip on down...
            if (!(stat_windDirection == null && stat_windSpeed == null))
            {
              //if (stat_windDirection > 0 && stat_windSpeed > 0) {

                // Convert km/h to knots !!!
                // divisor speed (km/h) / 1.852
                var stat_wind_knots = stat_windSpeed / 1.852;

                // Convert kmh to mph !!!
                // divisor speed (km/h) / 1.852
                var stat_wind_mph = stat_windSpeed / 1.852;

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
                    name: stat_Name,
                    type: "NWS",
                    wind_direction: stat_windDirection,
                    wind_speed: stat_wind_knots.toFixed(0),
                  },
                });

              //}

              //console.log(" ==> Nws Stations <==");
            }
            
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
            
            let wind_direction = null; //'';
            let wind_speed =  null; //'';

            //OK, now that we have it, how the hell do I parse out the Description data!!!!
            var parseDesc = station.description.toString().split('<br />');
            for (let i=0; i < parseDesc.length; i++) {
              //console.log(parseDesc[i]);

              // Get her all warshed out!
              var strippedDescItem = parseDesc[i].replaceAll('<strong>','').replaceAll('</strong>','').trim();
              if (strippedDescItem.length > 0 ) {
                //console.log(strippedDescItem)

                // Remove the 'degrees' symbol
                var strippedItem = strippedDescItem.replaceAll('&#176;', '');

                if (strippedItem.indexOf('Wind Speed') > -1) {
                  var chkItem_wp = strippedItem.toString().split(":");
                  wind_speed = chkItem_wp[1];
                } else if (strippedItem.indexOf('Wind Direction') > -1) {
                  var chkItem_wd = strippedItem.toString().split(":");
                  wind_direction = chkItem_wd[1];
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
                  name: stat_title,
                  type: "NOAA",
                  wind_direction: dir_degrees,
                  wind_speed: speed_knots,
                },
              });

            }

          }

        }); // Iterate through the Station data
      });

      // return Promise.resolve({
      //   type: 'FeatureCollection',
      //   features: windDataFeaturesList,
      // });

      var FeatureCollection = {
        type: "FeatureCollection",
        features: windDataFeaturesList
      }

      //console.log(FeatureCollection);
      console.log(" ==> Wind Data Loaded <==");

      // var sourceWindData = new mapboxgl.GeoJSONSource({
      //   data: FeatureCollection
      // })
      // console.log(sourceWindData);

      return Promise.resolve(FeatureCollection);
    };


    // 

    // Add navigation control (the +/- zoom buttons)
    map.resize();
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

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
          //console.log(nwsStations);
          //console.log("getStationsData (Set State Results) ==> " + nwsData.type);
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
        //console.log(ndbcStations);
        //console.log("getNdbcStationsData (Set State Results)");
      })
      .catch(error => {
        console.log("ERROR ==> getNdbcStationsData: " + JSON.stringify(error));
      });
  
      // Call asyc getStationWindData
      // Set State below or check for error
      getStationWindData(_mBox_Lat, _mBox_Lng)
      .then(windData => {
        setStationWindData(windData);
        //console.log("getStationWindData (Set State Results)");
        //console.log(stationWindData);
      })
      .catch(error => {
        console.log("ERROR ==> getStationWindData: " + JSON.stringify(error));
      });

      // OK, let's try this!!!!
      
      // // Call asyc getStationWindData
      // getStationWindData(_mBox_Lat, _mBox_Lng)
      // .then(windData => {
      //     //console.log("getStationWindData ==> windData");
          
      //     /* Station Wind Data */
      //     // windData should be a viable FeatureCollection object
      //     // and at this point should be completely poputaled and available !!

      //     //console.log(windData);
      //     map.addSource("station-wind-data", {
      //         type: "geojson",
      //         data: windData
      //     }); //.loaded(() => {
      //         // do some stuff
      //         //console.log("map.addLayer");

      //       map.addLayer({
      //           id: "station-wind-layer",
      //           source: "station-wind-data",
      //           type: "symbol",
      //           layout: {
      //             // full list of icons here: https://labs.mapbox.com/maki-icons
      //             "icon-image": "airport-15", // this icons on our map
      //             "icon-padding": 0,
      //             "icon-allow-overlap": true,
      //             "icon-rotation-alignment": "map",
      //             "icon-rotate":{
      //               "property":"wind_direction",
      //               "stops": [
      //                 [30, 30],
      //                 [60, 60],
      //                 [90, 90],
      //                 [120, 120],
      //                 [150, 150],
      //                 [180, 180],
      //                 [210, 210],
      //                 [240, 240],
      //                 [270, 270],
      //                 [300, 300],
      //                 [330, 330],
      //                 [360, 360]
      //               ],
      //             }
      //           }
      //       });

      //       // change cursor to pointer when user hovers over a clickable feature
      //       map.on("mouseenter", "station-wind-layer", e => {
      //         if (e.features.length) {
      //           map.getCanvas().style.cursor = "pointer";
      //         }
      //       });

      //       // reset cursor to default when user is no longer hovering over a clickable feature
      //       map.on("mouseleave", "station-wind-layer", () => {
      //         map.getCanvas().style.cursor = "";
      //       });
              
      //     //});

      //     // console.log("Query ==> station-wind-layer")
      //     // const qtyWindData = map.querySourceFeatures("station-wind-layer");
      //     // console.log(qtyWindData)
      // })
      // .catch(error => {
      //     console.log("ERROR ==> getStationWindData: " + JSON.stringify(error));
      // });




      // /* ==> getStationsData  */
      // // Call asyc getStationsData
      // // Set State below or check for error
      // getStationsData(_gridId, _gridX, _gridY) //;
      // .then(nwsStationData => {
      //   if (nwsStationData.type === "FeatureCollection")
      //   {
      //     setNwsStations(nwsStationData); 

      //     map.addSource("nws-station-data", {
      //       type: "geojson",
      //       data: nwsStationData,
      //     });
    
      //       // now add the layer, and reference the data source above by name
      //       map.addLayer({
      //         id: "nws-station-layer",
      //         source: "nws-station-data",
      //         type: "symbol",
      //         layout: {
      //           // full list of icons here: https://labs.mapbox.com/maki-icons
      //           "icon-image": "castle-15", // this icons on our map
      //           "icon-padding": 0,
      //           "icon-allow-overlap": true
      //         }
      //       });
      //   }
      // })
      // .catch(error => {
      //   console.log(JSON.stringify(error));
      // });
    

      // /* ==> getNdbcStationsData  */
      // // Call asyc getNdbcStationsData
      // // Set State below or check for error
      // getNdbcStationsData(_mBox_Lat, _mBox_Lng)
      // .then(ndbcStationData => {

      //   setNdbcStations(ndbcStationData);

      //     /* NOAA Station Data */
      //     map.addSource("ndbc-station-data", {
      //       type: "geojson",
      //       data:  ndbcStationData,
      //     });

      //       // now add the layer, and reference the data source above by name
      //       map.addLayer({
      //         id: "ndbc-station-layer",
      //         source: "ndbc-station-data",
      //         type: "symbol",
      //         layout: {
      //           // full list of icons here: https://labs.mapbox.com/maki-icons
      //           "icon-image": "cemetery-15", // this icons on our map
      //           "icon-padding": 0,
      //           "icon-allow-overlap": true
      //         }
      //       });
      // })
      // .catch(error => {
      //   console.log(JSON.stringify(error));
      // });
    




    });

    // Set the state values for the 'sidebar'
    map.on('move', () => {
      setLng(map.getCenter().lng.toFixed(4));
      setLat(map.getCenter().lat.toFixed(4));
      setZoom(map.getZoom().toFixed(2));
    });

    // Clean up on unmount
    return () => map.remove();
  }, []); //eslint-disable-line; react-hooks/exhaustive-deps
  // <== useEffect


  const openNav = () => {
    document.getElementById("mySidebar").style.width = "250px";
    // document.getElementById("mapbox_main").style.marginLeft = "250px";
  }
  
  const closeNav = () => {
    document.getElementById("mySidebar").style.width = "0";
    // document.getElementById("mapbox_main").style.marginLeft= "0";
  }

  const toggleSidebar = () => {
    // console.log("==> toggleSidebar <==");
    if (document.getElementById("mySidebar").style.width === "0px"
        || document.getElementById("mySidebar").style.width === "") {
       document.getElementById("mySidebar").style.width = "250px";
    } else {
      document.getElementById("mySidebar").style.width = "0px";
    }
  }

  const loadMapLayer = (layerId) => {
    console.log("==> loadMapLayer ==> LayerId: " + layerId);

    // Tidy Up!!!
    // Layers First..
    for(var i = 0; i < mapLayers.length; i++) { 
      if (map_control.getLayer(mapLayers[i]) != null)
          map_control.removeLayer(mapLayers[i]);
    }

    // Sources next...
    for(var j = 0; j < mapSources.length; j++) { 
      if (map_control.getSource(mapSources[j]) != null)
          map_control.removeSource(mapSources[j]);
    }

    switch(layerId) {
      /* Wind Map  */
      case 1:

        console.log("StationWindData ==> from State");
        console.log(stationWindData);

        if (stationWindData.type === "FeatureCollection"){

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
                }
              }
          });

          // change cursor to pointer when user hovers over a clickable feature
          map_control.on("mouseenter", "station-wind-layer", e => {
            if (e.features.length) {
              map_control.getCanvas().style.cursor = "pointer";
            }
          });

          // reset cursor to default when user is no longer hovering over a clickable feature
          map_control.on("mouseleave", "station-wind-layer", () => {
            map_control.getCanvas().style.cursor = "";
          });

        }
       
        break;
      /* Stations and Buoys  */
      case 2:

        console.log("NWS StationData ==> from State");
        console.log(nwsStations);
        console.log("NDBC Station Data ==> from State");
        console.log(ndbcStations);

        // OK, can we find the MapBox Control here???
        // If not I will be Fucking PISSED!!!!!

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
        }

        if (ndbcStations.type === "FeatureCollection")
        {
          /* NOAA Station Data */
          map_control.addSource("ndbc-station-data", {
            type: "geojson",
            data:  ndbcStations,
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
        }

        // change cursor to pointer when user hovers over a clickable feature
        map_control.on("mouseenter", "station-wind-layer", e => {
          if (e.features.length) {
            map_control.getCanvas().style.cursor = "pointer";
          }
        });

        // reset cursor to default when user is no longer hovering over a clickable feature
        map_control.on("mouseleave", "station-wind-layer", () => {
          map_control.getCanvas().style.cursor = "";
        });
        
        break;
      /* Wind Map  */
      default:
        
    }
  }

  return (
      <div >
          <div className='nav-container'>
              <Navbar expand="lg" variant="dark" bg="dark" >
                <Button onClick={toggleSidebar} className='openbtn' variant="outline-info">☰</Button>
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
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
              {/* <Card>
                <Accordion.Toggle as={Card.Header} eventKey="1">
                  Click me!
                </Accordion.Toggle>
                <Accordion.Collapse eventKey="1">
                  <Card.Body>Hello! I'm another body</Card.Body>
                </Accordion.Collapse>
              </Card> */}
            </Accordion>


            {/* <a href="#" className="closebtn" onClick={closeNav}>×</a> */}
            {/* <a href="#">Wind Map</a> */}
            {/* <a href="#">Stations and Buoys</a> */}
            {/* <a href="#">Clients</a> */}
            {/* <a href="#">Contact</a> */}
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
    
export default MapViewer_v2;
