import React from "react";
import useSwr, { SWRConfig } from "swr";

const fetcher = (...args) => fetch(...args).then(response => response.json());

const StationsPopup = ({ feature }) => {
  const { id, name, stationIdentifier } = feature.properties;

  const url = `https://api.weather.gov//stations/${stationIdentifier}/observations/latest`;
  const { data, error } = useSwr(url, { fetcher });
  //const stations = data && !error ? data.slice(0, 2000) : [];

  console.log(url);
  console.log(data);
  console.log(error);
  
  if (data != null) {

    var textDescription = data.properties.textDescription;
    var temperature = data.properties.temperature.value;
    var windSpeed = data.properties.windSpeed.value;
    var windGust = data.properties.windGust.value;

    return (
      <div id={`popup-${id}`}>
        <h3>{name}</h3>
        <p>Conditions: {data.properties.textDescription}</p>
        <p>Temp: {data.properties.temperature.value}C</p>
        <p>Wind: {data.properties.windSpeed.value} km/h</p>
        <p>Gusts: {data.properties.windGust.value} km/h</p>
      </div>
    );
  }
  else if (error) {
    return (
      <div id={`error`}>
        <h3>{error}</h3>
      </div>
    );
  } else {
    return (
      <div id={`error`}>
        <p>NWS Data Fetch Error</p>
      </div>
    );
  }
};

export default StationsPopup;