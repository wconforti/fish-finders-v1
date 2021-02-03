import useSwr from 'swr'

export const useRequestNwsPoints_Swr = (_mboxLat, _mboxLng) => {

    const fetcher = (...args) => fetch(...args).then(response => response.json());

    console.log("useRequestNwsPoints_Swr ==> _mboxLat ==> " + _mboxLat);
    console.log("useRequestNwsPoints_Swr ==> _mboxLng ==> " + _mboxLng);

    const urlPoints = `https://api.weather.gov/points/${_mboxLat},${_mboxLng}`;
    const { data: pointsData, error: pointsError } = useSwr(urlPoints, { fetcher });

    //console.log(urlPoints);
    //console.log(pointsData);
    //console.log(pointsError);

    var _gridId = "";
    var _gridX = -1;
    var _gridY = -1;

    if (pointsData != null) {
  
      var _gridId = pointsData.properties.gridId;
      var _gridX = pointsData.properties.gridX;
      var _gridY = pointsData.properties.gridY;
    }

    console.log("useRequestNwsPoints_Swr ==> _gridId:= " + _gridId);
    console.log("useRequestNwsPoints_Swr ==> _gridX:= " + _gridX);
    console.log("useRequestNwsPoints_Swr ==> _gridY:= " + _gridY);

    return { _gridId, _gridX, _gridY };

    //const stations = data && !error ? data.slice(0, 2000) : [];

    //const url = name ? baseUrl + path + '/' + name : baseUrl + path
    //const { data, error } = useSwr(url)

    //console.log("useRequestNwsPoints_Swr");
    //console.log(data);

   //return { pointsData, pointsError }
}