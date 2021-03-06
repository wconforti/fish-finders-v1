import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import './../Map.css';

import axios from 'axios';
import xml2js from 'xml2js';

//import { useRequestNwsStations_Swr } from '../useRequestNwsStations_Swr'
//import { useRequestNwsPoints_Swr } from '../useRequestNwsPoints_Swr'
//import { useRequestNwsStations } from '../useRequestNwsStations';
//import NwsStations from '../api/NwsStations';
//import NwsStationsAsync from '../api/NwsStationsAsync';

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

//const MapViewer = () => {
// State set functions only correctly working when Mapviewer is invoked as a Function.  
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
  const [ndbcStations, setNdbcStations] = useState([]);
  const [stationWindData, setStationWindData] = useState([]);

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
  // http://bl.ocks.org/ajzeigert/e71609306270eefd70eb

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
      console.log(urlNwsPoints);

      // const response = await fetch(urlNwsPoints);
      // //const response = await fetch(urlNwsPoints, {
      // //  mode: 'no-cors', // no-cors, *cors, same-origin,
      // //});
      // //console.log("urlNwsPoints resp: ==> " + response.ok);
      // const data = await response.json();

      const response = await axios(urlNwsPoints);
      const data = response.data;

      //console.log("getNwsPointsData (Results)");
      var _gridId_resp = data.properties.gridId;
      var _gridX_resp = data.properties.gridX;
      var _gridY_resp = data.properties.gridY;

      //console.log("_gridId_resp: ==> " + _gridId_resp);
      //console.log("_gridX_resp: ==> " + _gridX_resp);
      ///console.log("_gridY_resp: ==> " + _gridY_resp);

      setGridId(_gridId_resp);
      setGridX(_gridX_resp);
      setGridY(_gridY_resp);
    };

    //async function getStationsData (_gridId, _gridX, _gridY) {
    const getStationsData = async (_gridId, _gridX, _gridY) => {
      const urlNwsStations = `https://api.weather.gov/gridpoints/${_gridId}/${_gridX},${_gridY}/stations`;
      console.log("urlNwsStations:= " + urlNwsStations);

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

      //setNwsStations(data);
    };


    // async getXMLResponse() {
    //   const response = await fetch('https://gist.githubusercontent.com/Pavneet-Sing/3a69eb13677eba270264579bf0aa2121/raw/8a7cddd4c4dad77ba09f9e59e97b87cc04cf09fa/ParseXMLResponse.xml')
    //   console.log('response is', await response.text());
    // };


    const getNdbcStationsData = async (_mboxLat, _mboxLng) => {
      //const urlNdbcStations = `https://www.ndbc.noaa.gov/rss/ndbc_obs_search.php?lat=${_mboxLat}N&lon=${(_mboxLng * -1)}W&radius=100`;
      const urlNdbcStations = `http://localhost:8080/?lat=${_mboxLat}N&lon=${(_mboxLng * -1)}W&radius=100`;
      console.log("getNdbcStationsData URL ==> " + urlNdbcStations);

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

      // // Promise Usage, seems slower than simple parseString below...
      // var xml2js = require('xml2js');
      // var parser = new xml2js.Parser(/* options */);
      // parser.parseStringPromise(data).then(function (result) {
      //   console.log('parseString Promise:')
      //   console.dir(result);
      // })
      // .catch(function (err) {
      //   // Failed
      //   console.log('parser error');
      // });
      //const util = require('util');

      // The result object below will be in JSON format
      var parseString = require('xml2js').parseString;
      parseString(data, function (err, result) {
        //console.log(util.inspect(result, false, null));
        //var resultFull = util.inspect(result, false, null);

        // Create Feature Collection here:
        // OK, result object above will be in JSON format
        //console.log('stringify: ');
        //console.log(JSON.stringify(result));
        //var resultStringInit = JSON.stringify(result); 
        //console.log('resultStringInit: ');
        //console.log(resultStringInit);

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

                // Remove thhe 'degrees' symbol
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

      // FeatureCollection featureCollection = FeatureCollection.fromFeature(Feature.fromGeometry(lineString))

      // GeoJsonSource geoJsonSource = new GeoJsonSource("geojson-source", featureCollection);
      // style.addSource(geoJsonSource);

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
      console.log(urlNwsPoints);

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

            // station_id = stat_Features.properties.stationIdentifier;
            // stat_Identifier = stat_Features.properties.stationIdentifier;
            // stat_Name = stat_Features.properties.name;

            //console.log("station_id: " + station_id);
            //console.log("stat_Name: " + stat_Name);

            // // ==> id
            // // From stationUrl
            // var checkLinkIndex = stat_Features.id.toString().trim().lastIndexOf("/");
            // let stationId = stat_Features.id.toString().trim().substring(checkLinkIndex + 1);
            // station_id = stationId;
            // Object.keys(stat_Features).map(async (key2) => {
            //   if (key2 === "properties") {
            //     station_id = stat_Features[key2].stationIdentifier;
            //     stat_Identifier = stat_Features[key2].stationIdentifier;
            //     stat_Name = stat_Features[key2].name;
            //   }
            // });

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
              //console.log("station_id: " + station_id);
              //console.log("stat_Name: " + stat_Name);
              //console.log("stat_windDirection: " + stat_windDirection);
              //console.log("stat_windSpeed: " + stat_windSpeed);

              //if (stat_windDirection > 0 && stat_windSpeed > 0) {

                // Convert km/h to knots !!!
                // divisor speed (km/h) / 1.852
                var stat_wind_knots = stat_windSpeed / 1.852;

                // Convert kmh to mph !!!
                // divisor speed (km/h) / 1.852
                var stat_wind_mph = stat_windSpeed / 1.852;

                // console.log("station_id: " + station_id);
                // console.log("stat_Name: " + stat_Name);
                // console.log("stat_windDirection: " + stat_windDirection);
                // console.log("stat_windSpeed: " + stat_windSpeed);
                // console.log("stat_wind_knots: " + stat_wind_knots);
                // console.log("stat_wind_knots (Round): " + stat_wind_knots.toFixed(0));

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

      // ==> axios <==
      // const response = await axios(urlNdbcStations);
      // const data = await response.data;
      // setNwsStations(data);

      // Parse baby... parse...

      // // Promise Usage, seems slower than simple parseString below...
      // var xml2js = require('xml2js');
      // var parser = new xml2js.Parser(/* options */);
      // parser.parseStringPromise(data).then(function (result) {
      //   console.log('parseString Promise:')
      //   console.dir(result);
      // })
      // .catch(function (err) {
      //   // Failed
      //   console.log('parser error');
      // });
      //const util = require('util');

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
          //console.log('title: ' + station.title);
          //console.log('geopoint: ' + station.geopoint);
          //onsole.log('link: ' + station.link.toString().trim());

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
                //dir_degrees = parseInt(w_Match);

                // Rememeber, wind direction is where 
                // three wind in coming from!!
                var convert_deg_NOAA = parseInt(w_Match) + 180;
                if (convert_deg_NOAA >= 360)
                   convert_deg_NOAA = convert_deg_NOAA - 360;

                dir_degrees = convert_deg_NOAA;
              }

              //var dir_degrees = matches[1];
              //var dir_degrees = wind_direction;

              // // Add NOAA Station data. if it qualifies.
              // console.log("Push ==> NOAA Station: " + stat_title);
              // console.log("statId ==> " + statId);
              // console.log("stat_title ==> " + stat_title);
              // console.log("speed_knots ==> " + speed_knots);
              // console.log("dir_degrees ==> " + dir_degrees);

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

      console.log(FeatureCollection);
      console.log(" ==> Wind Data Loaded <==");

      // var sourceWindData = new mapboxgl.GeoJSONSource({
      //   data: FeatureCollection
      // })
      // console.log(sourceWindData);

      return Promise.resolve(FeatureCollection);

    };

    //getNwsPointsData(_mBox_Lat, _mBox_Lng);

     //console.log("getStationsData (Set State Results)");
     //console.log("gridId: ==> " + gridId);
     //console.log("gridX: ==> " + gridX);
     //console.log("gridY: ==> " + gridY);

    /* ==> getStationsData  
    // Call asyc getStationsData
    // Set State below or check for error
    getStationsData(_gridId, _gridX, _gridY) //;
    .then(async nwsData => {
      if (nwsData.type === "FeatureCollection")
      {
        setNwsStations(nwsData);
        //setNwsStations(JSON.stringify(nwsData));
        console.log(nwsStations);
        console.log("getStationsData (Set State Results) ==> " + nwsData.type);
      }
    })
    .catch(error => {
      console.log(JSON.stringify(error));
    });
   */

    /* ==> getNdbcStationsData  
    // Call asyc getNdbcStationsData
    // Set State below or check for error
    getNdbcStationsData(_mBox_Lat, _mBox_Lng)
    .then(ndbcData => {
      setNdbcStations(ndbcData);
      //console.log(ndbcStations);
      //console.log("getNdbcStationsData (Set State Results)");
    })
    .catch(error => {
      console.log(JSON.stringify(error));
    });
    */

    // Call asyc getStationWindData
    // Set State below or check for error
    getStationWindData(_mBox_Lat, _mBox_Lng)
    .then(windData => {
      setStationWindData(windData);
      console.log("getStationWindData (Set State Results)");
      console.log(stationWindData);
    })
    .catch(error => {
      console.log("ERROR ==> getStationWindData: " + JSON.stringify(error));
    });

    // Add navigation control (the +/- zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on("load", function () {
      // add the data source for new a feature collection with no features
      console.log("map.on('load')");
      //console.log(nwsStations);

      /* NWS Station Data 
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
      */
      

      /* NOAA Station Data 
      map.addSource("ndbc-station-data", {
        type: "geojson",
        data:  ndbcStations
      });

            // now add the layer, and reference the data source above by name
            map.addLayer({
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
      */


       /* Station Wind Data */
      //console.log(stationWindData);
       map.addSource("station-wind-data", {
          type: "geojson",
          data: stationWindData
       }); //.then();

            // now add the layer, and reference the data source above by name
            map.addLayer({
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
            map.on("mouseenter", "station-wind-layer", e => {
              if (e.features.length) {
                map.getCanvas().style.cursor = "pointer";
              }
            });

            // reset cursor to default when user is no longer hovering over a clickable feature
            map.on("mouseleave", "station-wind-layer", () => {
              map.getCanvas().style.cursor = "";
            });
      
          
        
    });

    // map.on('move', () => {

    //  if (map.getLayer("station-wind-layer") != null)
    // //     map.removeLayer("station-wind-layer");


    // });



    // map.on('move', () => {
    //  setLng(map.getCenter().lng.toFixed(4));
    //  setLat(map.getCenter().lat.toFixed(4));
    //  setZoom(map.getZoom().toFixed(2));

    //  console.log("map lat ==> " + map.getCenter().lat.toFixed(4) + "   Map lng==> " + map.getCenter().lng.toFixed(4) );
    //  console.log("lat ==> " + lat + "   lng==> " + lng );
    //  console.log("_mBox_Lat ==> " + _mBox_Lat + "   _mBox_Lng==> " + _mBox_Lng );

    //  var windDataSet =
    //  getStationWindData(map.getCenter().lat, map.getCenter().lng)
    //  .then(async windData => {
    //    setStationWindData(windData);
    //    //console.log(windData);
    //    console.log("map.on('move' == > getStationWindData (Set State Results)");
    //  })
    //  .catch(error => {
    //    console.log("ERROR ==> getStationWindData: " + JSON.stringify(error));
    //  });

    //  // Remove Wind Data
    //  if (map.getLayer("station-wind-layer") != null)
    //     map.removeLayer("station-wind-layer");

    //  if (map.getSource("station-wind-data") != null)     
    //      map.removeSource("station-wind-data");


    //  console.log(stationWindData);

    //  map.addSource("station-wind-data", {
    //   type: "geojson",
    //   data: stationWindData,
    //   //data: stationWindData
    //       // data: await getStationWindData(_mBox_Lat, _mBox_Lng)
    //       //         .then(windData => {
    //       //           //setStationWindData(windData);
    //       //           //console.log(stationWindData);
    //       //           console.log("getStationWindData (Set State Results)");
    //       //         })
    //       //         .catch(error => {
    //       //           console.log("ERROR ==> getStationWindData: " + JSON.stringify(error));
    //       //         }),
    //   });

    //     // now add the layer, and reference the data source above by name
        
    //     map.addLayer({
    //       id: "station-wind-layer",
    //       source: "station-wind-data",
    //       type: "symbol",
    //       layout: {
    //         // full list of icons here: https://labs.mapbox.com/maki-icons
    //         "icon-image": "airport-15", // this icons on our map
    //         "icon-padding": 0,
    //         "icon-allow-overlap": true,
    //         "icon-rotation-alignment": "map",
    //         "icon-rotate":{
    //           "property":"wind_direction",
    //           "stops": [
    //             [30, 30],
    //             [60, 60],
    //             [90, 90],
    //             [120, 120],
    //             [150, 150],
    //             [180, 180],
    //             [210, 210],
    //             [240, 240],
    //             [270, 270],
    //             [300, 300],
    //             [330, 330],
    //             [360, 360]
    //           ],
    //         }
    //       }
    //     });


    //  //getNwsPointsData(map.getCenter().lat, map.getCenter().lng);
    // });

    // Clean up on unmount
    return () => map.remove();
  }, []); //eslint-disable-line; react-hooks/exhaustive-deps
  // <== useEffect

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