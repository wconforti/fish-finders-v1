// React Custom Hook 
// A custom hook is a JavaScript function with a unique naming convention that 
// requires the function name to start with 
// 'use' and has the ability to call other hooks.

import useSwr from 'swr'
import { useRequestNwsPoints_Swr } from './useRequestNwsPoints_Swr'

const fetcher = (...args) => fetch(...args).then(response => response.json());

export const useRequestNwsStations_Swr = (_mboxLat, _mboxLng) => {

    // Get gridId, gridX and gridY from the mBox_Lat & _mBox_Lon parameters
    const { data: pointsData, error: pointsErrors } = useRequestNwsPoints_Swr(_mboxLat, _mboxLng);

    var _gridId = -'';
    var _gridX = -1;
    var _gridY = -1;

    if (pointsData != null) {
  
      var _gridId = pointsData.properties.gridId;
      var _gridX = pointsData.properties.gridX;
      var _gridY = pointsData.properties.gridY;
    }

    console.log("_gridId:= " + _gridId);
    console.log("_gridX:= " + _gridX);
    console.log("_gridY:= " + _gridY);


    const urlStations = `https://api.weather.gov/gridpoints/${_gridId}/${_gridX},${_gridY}/stations`;
    console.log(urlStations);

    const { data: stationsData, error: stationsError } = useSwr(urlStations, { fetcher });
    //const stations = data && !error ? data.slice(0, 2000) : [];

    //const url = name ? baseUrl + path + '/' + name : baseUrl + path
    //const { data, error } = useSwr(url)

    console.log("stationsData:= " + stationsData);
    console.log("useRequestNwsStations_Swr");

    return { stationsData, stationsError }
}





//import useSwr from 'swr'
//
//const fetcher = (...args) => fetch(...args).then(response => response.json());
//
//export const useRequestNwsStations_Swr  = (gridId, gridX, gridY) => {
//
//    const url = `https://api.weather.gov/gridpoints/${gridId}/${gridX},${gridY}/stations`;
//    const { data, error } = useSwr(url, { fetcher });
//    //const stations = data && !error ? data.slice(0, 2000) : [];

//    //const url = name ? baseUrl + path + '/' + name : baseUrl + path
//    //const { data, error } = useSwr(url)
//
//   return { data, error }
//}